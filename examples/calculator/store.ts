import { state, batch } from 'react-understate';

// Calculator state using states
const displayValue = state('0');
const previousValue = state<number | null>(null);
const operation = state<string | null>(null);
const waitingForOperand = state(false);

// Helper function to calculate
function calculate(
  firstValue: number,
  secondValue: number,
  op: string
): number {
  switch (op) {
    case '+':
      return firstValue + secondValue;
    case '-':
      return firstValue - secondValue;
    case '×':
      return firstValue * secondValue;
    case '÷':
      return firstValue / secondValue;
    default:
      return secondValue;
  }
}

// Helper function to input digit
function inputDigit(digit: string) {
  console.log('inputDigit called with:', digit);
  console.log('Current displayValue:', displayValue.value);
  console.log('waitingForOperand:', waitingForOperand.value);

  if (waitingForOperand.value) {
    console.log('Setting displayValue to digit (waitingForOperand was true)');
    batch(() => {
      displayValue.value = digit;
      waitingForOperand.value = false;
    });
  } else {
    if (displayValue.value === '0') {
      console.log('displayValue was "0", setting to digit');
      displayValue.value = digit;
    } else {
      const newValue = displayValue.value + digit;
      console.log(
        'Concatenating:',
        displayValue.value,
        '+',
        digit,
        '=',
        newValue
      );
      displayValue.value = newValue;
    }
  }

  console.log('Final displayValue:', displayValue.value);
}

// Helper function to input decimal point
function inputDecimal() {
  if (waitingForOperand.value) {
    batch(() => {
      displayValue.value = '0.';
      waitingForOperand.value = false;
    });
  } else if (displayValue.value.indexOf('.') === -1) {
    displayValue.value = displayValue.value + '.';
  }
}

// Helper function to clear
function clear() {
  batch(() => {
    displayValue.value = '0';
    previousValue.value = null;
    operation.value = null;
    waitingForOperand.value = false;
  });
}

// Helper function to perform calculation
function performOperation(nextOperation: string) {
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
}

// Helper function to handle equals
function handleEquals() {
  if (!previousValue.value || !operation.value) {
    return;
  }

  const inputValue = parseFloat(displayValue.value);
  const newValue = calculate(previousValue.value, inputValue, operation.value);

  displayValue.value = String(newValue);
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = true;
}

// Helper function to handle percentage
function handlePercentage() {
  const inputValue = parseFloat(displayValue.value);
  const newValue = inputValue / 100;
  displayValue.value = String(newValue);
  waitingForOperand.value = true;
}

// Helper function to handle plus/minus
function handlePlusMinus() {
  const inputValue = parseFloat(displayValue.value);
  const newValue = -inputValue;
  displayValue.value = String(newValue);
}

// Keyboard event handler
function handleKeyDown(event: KeyboardEvent) {
  const key = event.key;

  // Number keys (0-9)
  if (/^[0-9]$/.test(key)) {
    inputDigit(key);
    return;
  }

  // Operator keys
  switch (key) {
    case '+':
      performOperation('+');
      break;
    case '-':
      performOperation('-');
      break;
    case '*':
      performOperation('×');
      break;
    case '/':
      performOperation('÷');
      break;
    case '=':
    case 'Enter':
      handleEquals();
      break;
    case '.':
      inputDecimal();
      break;
    case 'Escape':
      clear();
      break;
    case '%':
      handlePercentage();
      break;
    case '±':
    case 'p':
      handlePlusMinus();
      break;
  }
}

// Export as default
export default {
  displayValue,
  previousValue,
  operation,
  waitingForOperand,
  inputDigit,
  inputDecimal,
  clear,
  performOperation,
  handleEquals,
  handlePercentage,
  handlePlusMinus,
  handleKeyDown,
};
