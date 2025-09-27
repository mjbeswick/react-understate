import { state, derived, useUnderstate, action } from 'react-understate';

// Shopping cart store
const cartStore = {
  items: state<CartItem[]>([], 'cartItems'),
  discountCode: state('', 'discountCode'),

  subtotal: derived(
    () =>
      cartStore.items.value.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
    'subtotal',
  ),

  discount: derived(() => {
    const code = cartStore.discountCode.value;
    const subtotal = cartStore.subtotal.value;

    if (code === 'SAVE10') return subtotal * 0.1;
    if (code === 'SAVE20') return subtotal * 0.2;
    return 0;
  }, 'discount'),

  total: derived(
    () => cartStore.subtotal.value - cartStore.discount.value,
    'total',
  ),

  addItem: action((item: CartItem) => {
    const existing = cartStore.items.value.find(i => i.id === item.id);
    if (existing) {
      cartStore.items.value = cartStore.items.value.map(i =>
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i,
      );
    } else {
      cartStore.items.value = [
        ...cartStore.items.value,
        { ...item, quantity: 1 },
      ];
    }
  }, 'addItem'),

  removeItem: action((id: string) => {
    cartStore.items.value = cartStore.items.value.filter(
      item => item.id !== id,
    );
  }, 'removeItem'),
};

// Custom hook for cart functionality
function useShoppingCart() {
  const cart = useUnderstate(cartStore);

  return {
    ...cart,
    isEmpty: cart.items.length === 0,
    itemCount: cart.items.reduce((sum, item) => sum + item.quantity, 0),
    hasDiscount: cart.discount > 0,
  };
}

// Custom hook for specific cart section
function useCartSummary() {
  const { subtotal, discount, total, hasDiscount } = useShoppingCart();

  return {
    subtotal,
    discount,
    total,
    hasDiscount,
    savings: discount,
    formattedTotal: `$${total.toFixed(2)}`,
  };
}

// Usage in components
function CartSummary() {
  const { subtotal, discount, formattedTotal, hasDiscount } = useCartSummary();

  return (
    <div>
      <p>Subtotal: ${subtotal.toFixed(2)}</p>
      {hasDiscount && <p>Discount: -${discount.toFixed(2)}</p>}
      <h3>Total: {formattedTotal}</h3>
    </div>
  );
}

function ProductList() {
  const { addItem } = useShoppingCart();

  return (
    <div>
      {products.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <button onClick={() => addItem(product)}>Add to Cart</button>
        </div>
      ))}
    </div>
  );
}
