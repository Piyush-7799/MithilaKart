interface DeliveryScooterProps {
  className?: string;
}

export function DeliveryScooterIllustration({ className = "" }: DeliveryScooterProps) {
  return (
    <div className={`delivery-scooter-wrapper ${className}`} aria-hidden="true">
      {/* Background Soft Ambient Aura */}
      <div className="scooter-ambient-aura" />

      {/* Bespoke Vector Scooter & Rider SVG */}
      <svg
        viewBox="0 0 460 290"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="delivery-scooter-svg"
        role="img"
        aria-label="Express Delivery Scooter"
      >
        <defs>
          {/* Mithila Brand Gradients */}
          <linearGradient id="scooterBody" x1="120" y1="160" x2="310" y2="200" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#047857" />
            <stop offset="50%" stopColor="#059669" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          <linearGradient id="scooterGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="60%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="riderHelmet" x1="220" y1="65" x2="275" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#064e3b" />
          </linearGradient>

          <linearGradient id="riderVisor" x1="250" y1="75" x2="275" y2="95" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fde68a" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <linearGradient id="deliveryBox" x1="75" y1="100" x2="160" y2="175" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#fffdf0" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>

          <linearGradient id="headlightBeam" x1="335" y1="136" x2="455" y2="136" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fef08a" stopOpacity="0.5" />
            <stop offset="60%" stopColor="#fef08a" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fef08a" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="tireRubber" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>

          <linearGradient id="wheelRim" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#64748b" />
          </linearGradient>

          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Dynamic Headlight Light Cone */}
        <polygon points="334,134 455,95 455,180 334,142" fill="url(#headlightBeam)" />

        {/* Speed & Airflow Motion Lines */}
        <line x1="25" y1="120" x2="72" y2="120" stroke="#fde68a" strokeWidth="2.5" strokeLinecap="round" opacity="0.65" />
        <line x1="12" y1="142" x2="68" y2="142" stroke="#6ee7b7" strokeWidth="3" strokeLinecap="round" opacity="0.75" />
        <line x1="35" y1="162" x2="80" y2="162" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
        <line x1="20" y1="230" x2="82" y2="230" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" opacity="0.45" />
        <line x1="45" y1="244" x2="98" y2="244" stroke="#a7f3d0" strokeWidth="2" strokeLinecap="round" opacity="0.4" />

        {/* Ground Contact Shadow */}
        <ellipse cx="230" cy="254" rx="165" ry="11" fill="rgba(4, 45, 34, 0.45)" />

        {/* 1. REAR WHEEL */}
        <g id="rear-wheel">
          {/* Tire */}
          <circle cx="125" cy="215" r="36" fill="url(#tireRubber)" stroke="#0f172a" strokeWidth="3" />
          {/* Tread Pattern Ring */}
          <circle cx="125" cy="215" r="30" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 3.5" fill="none" opacity="0.8" />
          {/* Alloy Rim */}
          <circle cx="125" cy="215" r="23" fill="url(#wheelRim)" />
          {/* Inner Hub */}
          <circle cx="125" cy="215" r="14" fill="#1e293b" />
          {/* Center Axle Nut */}
          <circle cx="125" cy="215" r="6" fill="url(#scooterGold)" />
        </g>

        {/* 2. FRONT WHEEL */}
        <g id="front-wheel">
          {/* Tire */}
          <circle cx="335" cy="215" r="36" fill="url(#tireRubber)" stroke="#0f172a" strokeWidth="3" />
          {/* Tread Pattern Ring */}
          <circle cx="335" cy="215" r="30" stroke="#475569" strokeWidth="1.5" strokeDasharray="5 3.5" fill="none" opacity="0.8" />
          {/* Alloy Rim */}
          <circle cx="335" cy="215" r="23" fill="url(#wheelRim)" />
          {/* Inner Hub */}
          <circle cx="335" cy="215" r="14" fill="#1e293b" />
          {/* Center Axle Nut */}
          <circle cx="335" cy="215" r="6" fill="url(#scooterGold)" />
        </g>

        {/* Rear Exhaust Pipe */}
        <path d="M125,224 L78,220 L74,216" stroke="#64748b" strokeWidth="5.5" strokeLinecap="round" />
        <ellipse cx="74" cy="216" rx="2.5" ry="3.5" fill="#334155" />

        {/* Rear Mudguard / Fender */}
        <path d="M93,204 C104,178 142,178 155,198" fill="none" stroke="#047857" strokeWidth="8" strokeLinecap="round" />

        {/* Front Fork & Mudguard */}
        <path d="M335,215 L310,138 L298,138" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
        <path d="M304,188 C314,172 346,172 366,192" fill="none" stroke="#047857" strokeWidth="8" strokeLinecap="round" />

        {/* Main Floorboard & Chassis Underbody */}
        <path d="M148,214 L265,214 C276,214 284,208 288,198 L296,172 L230,172 L160,172 Z" fill="#0f172a" />
        <line x1="165" y1="208" x2="265" y2="208" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />

        {/* Body Main Shell (Emerald Green with highlights) */}
        <path
          d="M136,204 C134,162 172,158 218,160 L230,195 L160,206 Z"
          fill="url(#scooterBody)"
          stroke="#047857"
          strokeWidth="1.5"
        />

        {/* Golden Body Swish */}
        <path d="M148,186 C172,176 198,176 216,184" fill="none" stroke="url(#scooterGold)" strokeWidth="3" strokeLinecap="round" />

        {/* Scooter Seat */}
        <path
          d="M148,158 C158,152 212,150 236,158 C240,163 234,168 222,168 L154,168 C146,168 144,162 148,158 Z"
          fill="#0f172a"
          stroke="#1e293b"
          strokeWidth="1.5"
        />

        {/* Front Aerodynamic Shield / Apron */}
        <path
          d="M278,206 L306,128 C310,116 322,116 328,126 L314,198 C308,208 294,210 278,206 Z"
          fill="url(#scooterBody)"
          stroke="#047857"
          strokeWidth="1.5"
        />
        {/* Front Shield Gold Emblem */}
        <path d="M312,142 L318,154 L306,154 Z" fill="url(#scooterGold)" />

        {/* Handlebar & Stem */}
        <line x1="310" y1="120" x2="304" y2="98" stroke="#cbd5e1" strokeWidth="5.5" strokeLinecap="round" />
        <line x1="294" y1="100" x2="316" y2="96" stroke="#0f172a" strokeWidth="6.5" strokeLinecap="round" />
        {/* Rearview Mirror */}
        <path d="M300,94 L296,80 A5,5 0 1,1 305,78 L302,94" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" />

        {/* Modern LED Headlight */}
        <path d="M322,125 C332,125 338,130 338,136 C338,142 332,147 322,147 Z" fill="#fef08a" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="330" cy="136" r="3.5" fill="#ffffff" />

        {/* 3. INSULATED DELIVERY CARRIER BOX (MithilaKart Branded) */}
        <g id="delivery-box">
          {/* Heavy Duty Box Mounting Rack */}
          <line x1="90" y1="180" x2="90" y2="202" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="135" y1="180" x2="135" y2="198" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
          <line x1="80" y1="180" x2="148" y2="180" stroke="#334155" strokeWidth="5" strokeLinecap="round" />

          {/* Insulated Box Main Body */}
          <rect x="74" y="104" width="82" height="74" rx="10" fill="url(#deliveryBox)" stroke="#d97706" strokeWidth="2.5" />
          {/* Top Lid / Weatherproof Flap */}
          <rect x="71" y="100" width="88" height="13" rx="4" fill="#064e3b" />
          {/* Reflective Warning Stripe */}
          <line x1="77" y1="165" x2="153" y2="165" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 3.5" />

          {/* Branded MithilaKart Box Badge */}
          <rect x="88" y="121" width="54" height="28" rx="6" fill="#064e3b" />
          {/* Fast Delivery Bolt on Box */}
          <path d="M106,125 L99,136 L105,136 L102,145 L113,134 L107,134 Z" fill="#fef08a" />
          {/* Brand Monogram */}
          <text x="113" y="139" fill="#ffffff" fontSize="9" fontWeight="900" fontFamily="system-ui, sans-serif" letterSpacing="0.4">
            MK
          </text>
        </g>

        {/* 4. DELIVERY RIDER */}
        <g id="delivery-rider">
          {/* Rider Legs (in motion) */}
          <path
            d="M212,165 L248,188 L256,212 L242,215 L232,194 L202,172 Z"
            fill="#1e293b"
            stroke="#0f172a"
            strokeWidth="1"
          />
          {/* Riding Shoes */}
          <path d="M242,215 L260,214 C263,214 265,216 264,218 L241,219 Z" fill="#0f172a" />

          {/* Torso & Delivery Jacket */}
          <path
            d="M188,162 L225,158 L252,125 C255,120 248,112 238,115 L198,128 C190,132 185,150 188,162 Z"
            fill="url(#scooterBody)"
            stroke="#047857"
            strokeWidth="1"
          />

          {/* Safety Hi-Vis Stripes */}
          <path d="M208,127 L236,120" stroke="#fef08a" strokeWidth="3.5" strokeLinecap="round" />
          <path d="M198,144 L228,137" stroke="#fef08a" strokeWidth="3.5" strokeLinecap="round" />

          {/* Rider Arm Reaching Handlebars */}
          <path
            d="M236,122 L274,109 L298,100"
            fill="none"
            stroke="#059669"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Gripping Glove */}
          <circle cx="298" cy="100" r="5.5" fill="#0f172a" />

          {/* Courier Backpack Harness Straps */}
          <path d="M202,125 L190,146" stroke="#047857" strokeWidth="4.5" strokeLinecap="round" />

          {/* Neck */}
          <rect x="232" y="98" width="13" height="12" fill="#d97706" rx="2" />

          {/* Helmet with Aerodynamic Visor */}
          <path
            d="M224,96 C219,72 242,62 258,66 C273,70 275,88 271,98 C266,106 250,108 238,105 Z"
            fill="url(#riderHelmet)"
            stroke="#064e3b"
            strokeWidth="1.5"
          />
          {/* Reflective Visor Shield */}
          <path
            d="M256,77 C269,79 276,87 274,95 L255,95 C252,87 250,81 256,77 Z"
            fill="url(#riderVisor)"
            stroke="#d97706"
            strokeWidth="1"
          />
          {/* Helmet Safety Accent */}
          <path d="M234,76 C242,72 254,72 262,75" fill="none" stroke="#fef08a" strokeWidth="2" strokeLinecap="round" />
        </g>
      </svg>

      {/* Floating Quick-Commerce Micro Badges */}
      <div className="scooter-floating-badge scooter-badge-top">
        <span className="scooter-pulse-dot" />
        <span className="scooter-badge-text">⚡ 10–15 Min Delivery</span>
      </div>

      <div className="scooter-floating-badge scooter-badge-bottom">
        <span className="scooter-badge-icon">🏠</span>
        <span className="scooter-badge-text">Direct to Your Kitchen</span>
      </div>
    </div>
  );
}
