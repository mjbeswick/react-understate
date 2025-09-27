import { state, derived, action, batch } from 'react-understate';

// Compose multiple states into a cohesive module
const cart = {
  // State
  items: state([]),
  discount: state(0),
  shipping: state(0),
  taxRate: state(0.08),

  // Derived values
  subtotal: derived(() => {
    return cart.items.value.reduce((sum, item) => sum + item.price, 0);
  }),

  discountAmount: derived(() => {
    return cart.subtotal.value * (cart.discount.value / 100);
  }),

  total: derived(() => {
    const subtotal = cart.subtotal.value;
    const discount = cart.discountAmount.value;
    const shipping = cart.shipping.value;
    const tax = (subtotal - discount + shipping) * cart.taxRate.value;

    return subtotal - discount + shipping + tax;
  }),

  // Actions
  addItem: action(item => {
    cart.items.value = [...cart.items.value, item];
  }, 'addItem'),

  removeItem: action(itemId => {
    cart.items.value = cart.items.value.filter(item => item.id !== itemId);
  }, 'removeItem'),

  updateQuantity: action((itemId, quantity) => {
    cart.items.value = cart.items.value.map(item =>
      item.id === itemId ? { ...item, quantity } : item,
    );
  }, 'updateQuantity'),

  applyDiscount: action(percentage => {
    cart.discount.value = percentage;
  }, 'applyDiscount'),

  setShipping: action(cost => {
    cart.shipping.value = cost;
  }, 'setShipping'),

  // Complex actions that work with multiple states
  clearCart: action(() => {
    batch(() => {
      cart.items.value = [];
      cart.discount.value = 0;
      cart.shipping.value = 0;
    });
  }, 'clearCart'),

  // Async actions
  checkout: action(async () => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.value,
          discount: cart.discount.value,
          shipping: cart.shipping.value,
          total: cart.total.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Checkout failed');
      }

      cart.clearCart();
      return await response.json();
    } catch (error) {
      console.error('Checkout error:', error);
      throw error;
    }
  }, 'checkout'),
};
