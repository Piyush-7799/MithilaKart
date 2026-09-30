interface HeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  cartCount: number;
  onOpenCart: () => void;
}

export function Header({
  search,
  onSearchChange,
  cartCount,
  onOpenCart,
}: HeaderProps) {
  return (
    <nav className="navbar">
      <div className="logo">🛒 MithilaKart</div>

      <input
        className="search"
        type="text"
        placeholder="Search for groceries, fruits & more..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <div className="location">
        📍 Deliver to: <strong>Your Location</strong>
      </div>

      <button className="cart-button" onClick={onOpenCart}>
        🛒 Cart ({cartCount})
      </button>
    </nav>
  );
}
