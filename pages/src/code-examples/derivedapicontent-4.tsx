import { state, derived } from 'react-understate';

const items = state([
  { name: 'Apple', price: 1.5, quantity: 3 },
  { name: 'Banana', price: 0.75, quantity: 6 },
  { name: 'Orange', price: 2.0, quantity: 2 },
]);

const taxRate = state(0.08); // 8% tax
const discountPercent = state(0); // No discount initially

// First level derivations
const subtotal = derived(() =>
  items.value.reduce((sum, item) => sum + item.price * item.quantity, 0),
);

const discountAmount = derived(
  () => subtotal.value * (discountPercent.value / 100),
);

// Second level derivations (depend on other derived values)
const subtotalAfterDiscount = derived(
  () => subtotal.value - discountAmount.value,
);

const taxAmount = derived(() => subtotalAfterDiscount.value * taxRate.value);

// Final derivation
const total = derived(() => subtotalAfterDiscount.value + taxAmount.value);

// Even more complex derivations
const itemBreakdown = derived(() => {
  return items.value.map(item => ({
    ...item,
    lineTotal: item.price * item.quantity,
    discountedPrice: item.price * (1 - discountPercent.value / 100),
    finalPrice:
      item.price * (1 - discountPercent.value / 100) * (1 + taxRate.value),
  }));
});

function ShoppingCart() {
  const {
    items: cartItems,
    subtotal: sub,
    discountAmount: discount,
    taxAmount: tax,
    total: finalTotal,
    itemBreakdown: breakdown,
  } = useUnderstate({
    items,
    subtotal,
    discountAmount,
    taxAmount,
    total,
    itemBreakdown,
  });

  return (
    <div>
      <h3>Shopping Cart</h3>

      {breakdown.map((item, index) => (
        <div key={index}>
          {item.name}: {item.quantity} × ${item.price} = $
          {item.lineTotal.toFixed(2)}
        </div>
      ))}

      <hr />
      <p>Subtotal: ${sub.toFixed(2)}</p>
      <p>Discount: -${discount.toFixed(2)}</p>
      <p>Tax: ${tax.toFixed(2)}</p>
      <strong>Total: ${finalTotal.toFixed(2)}</strong>

      <div>
        <label>
          Discount %:
          <input
            type="number"
            value={discountPercent.value}
            onChange={e => (discountPercent.value = Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  );
}
