import { state, action, configureDebug } from 'react-understate';

// Enable debug logging in development
if (import.meta.env?.DEV) {
  configureDebug({ enabled: true });
}

/**
 * State containing the current display value shown on the calculator
 */
export const displayValue = state('0', 'displayValue');
/**
 * State storing the previous value for calculations
 */
export const previousValue = state<number | null>(null, 'previousValue');
/**
 * State storing the current operation to be performed
 */
export const operation = state<string | null>(null, 'operation');
/**
 * State tracking whether the calculator is waiting for a new operand
 */
const waitingForOperand = state(false, 'waitingForOperand');

/**
 * Performs the specified mathematical operation on two values
 * @param firstValue The first operand
 * @param secondValue The second operand
 * @param op The operation to perform (+, -, ×, ÷)
 * @returns The result of the calculation
 */
function calculate(
  firstValue: number,
  secondValue: number,
  op: string,
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

/**
 * Adds a digit to the current display value
 * @param digit The digit to add
 */
export const inputDigit = action((digit: string) => {
  console.log('inputDigit called with:', digit);
  console.log('Current displayValue:', displayValue.value);
  console.log('waitingForOperand:', waitingForOperand.value);

  if (waitingForOperand.value) {
    console.log('Setting displayValue to digit (waitingForOperand was true)');
    displayValue.value = digit;
    waitingForOperand.value = false;
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
        newValue,
      );
      displayValue.value = newValue;
    }
  }

  console.log('Final displayValue:', displayValue.value);
}, 'inputDigit');

/**
 * Adds a decimal point to the current display value if not already present
 */
export const inputDecimal = action(() => {
  if (waitingForOperand.value) {
    displayValue.value = '0.';
    waitingForOperand.value = false;
  } else if (displayValue.value.indexOf('.') === -1) {
    displayValue.value = `${displayValue.value}.`;
  }
}, 'inputDecimal');

/**
 * Resets the calculator to its initial state
 */
export const clear = action(() => {
  displayValue.value = '0';
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = false;
}, 'clear');

/**
 * Performs the pending operation and sets up for the next one
 * @param nextOperation The operation to perform next
 */
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

/**
 * Calculates and displays the result of the current operation
 */
export const handleEquals = action(() => {
  if (!previousValue.value || !operation.value) {
    return;
  }

  const inputValue = parseFloat(displayValue.value);
  const newValue = calculate(previousValue.value, inputValue, operation.value);

  displayValue.value = String(newValue);
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = true;
}, 'handleEquals');

/**
 * Converts the current display value to a percentage (divides by 100)
 */
export const handlePercentage = action(() => {
  const inputValue = parseFloat(displayValue.value);
  const newValue = inputValue / 100;
  displayValue.value = String(newValue);
  waitingForOperand.value = true;
}, 'handlePercentage');

/**
 * Toggles the sign of the current display value
 */
export const handlePlusMinus = action(() => {
  const inputValue = parseFloat(displayValue.value);
  const newValue = -inputValue;
  displayValue.value = String(newValue);
}, 'handlePlusMinus');

/**
 * Handles keyboard input for calculator operations
 */
export const handleKeyDown = action((event: KeyboardEvent) => {
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
}, 'handleKeyDown');
