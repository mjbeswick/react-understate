import React from 'react';
import { state, useUnderstate } from 'react-understate';

// Array state for shopping cart
const cart = state<
  { id: number; name: string; price: number; quantity: number }[]
>(
  [
    { id: 1, name: 'Laptop', price: 999, quantity: 1 },
    { id: 2, name: 'Mouse', price: 25, quantity: 2 },
  ],
  { name: 'cart', observeMutations: true },
);

// Derived values
const totalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0);
const totalPrice = () =>
  cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

// Actions for cart operations
const addToCart = (product: { id: number; name: string; price: number }) => {
  const existingItem = cart.find(item => item.id === product.id);

  if (existingItem) {
    // Update quantity
    const index = cart.findIndex(item => item.id === product.id);
    cart.splice(index, 1, {
      ...existingItem,
      quantity: existingItem.quantity + 1,
    });
  } else {
    // Add new item
    cart.push({ ...product, quantity: 1 });
  }
};

const removeFromCart = (productId: number) => {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    cart.splice(index, 1);
  }
};

const updateQuantity = (productId: number, quantity: number) => {
  const index = cart.findIndex(item => item.id === productId);
  if (index !== -1) {
    if (quantity <= 0) {
      cart.splice(index, 1);
    } else {
      cart.splice(index, 1, { ...cart[index], quantity });
    }
  }
};

const clearCart = () => {
  cart.clear();
};

// React component
function ShoppingCart() {
  const [cartItems] = useUnderstate(cart);
  const [itemCount] = useUnderstate({ totalItems });
  const [price] = useUnderstate({ totalPrice });

  return (
    <div>
      <h2>Shopping Cart ({itemCount} items)</h2>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <div>
          {cartItems.map(item => (
            <div
              key={item.id}
              style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}
            >
              <span>{item.name}</span>
              <span>${item.price}</span>
              <input
                type="number"
                value={item.quantity}
                onChange={e =>
                  updateQuantity(item.id, parseInt(e.target.value) || 0)
                }
                min="0"
                style={{ width: '60px' }}
              />
              <button onClick={() => removeFromCart(item.id)}>Remove</button>
            </div>
          ))}

          <div style={{ marginTop: '20px', fontWeight: 'bold' }}>
            Total: ${price.toFixed(2)}
          </div>

          <button onClick={clearCart} style={{ marginTop: '10px' }}>
            Clear Cart
          </button>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <h3>Add Items</h3>
        <button
          onClick={() => addToCart({ id: 3, name: 'Keyboard', price: 75 })}
        >
          Add Keyboard
        </button>
        <button
          onClick={() => addToCart({ id: 4, name: 'Monitor', price: 200 })}
        >
          Add Monitor
        </button>
      </div>
    </div>
  );
}

export { ShoppingCart, addToCart, removeFromCart, updateQuantity, clearCart };
