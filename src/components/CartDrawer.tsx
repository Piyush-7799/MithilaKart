import type { CartItem } from "../types";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  cartCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  onAddToCart: (id: string) => void;
  onRemoveFromCart: (id: string) => void;
  onDeleteFromCart: (id: string) => void;
}

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  cartCount,
  subtotal,
  deliveryFee,
  total,
  onAddToCart,
  onRemoveFromCart,
  onDeleteFromCart,
}: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="cart-overlay" onClick={onClose}>
      <div className="cart-page" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <div>
            <h2>Your Cart 🛒</h2>
            <p>{cartCount} items</p>
          </div>

          <button className="close-cart" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>

        {cartCount === 0 ? (
          <div className="empty-cart">
            <div>🛒</div>

            <h3>Your cart is empty</h3>

            <p>Add some products to continue.</p>

            <button onClick={onClose}>Start Shopping</button>
          </div>
        ) : (
          <>
            <div className="cart-products">
              {cartItems.map(({ product, quantity }) => (
                <div className="cart-product" key={product.id}>
                  <div className="cart-product-image">{product.image}</div>

                  <div className="cart-product-info">
                    <h3>{product.name}</h3>

                    <p>{product.unit}</p>

                    <strong>₹{product.price}</strong>
                  </div>

                  <div className="cart-actions">
                    <div className="quantity-control">
                      <button
                        onClick={() => onRemoveFromCart(product.id)}
                        aria-label={`Decrease quantity of ${product.name}`}
                      >
                        −
                      </button>

                      <span>{quantity}</span>

                      <button
                        onClick={() => onAddToCart(product.id)}
                        aria-label={`Increase quantity of ${product.name}`}
                      >
                        +
                      </button>
                    </div>

                    <button
                      className="delete-btn"
                      onClick={() => onDeleteFromCart(product.id)}
                      aria-label={`Remove ${product.name} from cart`}
                    >
                      🗑️
                    </button>
                  </div>

                  <div className="cart-product-total">
                    ₹{product.price * quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="bill">
              <h3>Bill Details</h3>

              <div>
                <span>Subtotal</span>
                <span>₹{subtotal}</span>
              </div>

              <div>
                <span>Delivery Fee</span>

                <span>
                  {deliveryFee === 0 ? "FREE" : `₹${deliveryFee}`}
                </span>
              </div>

              <div className="free-delivery">
                {subtotal >= 300
                  ? "🎉 You got free delivery!"
                  : `Add ₹${300 - subtotal} more for FREE delivery`}
              </div>

              <hr />

              <div className="grand-total">
                <strong>Total</strong>
                <strong>₹{total}</strong>
              </div>

              <button className="checkout-btn">
                Proceed to Checkout →
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
