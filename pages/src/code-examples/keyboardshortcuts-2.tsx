// calculatorStore.ts
import { state, action, effect } from 'react-understate';

// State
export const displayValue = state('0', 'displayValue');
export const previousValue = state<number | null>(null, 'previousValue');
export const operation = state<string | null>(null, 'operation');
const waitingForOperand = state(false, 'waitingForOperand');

// Helper function
function calculate(first: number, second: number, op: string): number {
  switch (op) {
    case '+': return first + second;
    case '-': return first - second;
    case '×': return first * second;
    case '÷': return first / second;
    default: return second;
  }
}

// Actions
export const inputDigit = action((digit: string) => {
  if (waitingForOperand.value) {
    displayValue.value = digit;
    waitingForOperand.value = false;
  } else {
    displayValue.value = displayValue.value === '0' ? digit : displayValue.value + digit;
  }
}, 'inputDigit');

export const inputDecimal = action(() => {
  if (waitingForOperand.value) {
    displayValue.value = '0.';
    waitingForOperand.value = false;
  } else if (displayValue.value.indexOf('.') === -1) {
    displayValue.value = \`\${displayValue.value}.\`;
  }
}, 'inputDecimal');

export const clear = action(() => {
  displayValue.value = '0';
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = false;
}, 'clear');

export const performOperation = action((nextOperation: string) => {
  const inputValue = parseFloat(displayValue.value);

  if (previousValue.value === null) {
    previousValue.value = inputValue;
  } else if (operation.value) {
    const currentValue = previousValue.value || 0;
    const newValue = calculate(currentValue, inputValue, operation.value);
    displayValue.value = String(newValue);
    previousValue.value = newValue;
  }

  waitingForOperand.value = true;
  operation.value = nextOperation;
}, 'performOperation');

export const handleEquals = action(() => {
  if (!previousValue.value || !operation.value) return;

  const inputValue = parseFloat(displayValue.value);
  const newValue = calculate(previousValue.value, inputValue, operation.value);

  displayValue.value = String(newValue);
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = true;
}, 'handleEquals');

export const handlePercentage = action(() => {
  const inputValue = parseFloat(displayValue.value);
  displayValue.value = String(inputValue / 100);
  waitingForOperand.value = true;
}, 'handlePercentage');

export const handlePlusMinus = action(() => {
  const inputValue = parseFloat(displayValue.value);
  displayValue.value = String(-inputValue);
}, 'handlePlusMinus');

// Comprehensive keyboard handler
export const handleKeyDown = action((event: KeyboardEvent) => {
  const key = event.key;

  // Number keys (0-9)
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    event.preventDefault();
    return;
  }

  // Operator keys
  switch (key) {
    case '+':
      performOperation('+');
      event.preventDefault();
      break;
    case '-':
      performOperation('-');
      event.preventDefault();
      break;
    case '*':
      performOperation('×');
      event.preventDefault();
      break;
    case '/':
      performOperation('÷');
      event.preventDefault();
      break;
    case '=':
    case 'Enter':
      handleEquals();
      event.preventDefault();
      break;
    case '.':
      inputDecimal();
      event.preventDefault();
      break;
    case 'Escape':
    case 'c':
    case 'C':
      clear();
      event.preventDefault();
      break;
    case '%':
      handlePercentage();
      event.preventDefault();
      break;
    case '±':
    case 'p':
    case 'P':
      handlePlusMinus();
      event.preventDefault();
      break;
    case 'Backspace':
      // Remove last digit
      if (displayValue.value.length > 1) {
        displayValue.value = displayValue.value.slice(0, -1);
      } else {
        displayValue.value = '0';
      }
      event.preventDefault();
      break;
  }
}, 'handleKeyDown');

// Set up keyboard listener
const keyboardEffect = effect(() => {
  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, 'keyboardEffect');