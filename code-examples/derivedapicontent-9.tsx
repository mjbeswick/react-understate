import { state, derived, configureDebug } from 'react-understate';

// Enable debugging
configureDebug({ enabled: true, showFile: true });

const price = state(100, 'itemPrice');
const quantity = state(2, 'itemQuantity');
const taxRate = state(0.08, 'taxRate');

// Named derived values for better debugging
const subtotal = derived(() => {
  console.log('Calculating subtotal');
  return price.value * quantity.value;
}, 'subtotal');

const total = derived(() => {
  console.log('Calculating total');
  return subtotal.value * (1 + taxRate.value);
}, 'total');

// Changes will be logged with names:
price.value = 150; // Logs subtotal and total recalculations