import { useState, useMemo, useCallback } from "react";
import {
  LayoutDashboard,
  ClipboardList,
  ShoppingBag,
  Boxes,
  Users,
  BarChart3,
  ArrowLeft,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  RotateCcw,
  Eye,
  Check,
  MapPin,
  TrendingUp,
  Package,
  Sparkles,
} from "lucide-react";
import type { Order, OrderStatus, Product, UserProfile, Address } from "../types";
import { CATEGORIES } from "../data/products";

export type AdminTab = "overview" | "orders" | "products" | "inventory" | "customers" | "analytics";

export interface AdminDashboardProps {
  onBackToStore: () => void;
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onViewOrderDetails: (order: Order) => void;
  products: Product[];
  onToggleProductAvailability: (productId: string, isAvailable: boolean) => void;
  userProfile: UserProfile | null;
  savedAddresses: Address[];
  cartCount: number;
}

const ALL_ORDER_STATUSES: OrderStatus[] = [
  "Placed",
  "Confirmed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

function getStatusBadgeClass(status: OrderStatus): string {
  switch (status) {
    case "Placed":
      return "status-badge-placed";
    case "Confirmed":
      return "status-badge-confirmed";
    case "Preparing":
      return "status-badge-preparing";
    case "Out for Delivery":
      return "status-badge-out-for-delivery";
    case "Delivered":
      return "status-badge-delivered";
    case "Cancelled":
      return "status-badge-cancelled";
    default:
      return "status-badge-placed";
  }
}

function getStatusIcon(status: OrderStatus) {
  switch (status) {
    case "Placed":
      return <Clock size={13} />;
    case "Confirmed":
      return <CheckCircle2 size={13} />;
    case "Preparing":
      return <Package size={13} />;
    case "Out for Delivery":
      return <Truck size={13} />;
    case "Delivered":
      return <CheckCircle2 size={13} />;
    case "Cancelled":
      return <XCircle size={13} />;
  }
}

function formatAdminDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoString;
  }
}

export function AdminDashboard({
  onBackToStore,
  orders,
  onUpdateOrderStatus,
  onViewOrderDetails,
  products,
  onToggleProductAvailability,
  userProfile,
  savedAddresses,
  cartCount,
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("overview");
  const [adminToast, setAdminToast] = useState<string | null>(null);

  // Orders Tab filters
  const [orderSearch, setOrderSearch] = useState("");
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("All");
  const [orderSort, setOrderSort] = useState<"newest" | "oldest">("newest");

  // Products Tab filters
  const [productSearch, setProductSearch] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const [productAvailabilityFilter, setProductAvailabilityFilter] = useState<"all" | "available" | "unavailable">("all");

  // Inventory Tab filters
  const [inventorySearch, setInventorySearch] = useState("");
  const [inventoryFilter, setInventoryFilter] = useState<"all" | "available" | "unavailable">("all");

  // Helper toast notification
  const showToast = useCallback((msg: string) => {
    setAdminToast(msg);
    setTimeout(() => {
      setAdminToast((curr) => (curr === msg ? null : curr));
    }, 3200);
  }, []);

  // ----------------------------------------------------------------------
  // Calculated Metrics from actual local data
  // ----------------------------------------------------------------------
  const totalProductsCount = products.length;
  const totalOrdersCount = orders.length;
  const deliveredOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "Delivered").length,
    [orders]
  );
  const pendingOrdersCount = useMemo(
    () => orders.filter((o) => o.status !== "Delivered" && o.status !== "Cancelled").length,
    [orders]
  );
  const cancelledOrdersCount = useMemo(
    () => orders.filter((o) => o.status === "Cancelled").length,
    [orders]
  );
  const totalOrderRevenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.total || 0), 0),
    [orders]
  );

  const unavailableProductsCount = useMemo(() => {
    return products.filter((p) => p.isAvailable === false).length;
  }, [products]);

  const availableProductsCount = Math.max(0, totalProductsCount - unavailableProductsCount);
  const availabilityPercentage = totalProductsCount > 0
    ? Math.round((availableProductsCount / totalProductsCount) * 100)
    : 100;

  // ----------------------------------------------------------------------
  // Filtered Orders
  // ----------------------------------------------------------------------
  const filteredOrders = useMemo(() => {
    const query = orderSearch.trim().toLowerCase();

    const list = orders.filter((order) => {
      // Status match
      if (orderStatusFilter !== "All" && order.status !== orderStatusFilter) {
        return false;
      }
      // Query match (order ID, customer name, city, phone)
      if (query) {
        const idMatch = order.id.toLowerCase().includes(query);
        const nameMatch = order.address.fullName.toLowerCase().includes(query);
        const cityMatch = order.address.city.toLowerCase().includes(query);
        const phoneMatch = order.address.phone ? order.address.phone.includes(query) : false;
        return idMatch || nameMatch || cityMatch || phoneMatch;
      }
      return true;
    });

    return list.sort((a, b) => {
      const timeA = new Date(a.createdAt).getTime();
      const timeB = new Date(b.createdAt).getTime();
      return orderSort === "newest" ? timeB - timeA : timeA - timeB;
    });
  }, [orders, orderSearch, orderStatusFilter, orderSort]);

  // ----------------------------------------------------------------------
  // Filtered Products
  // ----------------------------------------------------------------------
  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase();

    return products.filter((p) => {
      // Category match
      if (productCategoryFilter !== "All" && p.category !== productCategoryFilter) {
        return false;
      }
      // Availability filter
      const isAvailable = p.isAvailable ?? false;
      if (productAvailabilityFilter === "available" && !isAvailable) {
        return false;
      }
      if (productAvailabilityFilter === "unavailable" && isAvailable) {
        return false;
      }
      // Search query
      if (query) {
        const nameMatch = p.name.toLowerCase().includes(query);
        const catMatch = p.category.toLowerCase().includes(query);
        return nameMatch || catMatch;
      }
      return true;
    });
  }, [products, productCategoryFilter, productAvailabilityFilter, productSearch]);

  // ----------------------------------------------------------------------
  // Filtered Inventory
  // ----------------------------------------------------------------------
  const filteredInventory = useMemo(() => {
    const query = inventorySearch.trim().toLowerCase();

    return products.filter((p) => {
      const isAvailable = p.isAvailable ?? false;
      if (inventoryFilter === "available" && !isAvailable) return false;
      if (inventoryFilter === "unavailable" && isAvailable) return false;

      if (query) {
        return (
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [products, inventoryFilter, inventorySearch]);

  // ----------------------------------------------------------------------
  // Analytics Data from actual orders
  // ----------------------------------------------------------------------
  const statusCounts = useMemo(() => {
    const counts: Record<OrderStatus, number> = {
      Placed: 0,
      Confirmed: 0,
      Preparing: 0,
      "Out for Delivery": 0,
      Delivered: 0,
      Cancelled: 0,
    };
    orders.forEach((o) => {
      if (counts[o.status] !== undefined) {
        counts[o.status]++;
      }
    });
    return counts;
  }, [orders]);

  const ordersOverTime = useMemo(() => {
    if (orders.length === 0) return [];
    const dateMap: Record<string, number> = {};
    orders.forEach((o) => {
      try {
        const d = new Date(o.createdAt);
        const key = d.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
        });
        dateMap[key] = (dateMap[key] || 0) + 1;
      } catch {
        // ignore invalid dates
      }
    });

    return Object.entries(dateMap).map(([dateLabel, count]) => ({
      dateLabel,
      count,
    }));
  }, [orders]);

  const paymentMethodCounts = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => {
      const method = o.paymentMethod || "Cash on Delivery";
      map[method] = (map[method] || 0) + 1;
    });
    return map;
  }, [orders]);

  // ----------------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------------
  const handleStatusChange = (orderId: string, newStatus: OrderStatus) => {
    onUpdateOrderStatus(orderId, newStatus);
    showToast(`Order ${orderId} marked as "${newStatus}"`);
  };

  const handleToggleProduct = (productId: string, currentAvailable: boolean) => {
    onToggleProductAvailability(productId, !currentAvailable);
    showToast(
      !currentAvailable
        ? `Product is now marked Available`
        : `Product is now marked Out of Stock`
    );
  };

  return (
    <div className="admin-root">
      {/* ------------------------------------------------------------------ */}
      {/* Top Admin Header */}
      {/* ------------------------------------------------------------------ */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-header-left">
            <button
              type="button"
              className="admin-back-btn"
              onClick={onBackToStore}
              aria-label="Back to Storefront"
              title="Return to MithilaKart customer storefront"
            >
              <ArrowLeft size={16} />
              <span>Back to Store</span>
            </button>

            <div className="admin-brand-stack">
              <div className="admin-brand-row">
                <h1 className="admin-brand-title">MithilaKart Admin</h1>
                <span className="admin-env-badge" title="Local browser storage mode">
                  Local Admin / Development
                </span>
              </div>
              <p className="admin-brand-desc">
                Quick-commerce local operations, order management & catalogue controls
              </p>
            </div>
          </div>

          <div className="admin-header-right">
            <div className="admin-store-status-pill" title="Local system active">
              <span className="status-dot" aria-hidden="true" />
              <span>Dark Store: Darbhanga Hub</span>
            </div>
          </div>
        </div>

        {/* Responsive Admin Tabs Navigation */}
        <nav className="admin-nav-bar" aria-label="Admin Dashboard Navigation">
          <div className="admin-nav-tabs">
            <button
              type="button"
              className={`admin-nav-tab ${activeTab === "overview" ? "admin-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("overview")}
              aria-current={activeTab === "overview" ? "page" : undefined}
            >
              <LayoutDashboard size={16} />
              <span>Overview</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === "orders" ? "admin-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("orders")}
              aria-current={activeTab === "orders" ? "page" : undefined}
            >
              <ClipboardList size={16} />
              <span>Orders</span>
              {orders.length > 0 && <span className="admin-tab-count">{orders.length}</span>}
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === "products" ? "admin-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("products")}
              aria-current={activeTab === "products" ? "page" : undefined}
            >
              <ShoppingBag size={16} />
              <span>Products</span>
              <span className="admin-tab-count">{totalProductsCount}</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === "inventory" ? "admin-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("inventory")}
              aria-current={activeTab === "inventory" ? "page" : undefined}
            >
              <Boxes size={16} />
              <span>Inventory</span>
              {unavailableProductsCount > 0 && (
                <span className="admin-tab-count admin-tab-count-alert">
                  {unavailableProductsCount}
                </span>
              )}
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === "customers" ? "admin-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("customers")}
              aria-current={activeTab === "customers" ? "page" : undefined}
            >
              <Users size={16} />
              <span>Customers</span>
            </button>

            <button
              type="button"
              className={`admin-nav-tab ${activeTab === "analytics" ? "admin-nav-tab-active" : ""}`}
              onClick={() => setActiveTab("analytics")}
              aria-current={activeTab === "analytics" ? "page" : undefined}
            >
              <BarChart3 size={16} />
              <span>Analytics</span>
            </button>
          </div>
        </nav>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Main Admin View Content */}
      {/* ------------------------------------------------------------------ */}
      <main className="admin-main-container">
        {/* Development Environment Disclaimer Banner */}
        <div className="admin-dev-notice" role="status">
          <div className="admin-dev-notice-icon">
            <Sparkles size={16} />
          </div>
          <div className="admin-dev-notice-text">
            <strong>Development Environment (Phase 22):</strong> Showing verified local browser
            state. Order status updates and product availability toggles are persisted in
            versioned localStorage and immediately sync with the customer storefront.
          </div>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* TAB 1: OVERVIEW */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === "overview" && (
          <div className="admin-section-stack">
            {/* Metric Summary Cards */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Total Products</span>
                  <div className="admin-metric-icon-box metric-icon-emerald">
                    <ShoppingBag size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{totalProductsCount}</div>
                <div className="admin-metric-meta">Active catalogue items</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Total Orders</span>
                  <div className="admin-metric-icon-box metric-icon-gold">
                    <ClipboardList size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{totalOrdersCount}</div>
                <div className="admin-metric-meta">
                  {totalOrdersCount === 1 ? "1 local order placed" : `${totalOrdersCount} local orders placed`}
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Delivered Orders</span>
                  <div className="admin-metric-icon-box metric-icon-teal">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{deliveredOrdersCount}</div>
                <div className="admin-metric-meta">Fulfilled orders</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Pending Orders</span>
                  <div className="admin-metric-icon-box metric-icon-amber">
                    <Clock size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{pendingOrdersCount}</div>
                <div className="admin-metric-meta">In processing / transit</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Saved Addresses / Profile</span>
                  <div className="admin-metric-icon-box metric-icon-blue">
                    <Users size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{savedAddresses.length}</div>
                <div className="admin-metric-meta">
                  {userProfile ? `1 profile (${userProfile.fullName})` : "No profile saved"}
                </div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Active Cart Items</span>
                  <div className="admin-metric-icon-box metric-icon-purple">
                    <Package size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{cartCount}</div>
                <div className="admin-metric-meta">Currently in shopper cart</div>
              </div>

              <div className="admin-metric-card admin-metric-card-highlight">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Local Order Volume</span>
                  <div className="admin-metric-icon-box metric-icon-gold">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">₹{totalOrderRevenue}</div>
                <div className="admin-metric-meta">Calculated from actual local orders</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Catalogue Availability</span>
                  <div className="admin-metric-icon-box metric-icon-emerald">
                    <Boxes size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{availabilityPercentage}%</div>
                <div className="admin-metric-meta">
                  {availableProductsCount} of {totalProductsCount} available
                </div>
              </div>
            </div>

            {/* Quick Status Cards / Recent Orders */}
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <h2 className="admin-panel-title">Recent Orders</h2>
                  <p className="admin-panel-desc">Latest local operations orders</p>
                </div>
                <button
                  type="button"
                  className="admin-link-btn"
                  onClick={() => setActiveTab("orders")}
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="admin-empty-state">
                  <ClipboardList size={36} className="admin-empty-icon" />
                  <h3 className="admin-empty-title">No orders placed yet</h3>
                  <p className="admin-empty-desc">
                    Go to the storefront, add items to cart, and place an order to see it appear
                    here in real-time.
                  </p>
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={onBackToStore}
                  >
                    Open Storefront
                  </button>
                </div>
              ) : (
                <div className="admin-table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Order ID</th>
                        <th>Date & Time</th>
                        <th>Customer</th>
                        <th>City</th>
                        <th>Items</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.slice(0, 5).map((order) => (
                        <tr key={order.id}>
                          <td>
                            <span className="admin-order-id-badge">{order.id}</span>
                          </td>
                          <td className="admin-table-muted">
                            {formatAdminDate(order.createdAt)}
                          </td>
                          <td>
                            <strong className="admin-customer-name">
                              {order.address.fullName}
                            </strong>
                          </td>
                          <td>{order.address.city}</td>
                          <td>
                            {order.items.reduce((s, i) => s + i.quantity, 0)} items
                          </td>
                          <td>
                            <strong>₹{order.total}</strong>
                          </td>
                          <td>
                            <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                              {getStatusIcon(order.status)}
                              <span>{order.status}</span>
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="admin-action-btn"
                              onClick={() => onViewOrderDetails(order)}
                              title="View details"
                              aria-label={`View details of order ${order.id}`}
                            >
                              <Eye size={14} />
                              <span>Details</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Catalogue Quick Health */}
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <h2 className="admin-panel-title">Catalogue Stock Health</h2>
                  <p className="admin-panel-desc">
                    Real availability state based on admin overrides
                  </p>
                </div>
                <button
                  type="button"
                  className="admin-link-btn"
                  onClick={() => setActiveTab("inventory")}
                >
                  Manage Inventory →
                </button>
              </div>

              <div className="admin-progress-block">
                <div className="admin-progress-labels">
                  <span>Available Products: {availableProductsCount}</span>
                  <span>Out of Stock: {unavailableProductsCount}</span>
                </div>
                <div className="admin-progress-track">
                  <div
                    className="admin-progress-fill"
                    style={{ width: `${availabilityPercentage}%` }}
                    aria-label={`Availability ${availabilityPercentage}%`}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 2: ORDERS */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === "orders" && (
          <div className="admin-section-stack">
            {/* Filter and Search Bar */}
            <div className="admin-toolbar-card">
              <div className="admin-toolbar-search">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search by order ID, customer name, city, phone..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  aria-label="Search orders"
                />
              </div>

              <div className="admin-toolbar-filters">
                <div className="admin-filter-group">
                  <label htmlFor="order-status-select" className="admin-filter-label">
                    Status:
                  </label>
                  <select
                    id="order-status-select"
                    className="admin-select"
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                  >
                    <option value="All">All Statuses ({orders.length})</option>
                    {ALL_ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status} ({orders.filter((o) => o.status === status).length})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filter-group">
                  <label htmlFor="order-sort-select" className="admin-filter-label">
                    Sort:
                  </label>
                  <select
                    id="order-sort-select"
                    className="admin-select"
                    value={orderSort}
                    onChange={(e) => setOrderSort(e.target.value as "newest" | "oldest")}
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Orders List / Table */}
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <h2 className="admin-panel-title">
                    Orders ({filteredOrders.length})
                  </h2>
                  <p className="admin-panel-desc">
                    Change order status directly to test customer order tracking
                  </p>
                </div>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="admin-empty-state">
                  <ClipboardList size={36} className="admin-empty-icon" />
                  <h3 className="admin-empty-title">No orders found</h3>
                  <p className="admin-empty-desc">
                    {orderSearch || orderStatusFilter !== "All"
                      ? "Try changing your search keywords or status filter."
                      : "No local orders have been placed yet."}
                  </p>
                  {(orderSearch || orderStatusFilter !== "All") && (
                    <button
                      type="button"
                      className="admin-secondary-btn"
                      onClick={() => {
                        setOrderSearch("");
                        setOrderStatusFilter("All");
                      }}
                    >
                      Reset Filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="admin-table-container admin-table-desktop">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Date</th>
                          <th>Customer</th>
                          <th>City</th>
                          <th>Items</th>
                          <th>Total</th>
                          <th>Payment</th>
                          <th>Status (Live Update)</th>
                          <th>ETA</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order) => (
                          <tr key={order.id}>
                            <td>
                              <span className="admin-order-id-badge">{order.id}</span>
                            </td>
                            <td className="admin-table-muted">
                              {formatAdminDate(order.createdAt)}
                            </td>
                            <td>
                              <div className="admin-user-cell">
                                <span className="admin-user-name">{order.address.fullName}</span>
                                {order.address.phone && (
                                  <span className="admin-user-sub">{order.address.phone}</span>
                                )}
                              </div>
                            </td>
                            <td>{order.address.city}</td>
                            <td>
                              <span className="admin-item-count">
                                {order.items.reduce((s, i) => s + i.quantity, 0)} items
                              </span>
                            </td>
                            <td>
                              <strong>₹{order.total}</strong>
                            </td>
                            <td className="admin-table-muted">
                              {order.paymentMethod || "Cash on Delivery"}
                            </td>
                            <td>
                              <div className="admin-status-dropdown-wrap">
                                <select
                                  className={`admin-status-select ${getStatusBadgeClass(order.status)}`}
                                  value={order.status}
                                  onChange={(e) =>
                                    handleStatusChange(order.id, e.target.value as OrderStatus)
                                  }
                                  aria-label={`Change status for order ${order.id}`}
                                >
                                  {ALL_ORDER_STATUSES.map((st) => (
                                    <option key={st} value={st}>
                                      {st}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </td>
                            <td className="admin-table-muted">
                              {order.estimatedDelivery || order.deliveryEta}
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-action-btn"
                                onClick={() => onViewOrderDetails(order)}
                                aria-label={`View full details of order ${order.id}`}
                              >
                                <Eye size={14} />
                                <span>Details</span>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile & Tablet Card View */}
                  <div className="admin-orders-card-grid admin-cards-mobile">
                    {filteredOrders.map((order) => (
                      <div key={order.id} className="admin-order-mobile-card">
                        <div className="admin-order-card-top">
                          <span className="admin-order-id-badge">{order.id}</span>
                          <span className="admin-order-date">
                            {formatAdminDate(order.createdAt)}
                          </span>
                        </div>

                        <div className="admin-order-card-body">
                          <div className="admin-card-row">
                            <span className="admin-card-label">Customer:</span>
                            <span className="admin-card-val">
                              {order.address.fullName} ({order.address.city})
                            </span>
                          </div>

                          <div className="admin-card-row">
                            <span className="admin-card-label">Items & Total:</span>
                            <span className="admin-card-val">
                              {order.items.reduce((s, i) => s + i.quantity, 0)} items • ₹{order.total}
                            </span>
                          </div>

                          <div className="admin-card-row">
                            <span className="admin-card-label">Payment:</span>
                            <span className="admin-card-val">
                              {order.paymentMethod || "Cash on Delivery"}
                            </span>
                          </div>

                          <div className="admin-card-row admin-card-status-row">
                            <span className="admin-card-label">Status:</span>
                            <select
                              className={`admin-status-select ${getStatusBadgeClass(order.status)}`}
                              value={order.status}
                              onChange={(e) =>
                                handleStatusChange(order.id, e.target.value as OrderStatus)
                              }
                              aria-label={`Change status for order ${order.id}`}
                            >
                              {ALL_ORDER_STATUSES.map((st) => (
                                <option key={st} value={st}>
                                  {st}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="admin-order-card-bottom">
                          <button
                            type="button"
                            className="admin-mobile-details-btn"
                            onClick={() => onViewOrderDetails(order)}
                          >
                            <Eye size={15} />
                            <span>View Full Order Details</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 3: PRODUCTS */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === "products" && (
          <div className="admin-section-stack">
            {/* Products Toolbar */}
            <div className="admin-toolbar-card">
              <div className="admin-toolbar-search">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Search catalogue by product name or category..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  aria-label="Search products"
                />
              </div>

              <div className="admin-toolbar-filters">
                <div className="admin-filter-group">
                  <label htmlFor="prod-category-select" className="admin-filter-label">
                    Category:
                  </label>
                  <select
                    id="prod-category-select"
                    className="admin-select"
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                  >
                    <option value="All">All Categories ({products.length})</option>
                    {CATEGORIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-filter-group">
                  <label htmlFor="prod-avail-select" className="admin-filter-label">
                    Availability:
                  </label>
                  <select
                    id="prod-avail-select"
                    className="admin-select"
                    value={productAvailabilityFilter}
                    onChange={(e) =>
                      setProductAvailabilityFilter(
                        e.target.value as "all" | "available" | "unavailable"
                      )
                    }
                  >
                    <option value="all">All ({products.length})</option>
                    <option value="available">In Stock ({availableProductsCount})</option>
                    <option value="unavailable">Out of Stock ({unavailableProductsCount})</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Products Table / Cards */}
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <h2 className="admin-panel-title">
                    Catalogue Products ({filteredProducts.length})
                  </h2>
                  <p className="admin-panel-desc">
                    Toggle product availability. Changes immediately reflect in storefront cards & modals.
                  </p>
                </div>
              </div>

              {filteredProducts.length === 0 ? (
                <div className="admin-empty-state">
                  <ShoppingBag size={36} className="admin-empty-icon" />
                  <h3 className="admin-empty-title">No products found</h3>
                  <p className="admin-empty-desc">
                    Try adjusting your search query or category filters.
                  </p>
                </div>
              ) : (
                <>
                  {/* Desktop Table View */}
                  <div className="admin-table-container admin-table-desktop">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Image</th>
                          <th>Product Name</th>
                          <th>Category</th>
                          <th>Unit</th>
                          <th>Price / MRP</th>
                          <th>Discount</th>
                          <th>Availability Status</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProducts.map((product) => {
                          const isAvailable = product.isAvailable ?? false;
                          const discount =
                            product.mrp > product.price
                              ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                              : 0;

                          return (
                            <tr key={product.id}>
                              <td>
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="admin-product-thumb"
                                  loading="lazy"
                                />
                              </td>
                              <td>
                                <div className="admin-prod-info">
                                  <strong className="admin-prod-name">{product.name}</strong>
                                  {product.isMithilaSpecial && (
                                    <span className="admin-special-tag">Mithila Special</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <span className="admin-cat-pill">{product.category}</span>
                              </td>
                              <td className="admin-table-muted">{product.unit}</td>
                              <td>
                                <div className="admin-price-cell">
                                  <strong>₹{product.price}</strong>
                                  {product.mrp > product.price && (
                                    <span className="admin-mrp-strike">₹{product.mrp}</span>
                                  )}
                                </div>
                              </td>
                              <td>
                                {discount > 0 ? (
                                  <span className="admin-discount-badge">{discount}% OFF</span>
                                ) : (
                                  <span className="admin-table-muted">—</span>
                                )}
                              </td>
                              <td>
                                {isAvailable ? (
                                  <span className="admin-stock-badge admin-stock-available">
                                    <Check size={12} /> In Stock
                                  </span>
                                ) : (
                                  <span className="admin-stock-badge admin-stock-unavailable">
                                    <XCircle size={12} /> Out of Stock
                                  </span>
                                )}
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className={`admin-toggle-btn ${
                                    isAvailable ? "admin-toggle-btn-danger" : "admin-toggle-btn-success"
                                  }`}
                                  onClick={() => handleToggleProduct(product.id, isAvailable)}
                                  aria-label={
                                    isAvailable
                                      ? `Mark ${product.name} as out of stock`
                                      : `Mark ${product.name} as available`
                                  }
                                >
                                  {isAvailable ? "Mark Out of Stock" : "Mark Available"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Mobile Product Cards */}
                  <div className="admin-product-mobile-grid admin-cards-mobile">
                    {filteredProducts.map((product) => {
                      const isAvailable = product.isAvailable ?? false;
                      const discount =
                        product.mrp > product.price
                          ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                          : 0;

                      return (
                        <div key={product.id} className="admin-product-mobile-card">
                          <div className="admin-prod-card-top">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="admin-product-card-img"
                              loading="lazy"
                            />
                            <div className="admin-prod-card-meta">
                              <h3 className="admin-prod-card-title">{product.name}</h3>
                              <span className="admin-cat-pill">{product.category}</span>
                              <div className="admin-prod-card-pricing">
                                <strong>₹{product.price}</strong>
                                {product.mrp > product.price && (
                                  <span className="admin-mrp-strike">₹{product.mrp}</span>
                                )}
                                {discount > 0 && (
                                  <span className="admin-discount-badge">{discount}% OFF</span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="admin-prod-card-bottom">
                            <div>
                              {isAvailable ? (
                                <span className="admin-stock-badge admin-stock-available">
                                  <Check size={12} /> In Stock
                                </span>
                              ) : (
                                <span className="admin-stock-badge admin-stock-unavailable">
                                  <XCircle size={12} /> Out of Stock
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              className={`admin-toggle-btn ${
                                isAvailable ? "admin-toggle-btn-danger" : "admin-toggle-btn-success"
                              }`}
                              onClick={() => handleToggleProduct(product.id, isAvailable)}
                            >
                              {isAvailable ? "Mark Out of Stock" : "Mark Available"}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 4: INVENTORY */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === "inventory" && (
          <div className="admin-section-stack">
            {/* Inventory Metric Cards */}
            <div className="admin-metrics-grid">
              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Catalogue Products</span>
                  <div className="admin-metric-icon-box metric-icon-emerald">
                    <Boxes size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{totalProductsCount}</div>
                <div className="admin-metric-meta">Total monitored items</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Available Products</span>
                  <div className="admin-metric-icon-box metric-icon-teal">
                    <CheckCircle2 size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{availableProductsCount}</div>
                <div className="admin-metric-meta">Ready for dark store dispatch</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Out of Stock</span>
                  <div className="admin-metric-icon-box metric-icon-amber">
                    <AlertCircle size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{unavailableProductsCount}</div>
                <div className="admin-metric-meta">Unavailable for ordering</div>
              </div>

              <div className="admin-metric-card">
                <div className="admin-metric-header">
                  <span className="admin-metric-title">Availability Rate</span>
                  <div className="admin-metric-icon-box metric-icon-gold">
                    <TrendingUp size={18} />
                  </div>
                </div>
                <div className="admin-metric-value">{availabilityPercentage}%</div>
                <div className="admin-metric-meta">Fulfilled from catalogue</div>
              </div>
            </div>

            {/* Inventory Filter Bar */}
            <div className="admin-toolbar-card">
              <div className="admin-toolbar-search">
                <Search size={16} className="admin-search-icon" />
                <input
                  type="text"
                  className="admin-search-input"
                  placeholder="Filter inventory by item name or category..."
                  value={inventorySearch}
                  onChange={(e) => setInventorySearch(e.target.value)}
                  aria-label="Filter inventory"
                />
              </div>

              <div className="admin-toolbar-filters">
                <div className="admin-filter-group">
                  <label htmlFor="inventory-filter-select" className="admin-filter-label">
                    Stock Filter:
                  </label>
                  <select
                    id="inventory-filter-select"
                    className="admin-select"
                    value={inventoryFilter}
                    onChange={(e) =>
                      setInventoryFilter(
                        e.target.value as "all" | "available" | "unavailable"
                      )
                    }
                  >
                    <option value="all">All Items ({products.length})</option>
                    <option value="available">Available ({availableProductsCount})</option>
                    <option value="unavailable">Out of Stock ({unavailableProductsCount})</option>
                  </select>
                </div>

                {unavailableProductsCount > 0 && (
                  <button
                    type="button"
                    className="admin-secondary-btn"
                    onClick={() => {
                                            showToast("All products reset to Available default");
                    }}
                    title="Reset all overrides"
                  >
                    <RotateCcw size={14} />
                    <span>Reset Overrides</span>
                  </button>
                )}
              </div>
            </div>

            {/* Inventory List */}
            <div className="admin-panel-card">
              <div className="admin-panel-header">
                <div>
                  <h2 className="admin-panel-title">
                    Stock Availability Roster ({filteredInventory.length})
                  </h2>
                  <p className="admin-panel-desc">
                    Availability-based stock management (no artificial unit counters)
                  </p>
                </div>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Current Availability</th>
                      <th>Quick Switch</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInventory.map((item) => {
                      const isAvailable = item.isAvailable ?? false;
                      return (
                        <tr key={item.id}>
                          <td>
                            <div className="admin-inv-item">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="admin-product-thumb"
                                loading="lazy"
                              />
                              <div>
                                <strong className="admin-prod-name">{item.name}</strong>
                                <span className="admin-table-muted">ID: {item.id}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="admin-cat-pill">{item.category}</span>
                          </td>
                          <td className="admin-table-muted">{item.unit}</td>
                          <td>₹{item.price}</td>
                          <td>
                            {isAvailable ? (
                              <span className="admin-stock-badge admin-stock-available">
                                <Check size={12} /> Available
                              </span>
                            ) : (
                              <span className="admin-stock-badge admin-stock-unavailable">
                                <XCircle size={12} /> Unavailable
                              </span>
                            )}
                          </td>
                          <td>
                            <button
                              type="button"
                              className={`admin-toggle-btn ${
                                isAvailable ? "admin-toggle-btn-danger" : "admin-toggle-btn-success"
                              }`}
                              onClick={() => handleToggleProduct(item.id, isAvailable)}
                            >
                              {isAvailable ? "Set Out of Stock" : "Set Available"}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 5: CUSTOMERS */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === "customers" && (
          <div className="admin-section-stack">
            <div className="admin-customer-notice">
              <Users size={18} />
              <div>
                <strong>Local Customer Records (Development):</strong> This section visualizes the
                current client profile and stored addresses saved in this browser's localStorage.
                Multi-tenant user authentication and server-side customer databases will be added
                in Phase 23.
              </div>
            </div>

            {userProfile ? (
              <div className="admin-profile-overview-grid">
                {/* Profile Card */}
                <div className="admin-panel-card">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Active Local Customer Profile</h2>
                      <p className="admin-panel-desc">Stored in localStorage</p>
                    </div>
                  </div>

                  <div className="admin-profile-details">
                    <div className="admin-profile-hero">
                      <div className="admin-profile-avatar">
                        {userProfile.fullName.charAt(0).toUpperCase()}
                      </div>
                      <div className="admin-profile-names">
                        <h3 className="admin-profile-name">{userProfile.fullName}</h3>
                        <span className="admin-profile-id">ID: {userProfile.id}</span>
                      </div>
                    </div>

                    <div className="admin-profile-fields">
                      <div className="admin-profile-field-row">
                        <span className="admin-profile-field-label">Mobile Phone:</span>
                        <strong>{userProfile.phone || "Not provided"}</strong>
                      </div>

                      <div className="admin-profile-field-row">
                        <span className="admin-profile-field-label">Email Address:</span>
                        <strong>{userProfile.email || "Not provided"}</strong>
                      </div>

                      <div className="admin-profile-field-row">
                        <span className="admin-profile-field-label">Profile Created:</span>
                        <span>{formatAdminDate(userProfile.createdAt)}</span>
                      </div>

                      <div className="admin-profile-field-row">
                        <span className="admin-profile-field-label">Last Updated:</span>
                        <span>{formatAdminDate(userProfile.updatedAt)}</span>
                      </div>

                      <div className="admin-profile-field-row">
                        <span className="admin-profile-field-label">Total Orders Placed:</span>
                        <strong>{orders.length}</strong>
                      </div>

                      <div className="admin-profile-field-row">
                        <span className="admin-profile-field-label">Saved Delivery Addresses:</span>
                        <strong>{savedAddresses.length}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Saved Addresses List */}
                <div className="admin-panel-card">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">
                        Saved Delivery Locations ({savedAddresses.length})
                      </h2>
                      <p className="admin-panel-desc">
                        Customer addresses on file for 10-15 min dispatch
                      </p>
                    </div>
                  </div>

                  {savedAddresses.length === 0 ? (
                    <div className="admin-empty-state">
                      <MapPin size={32} className="admin-empty-icon" />
                      <p className="admin-empty-desc">No saved addresses on file yet.</p>
                    </div>
                  ) : (
                    <div className="admin-address-list">
                      {savedAddresses.map((addr) => (
                        <div key={addr.id} className="admin-address-card">
                          <div className="admin-address-top">
                            <span className="admin-address-tag">{addr.label}</span>
                            <strong className="admin-address-recipient">
                              {addr.fullName}
                            </strong>
                          </div>
                          <p className="admin-address-line">
                            {addr.house}, {addr.street}
                            {addr.landmark ? `, Near ${addr.landmark}` : ""}
                          </p>
                          <p className="admin-address-city">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="admin-address-phone">Phone: {addr.phone}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="admin-panel-card">
                <div className="admin-empty-state">
                  <Users size={36} className="admin-empty-icon" />
                  <h3 className="admin-empty-title">No Local Profile Created</h3>
                  <p className="admin-empty-desc">
                    No customer profile has been saved in this browser yet. When a shopper opens
                    the "My Account" modal in the storefront and saves their name, their profile
                    will appear here.
                  </p>
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={onBackToStore}
                  >
                    Go to Storefront to Set Up Profile
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* TAB 6: ANALYTICS */}
        {/* ---------------------------------------------------------------- */}
        {activeTab === "analytics" && (
          <div className="admin-section-stack">
            {orders.length === 0 ? (
              <div className="admin-panel-card">
                <div className="admin-empty-state">
                  <BarChart3 size={36} className="admin-empty-icon" />
                  <h3 className="admin-empty-title">No Analytics Available Yet</h3>
                  <p className="admin-empty-desc">
                    Analytics will appear as orders are created. Place orders from the storefront
                    to see live breakdown graphs and real local operational metrics.
                  </p>
                  <button
                    type="button"
                    className="admin-primary-btn"
                    onClick={onBackToStore}
                  >
                    Place an Order
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Metric Summary Cards */}
                <div className="admin-metrics-grid">
                  <div className="admin-metric-card">
                    <div className="admin-metric-header">
                      <span className="admin-metric-title">Orders Analyzed</span>
                      <div className="admin-metric-icon-box metric-icon-emerald">
                        <ClipboardList size={18} />
                      </div>
                    </div>
                    <div className="admin-metric-value">{orders.length}</div>
                    <div className="admin-metric-meta">Actual placed orders</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="admin-metric-header">
                      <span className="admin-metric-title">Average Order Value</span>
                      <div className="admin-metric-icon-box metric-icon-gold">
                        <TrendingUp size={18} />
                      </div>
                    </div>
                    <div className="admin-metric-value">
                      ₹{Math.round(totalOrderRevenue / orders.length)}
                    </div>
                    <div className="admin-metric-meta">Per customer order</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="admin-metric-header">
                      <span className="admin-metric-title">Fulfillment Rate</span>
                      <div className="admin-metric-icon-box metric-icon-teal">
                        <CheckCircle2 size={18} />
                      </div>
                    </div>
                    <div className="admin-metric-value">
                      {Math.round((deliveredOrdersCount / orders.length) * 100)}%
                    </div>
                    <div className="admin-metric-meta">Delivered successfully</div>
                  </div>

                  <div className="admin-metric-card">
                    <div className="admin-metric-header">
                      <span className="admin-metric-title">Cancellation Rate</span>
                      <div className="admin-metric-icon-box metric-icon-amber">
                        <XCircle size={18} />
                      </div>
                    </div>
                    <div className="admin-metric-value">
                      {Math.round((cancelledOrdersCount / orders.length) * 100)}%
                    </div>
                    <div className="admin-metric-meta">Cancelled orders</div>
                  </div>
                </div>

                {/* Orders by Status Breakdown */}
                <div className="admin-panel-card">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Orders by Status</h2>
                      <p className="admin-panel-desc">Real distribution across operational stages</p>
                    </div>
                  </div>

                  <div className="admin-analytics-bars">
                    {ALL_ORDER_STATUSES.map((status) => {
                      const count = statusCounts[status];
                      const pct = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;

                      return (
                        <div key={status} className="admin-analytics-bar-item">
                          <div className="admin-bar-label-group">
                            <span className="admin-bar-status-name">
                              {getStatusIcon(status)}
                              <span>{status}</span>
                            </span>
                            <span className="admin-bar-stats">
                              {count} {count === 1 ? "order" : "orders"} ({pct}%)
                            </span>
                          </div>

                          <div className="admin-bar-track">
                            <div
                              className={`admin-bar-fill ${getStatusBadgeClass(status)}`}
                              style={{ width: `${pct}%` }}
                              aria-label={`${status}: ${count} orders (${pct}%)`}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Orders Over Time */}
                {ordersOverTime.length > 0 && (
                  <div className="admin-panel-card">
                    <div className="admin-panel-header">
                      <div>
                        <h2 className="admin-panel-title">Orders by Date</h2>
                        <p className="admin-panel-desc">Real local order volume grouped by day</p>
                      </div>
                    </div>

                    <div className="admin-chart-timeline">
                      {ordersOverTime.map(({ dateLabel, count }) => {
                        const maxCount = Math.max(...ordersOverTime.map((d) => d.count), 1);
                        const heightPct = Math.max(15, Math.round((count / maxCount) * 100));

                        return (
                          <div key={dateLabel} className="admin-chart-col">
                            <div className="admin-chart-bar-wrap">
                              <span className="admin-chart-val">{count}</span>
                              <div
                                className="admin-chart-bar-fill"
                                style={{ height: `${heightPct}%` }}
                                title={`${dateLabel}: ${count} orders`}
                              />
                            </div>
                            <span className="admin-chart-date">{dateLabel}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Payment Methods Breakdown */}
                <div className="admin-panel-card">
                  <div className="admin-panel-header">
                    <div>
                      <h2 className="admin-panel-title">Payment Methods Used</h2>
                      <p className="admin-panel-desc">Actual methods chosen during checkout</p>
                    </div>
                  </div>

                  <div className="admin-payment-grid">
                    {Object.entries(paymentMethodCounts).map(([method, count]) => {
                      const pct = Math.round((count / orders.length) * 100);
                      return (
                        <div key={method} className="admin-payment-card">
                          <span className="admin-payment-method-name">{method}</span>
                          <strong className="admin-payment-count">{count} orders</strong>
                          <span className="admin-payment-pct">{pct}% of total</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </main>

      {/* Floating Admin Toast */}
      {adminToast && (
        <div className="admin-floating-toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} />
          <span>{adminToast}</span>
        </div>
      )}
    </div>
  );
}
