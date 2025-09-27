import { state, derived } from 'react-understate';

// Compose multiple states
const cart = {
  items: state([]),
  discount: state(0),

  // Methods that work with multiple states
  addItem: item => {
    cart.items.value = [...cart.items.value, item];
  },

  applyDiscount: percentage => {
    cart.discount.value = percentage;
  },
};

// Derived values from multiple states
const cartTotal = derived(() => {
  const items = cart.items.value;
  const discount = cart.discount.value;

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  return subtotal * (1 - discount / 100);
});
