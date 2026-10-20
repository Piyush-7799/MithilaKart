/**
 * backend/src/security.test.ts
 *
 * Automated HTTP-level tests for production security hardening:
 * 1. Cookie creation and clearing (SameSite=Lax, HttpOnly, Path=/)
 * 2. Safe request CORS header behavior (exact CLIENT_URL, dev ports, VERCEL_URL, VERCEL_BRANCH_URL)
 * 3. Near-miss and untrusted hostname rejection (no ACAO reflection)
 * 4. Preflight OPTIONS behavior (trusted vs disallowed)
 * 5. Server-side HTTP 403 rejection on state-changing requests with untrusted Origin
 * 6. Non-Origin request preservation for server-to-server and CLI clients
 * 7. Origin normalization (canonical origin matching, trailing-slash & whitespace normalization, unrelated origin rejection)
 */

import assert from "node:assert";
import http from "node:http";
import type { AddressInfo } from "node:net";
import { createApp, isAllowedOrigin } from "./app.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { hashPassword } from "./services/authService.js";

async function runSecurityTests() {
  console.log("Starting security hardening tests...");

  // Preserve environment variables for clean restoration
  const originalVercelUrl = process.env["VERCEL_URL"];
  const originalVercelBranchUrl = process.env["VERCEL_BRANCH_URL"];

  // Mock Prisma user lookup so tests run without requiring a live database
  const originalFindUniqueUser = prisma.user.findUnique;
  const testPassword = "testPassword123";
  const passwordHash = await hashPassword(testPassword);

  interface MockUser {
    id: string;
    fullName: string;
    email: string;
    passwordHash: string;
    role: "CUSTOMER" | "ADMIN";
    createdAt: Date;
    updatedAt: Date;
  }

  function setMock<T, K extends keyof T>(target: T, key: K, value: unknown): void {
    (target as Record<K, unknown>)[key] = value;
  }

  setMock(
    prisma.user,
    "findUnique",
    async ({ where }: { where: { email?: string; id?: string } }): Promise<MockUser | null> => {
      if (where.email === "testuser@example.com") {
        return {
          id: "usr-test-1",
          fullName: "Test User",
          email: "testuser@example.com",
          passwordHash,
          role: "CUSTOMER",
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      return null;
    }
  );

  // Configure simulated Vercel system environment variables for testing
  const simulatedVercelUrl = "mithilakart-preview-123.vercel.app";
  const simulatedBranchUrl = "mithilakart-git-step12.vercel.app";
  process.env["VERCEL_URL"] = simulatedVercelUrl;
  process.env["VERCEL_BRANCH_URL"] = simulatedBranchUrl;

  const app = createApp();
  const server = http.createServer(app);

  await new Promise<void>((resolve) => server.listen(0, resolve));
  const addr = server.address() as AddressInfo;
  const baseUrl = `http://localhost:${addr.port}`;

  try {
    // ── 1. Cookie Creation & Clearing ─────────────────────────────────────────

    // Test 1: POST /api/auth/login sets cookie with SameSite=Lax, HttpOnly, Path=/
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "testuser@example.com",
        password: testPassword,
      }),
    });
    assert.strictEqual(loginRes.status, 200, "Login should succeed with 200");
    const loginCookies = loginRes.headers.get("set-cookie") ?? "";
    assert(
      loginCookies.toLowerCase().includes("samesite=lax"),
      "Login cookie must specify SameSite=Lax"
    );
    assert(
      loginCookies.toLowerCase().includes("httponly"),
      "Login cookie must specify HttpOnly"
    );
    assert(
      loginCookies.includes("Path=/"),
      "Login cookie must specify Path=/"
    );
    assert(
      loginCookies.includes("token="),
      "Login cookie must set the token"
    );
    console.log("✅ Test 1 Passed: Login cookie creation uses SameSite=Lax, HttpOnly, and Path=/");

    // Test 2: POST /api/auth/logout clears cookie with SameSite=Lax, Path=/
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
    });
    assert.strictEqual(logoutRes.status, 200, "Logout should succeed with 200");
    const logoutCookies = logoutRes.headers.get("set-cookie") ?? "";
    assert(
      logoutCookies.toLowerCase().includes("samesite=lax"),
      "Logout cookie must specify SameSite=Lax"
    );
    assert(
      logoutCookies.includes("Path=/"),
      "Logout cookie must specify Path=/"
    );
    assert(
      logoutCookies.includes("token="),
      "Logout cookie must target the token cookie"
    );
    console.log("✅ Test 2 Passed: Logout cookie clearing uses SameSite=Lax and Path=/");

    // ── 2. Safe Request CORS Header Behavior (GET) ─────────────────────────────

    // Test 3: Request without Origin header succeeds without emitting ACAO
    const noOriginRes = await fetch(`${baseUrl}/api/health`);
    assert.strictEqual(noOriginRes.status, 200);
    assert.strictEqual(
      noOriginRes.headers.get("access-control-allow-origin"),
      null,
      "ACAO header must be omitted when Origin header is absent"
    );
    console.log("✅ Test 3 Passed: Safe request without Origin header succeeds with ACAO omitted");

    // Test 4: Request with configured CLIENT_URL emits ACAO and credentials
    const clientUrlRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "http://localhost:5173" },
    });
    assert.strictEqual(clientUrlRes.status, 200);
    assert.strictEqual(
      clientUrlRes.headers.get("access-control-allow-origin"),
      "http://localhost:5173",
      "CLIENT_URL must be reflected in ACAO"
    );
    assert.strictEqual(
      clientUrlRes.headers.get("access-control-allow-credentials"),
      "true",
      "Credentials must be permitted for CLIENT_URL"
    );
    console.log("✅ Test 4 Passed: Configured CLIENT_URL origin emits ACAO with credentials");

    // Test 5: Request with secondary development port (localhost:5174) allowed in dev
    const devPortRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "http://localhost:5174" },
    });
    assert.strictEqual(devPortRes.status, 200);
    assert.strictEqual(
      devPortRes.headers.get("access-control-allow-origin"),
      "http://localhost:5174",
      "Secondary dev port must be reflected in ACAO in dev mode"
    );
    console.log("✅ Test 5 Passed: Secondary dev port origin emits ACAO");

    // Test 6: Request with exact VERCEL_URL emits ACAO
    const vercelUrlRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: `https://${simulatedVercelUrl}` },
    });
    assert.strictEqual(vercelUrlRes.status, 200);
    assert.strictEqual(
      vercelUrlRes.headers.get("access-control-allow-origin"),
      `https://${simulatedVercelUrl}`,
      "Exact VERCEL_URL origin must be reflected in ACAO"
    );
    console.log("✅ Test 6 Passed: Exact VERCEL_URL deployment origin emits ACAO");

    // Test 7: Request with exact VERCEL_BRANCH_URL emits ACAO
    const branchUrlRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: `https://${simulatedBranchUrl}` },
    });
    assert.strictEqual(branchUrlRes.status, 200);
    assert.strictEqual(
      branchUrlRes.headers.get("access-control-allow-origin"),
      `https://${simulatedBranchUrl}`,
      "Exact VERCEL_BRANCH_URL origin must be reflected in ACAO"
    );
    console.log("✅ Test 7 Passed: Exact VERCEL_BRANCH_URL origin emits ACAO");

    // Test 8: Near-miss hostname (e.g. attacker project starting with mithilakart-) rejected
    const nearMissRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "https://mithilakart-attacker.vercel.app" },
    });
    assert.strictEqual(nearMissRes.status, 200, "Safe read proceeds at HTTP level");
    assert.strictEqual(
      nearMissRes.headers.get("access-control-allow-origin"),
      null,
      "Near-miss origin must NOT be reflected in ACAO"
    );
    console.log("✅ Test 8 Passed: Near-miss hostname rejected (no ACAO reflection)");

    // Test 9: Untrusted external domain rejected
    const evilGetRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "https://evil.com" },
    });
    assert.strictEqual(evilGetRes.status, 200);
    assert.strictEqual(
      evilGetRes.headers.get("access-control-allow-origin"),
      null,
      "Untrusted external origin must NOT be reflected in ACAO"
    );
    console.log("✅ Test 9 Passed: Untrusted external origin rejected (no ACAO reflection)");

    // ── 3. Preflight OPTIONS Behavior ──────────────────────────────────────────

    // Test 10: Preflight OPTIONS for exact VERCEL_URL grants CORS access
    const preflightTrustedRes = await fetch(`${baseUrl}/api/orders`, {
      method: "OPTIONS",
      headers: {
        Origin: `https://${simulatedVercelUrl}`,
        "Access-Control-Request-Method": "POST",
      },
    });
    assert.strictEqual(preflightTrustedRes.status, 204, "Preflight must return 204 No Content");
    assert.strictEqual(
      preflightTrustedRes.headers.get("access-control-allow-origin"),
      `https://${simulatedVercelUrl}`
    );
    assert.strictEqual(
      preflightTrustedRes.headers.get("access-control-allow-credentials"),
      "true"
    );
    console.log("✅ Test 10 Passed: Preflight OPTIONS with exact VERCEL_URL grants CORS access");

    // Test 11: Preflight OPTIONS for near-miss origin does NOT grant CORS access
    const preflightNearMissRes = await fetch(`${baseUrl}/api/orders`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://mithilakart-attacker.vercel.app",
        "Access-Control-Request-Method": "POST",
      },
    });
    assert.strictEqual(
      preflightNearMissRes.headers.get("access-control-allow-origin"),
      null,
      "Preflight for near-miss origin must NOT set ACAO"
    );
    console.log("✅ Test 11 Passed: Preflight OPTIONS for near-miss origin denies CORS access");

    // Test 12: Preflight OPTIONS for untrusted origin does NOT grant CORS access
    const preflightEvilRes = await fetch(`${baseUrl}/api/orders`, {
      method: "OPTIONS",
      headers: {
        Origin: "https://evil.com",
        "Access-Control-Request-Method": "POST",
      },
    });
    assert.strictEqual(
      preflightEvilRes.headers.get("access-control-allow-origin"),
      null,
      "Preflight for untrusted external origin must NOT set ACAO"
    );
    console.log("✅ Test 12 Passed: Preflight OPTIONS for untrusted origin denies CORS access");

    // ── 4. Server-Side HTTP 403 Rejection on State-Changing Requests ───────────

    // Test 13: POST /api/auth/logout with near-miss origin rejected with HTTP 403
    const logoutNearMissRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: "https://mithilakart-attacker.vercel.app" },
    });
    assert.strictEqual(
      logoutNearMissRes.status,
      403,
      "State-changing request with near-miss origin must receive HTTP 403"
    );
    const logoutNearMissBody = await logoutNearMissRes.json();
    assert.strictEqual(logoutNearMissBody.status, "error");
    assert.strictEqual(logoutNearMissBody.message, "Forbidden: Origin not allowed");
    assert.strictEqual(
      logoutNearMissRes.headers.get("access-control-allow-origin"),
      null,
      "HTTP 403 rejection must NOT set ACAO"
    );
    console.log("✅ Test 13 Passed: POST /api/auth/logout with near-miss origin rejected with HTTP 403");

    // Test 14: POST /api/auth/logout with untrusted external domain rejected with HTTP 403
    const logoutEvilRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: "https://evil.com" },
    });
    assert.strictEqual(
      logoutEvilRes.status,
      403,
      "State-changing request with untrusted external origin must receive HTTP 403"
    );
    const logoutEvilBody = await logoutEvilRes.json();
    assert.strictEqual(logoutEvilBody.status, "error");
    assert.strictEqual(logoutEvilBody.message, "Forbidden: Origin not allowed");
    console.log("✅ Test 14 Passed: POST /api/auth/logout with untrusted external domain rejected with HTTP 403");

    // Test 15: POST /api/orders with untrusted origin rejected with HTTP 403 before auth
    const orderEvilRes = await fetch(`${baseUrl}/api/orders`, {
      method: "POST",
      headers: {
        Origin: "https://evil.com",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ items: [] }),
    });
    assert.strictEqual(
      orderEvilRes.status,
      403,
      "State-changing request to /api/orders with untrusted origin must receive HTTP 403"
    );
    const orderEvilBody = await orderEvilRes.json();
    assert.strictEqual(orderEvilBody.status, "error");
    assert.strictEqual(orderEvilBody.message, "Forbidden: Origin not allowed");
    console.log("✅ Test 15 Passed: POST /api/orders with untrusted origin rejected with HTTP 403");

    // Test 16: POST without Origin header succeeds (preserves CLI & server-to-server)
    const logoutNoOriginRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
    });
    assert.strictEqual(
      logoutNoOriginRes.status,
      200,
      "POST without Origin header must be allowed for server-to-server/CLI clients"
    );
    const logoutNoOriginBody = await logoutNoOriginRes.json();
    assert.strictEqual(logoutNoOriginBody.status, "ok");
    console.log("✅ Test 16 Passed: State-changing POST without Origin header allowed (CLI/server-to-server)");

    // ── 5. Origin Normalization (Trailing Slashes & Whitespace) ────────────────

    // Test 17: Unit-level verification of isAllowedOrigin
    // Canonical origin matching
    assert.strictEqual(isAllowedOrigin(env.CLIENT_URL), true, "Canonical origin must be allowed");
    // Trailing-slash normalization
    assert.strictEqual(isAllowedOrigin(`${env.CLIENT_URL}/`), true, "Origin with trailing slash must be allowed");
    assert.strictEqual(isAllowedOrigin(`${env.CLIENT_URL}///`), true, "Origin with multiple trailing slashes must be allowed");
    // Whitespace normalization
    assert.strictEqual(isAllowedOrigin(`  ${env.CLIENT_URL}  `), true, "Origin with leading/trailing whitespace must be allowed");
    assert.strictEqual(isAllowedOrigin(`  ${env.CLIENT_URL}/  `), true, "Origin with whitespace and trailing slash must be allowed");
    // Rejection of unrelated origins (with or without trailing slash/whitespace)
    assert.strictEqual(isAllowedOrigin("https://evil.com"), false, "Unrelated origin must be rejected");
    assert.strictEqual(isAllowedOrigin("https://evil.com/"), false, "Unrelated origin with trailing slash must be rejected");
    assert.strictEqual(isAllowedOrigin("  https://evil.com/  "), false, "Unrelated origin with whitespace must be rejected");
    assert.strictEqual(isAllowedOrigin("https://mithilakart-attacker.vercel.app"), false, "Near-miss origin must be rejected");
    // Rejection of whitespace-only / empty strings
    assert.strictEqual(isAllowedOrigin("   "), false, "Whitespace-only origin must be rejected");
    console.log("✅ Test 17 Passed: isAllowedOrigin canonical matching, trailing-slash & whitespace normalization, and rejection verified");

    // Test 18: Safe request (GET) with trailing-slash Origin emits ACAO
    const trailingSlashRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "http://localhost:5173/" },
    });
    assert.strictEqual(trailingSlashRes.status, 200);
    assert.strictEqual(
      trailingSlashRes.headers.get("access-control-allow-origin"),
      "http://localhost:5173/",
      "Trailing-slash Origin must be accepted and reflected"
    );
    console.log("✅ Test 18 Passed: Safe request with trailing-slash Origin emits ACAO");

    // Test 19: Safe request (GET) with whitespace-padded Origin emits ACAO
    const whitespaceRes = await fetch(`${baseUrl}/api/health`, {
      headers: { Origin: "  http://localhost:5173  " },
    });
    assert.strictEqual(whitespaceRes.status, 200);
    assert.strictEqual(
      whitespaceRes.headers.get("access-control-allow-origin"),
      "http://localhost:5173",
      "Whitespace-padded Origin must be accepted and reflected"
    );
    console.log("✅ Test 19 Passed: Safe request with whitespace-padded Origin emits ACAO");

    // Test 20: State-changing POST with trailing-slash Origin succeeds (not rejected with HTTP 403)
    const logoutTrailingRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: "http://localhost:5173/" },
    });
    assert.strictEqual(logoutTrailingRes.status, 200, "State-changing POST with trailing-slash origin must succeed");
    const logoutTrailingBody = await logoutTrailingRes.json();
    assert.strictEqual(logoutTrailingBody.status, "ok");
    console.log("✅ Test 20 Passed: State-changing POST with trailing-slash Origin succeeds");

    // Test 21: State-changing POST with whitespace-padded Origin succeeds (not rejected with HTTP 403)
    const logoutWhitespaceRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: "  http://localhost:5173  " },
    });
    assert.strictEqual(logoutWhitespaceRes.status, 200, "State-changing POST with whitespace-padded origin must succeed");
    const logoutWhitespaceBody = await logoutWhitespaceRes.json();
    assert.strictEqual(logoutWhitespaceBody.status, "ok");
    console.log("✅ Test 21 Passed: State-changing POST with whitespace-padded Origin succeeds");

    // Test 22: State-changing POST with untrusted origin containing trailing slash rejected with HTTP 403
    const logoutEvilSlashRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: "POST",
      headers: { Origin: "https://evil.com/" },
    });
    assert.strictEqual(logoutEvilSlashRes.status, 403, "Untrusted origin with trailing slash must receive HTTP 403");
    const logoutEvilSlashBody = await logoutEvilSlashRes.json();
    assert.strictEqual(logoutEvilSlashBody.status, "error");
    assert.strictEqual(logoutEvilSlashBody.message, "Forbidden: Origin not allowed");
    console.log("✅ Test 22 Passed: State-changing POST with untrusted trailing-slash origin rejected with HTTP 403");

    console.log("\nAll 22 security hardening tests passed successfully!");
  } finally {
    // Restore environment variables
    if (originalVercelUrl !== undefined) {
      process.env["VERCEL_URL"] = originalVercelUrl;
    } else {
      delete process.env["VERCEL_URL"];
    }
    if (originalVercelBranchUrl !== undefined) {
      process.env["VERCEL_BRANCH_URL"] = originalVercelBranchUrl;
    } else {
      delete process.env["VERCEL_BRANCH_URL"];
    }

    // Restore Prisma mocks and close server cleanly
    setMock(prisma.user, "findUnique", originalFindUniqueUser);
    server.close();
  }
}

runSecurityTests().catch((err) => {
  console.error("❌ Security test failed:", err);
  process.exit(1);
});
