import React from 'react';
import { createRoot } from 'react-dom/client';
import { state, useSubscribe, setReact } from 'react-understate';
import { useEffect } from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';

setReact(React);

// Calculator state using states
const displayValue = state('0');
const previousValue = state<number | null>(null);
const operation = state<string | null>(null);
const waitingForOperand = state(false);

// Temporarily removed effect to debug state update issues

// Helper function to input digit
const inputDigit = (digit: string) => {
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
        newValue
      );
      displayValue.value = newValue;
    }
  }

  console.log('Final displayValue:', displayValue.value);
};

// Helper function to input decimal point
const inputDecimal = () => {
  if (waitingForOperand.value) {
    displayValue.value = '0.';
    waitingForOperand.value = false;
  } else if (displayValue.value.indexOf('.') === -1) {
    displayValue.value = displayValue.value + '.';
  }
};

// Helper function to clear
const clear = () => {
  displayValue.value = '0';
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = false;
};

// Helper function to perform calculation
const performOperation = (nextOperation: string) => {
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
};

// Helper function to calculate
const calculate = (
  firstValue: number,
  secondValue: number,
  op: string
): number => {
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
};

// Helper function to handle equals
const handleEquals = () => {
  if (!previousValue.value || !operation.value) {
    return;
  }

  const inputValue = parseFloat(displayValue.value);
  const newValue = calculate(previousValue.value, inputValue, operation.value);

  displayValue.value = String(newValue);
  previousValue.value = null;
  operation.value = null;
  waitingForOperand.value = true;
};

// Helper function to handle percentage
const handlePercentage = () => {
  const inputValue = parseFloat(displayValue.value);
  const newValue = inputValue / 100;
  displayValue.value = String(newValue);
  waitingForOperand.value = true;
};

// Helper function to handle plus/minus
const handlePlusMinus = () => {
  const inputValue = parseFloat(displayValue.value);
  const newValue = -inputValue;
  displayValue.value = String(newValue);
};

// Keyboard event handler
const handleKeyDown = (event: KeyboardEvent) => {
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
};

// Calculator component
function Calculator() {
  // Use useSubscribe hook to automatically subscribe to state changes
  useSubscribe(displayValue);
  useSubscribe(previousValue);
  useSubscribe(operation);
  useSubscribe(waitingForOperand);

  console.log('render with useSubscribe:', displayValue.value);

  // Add event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Debug: Log when component actually renders
  useEffect(() => {
    console.log('Component rendered with displayValue:', displayValue.value);
    console.log('DOM should show:', displayValue.value);
  });

  // Debug: Add subscription debugging
  useEffect(() => {
    const unsubscribe = displayValue.subscribe(() => {
      console.log(
        'displayValue subscription triggered! New value:',
        displayValue.value
      );
    });
    return unsubscribe;
  }, []);

  return (
    <div className={styles.calculator}>
      <div className={styles.display}>
        <div className={styles.expression}>
          {previousValue.value !== null &&
            operation.value &&
            `${previousValue.value} ${operation.value}`}
        </div>
        <div
          className={styles.result}
          style={{
            fontSize:
              displayValue.value.length > 9
                ? `${Math.max(24, 48 - (displayValue.value.length - 9) * 3)}px`
                : '48px',
          }}
        >
          {displayValue.value}
        </div>
      </div>

      <div className={styles.keypad}>
        <button className={clsx(styles.key, styles.function)} onClick={clear}>
          AC
        </button>
        <button
          className={clsx(styles.key, styles.function)}
          onClick={handlePlusMinus}
        >
          ±
        </button>
        <button
          className={clsx(styles.key, styles.function)}
          onClick={handlePercentage}
        >
          %
        </button>
        <button
          className={clsx(styles.key, styles.operator)}
          onClick={() => performOperation('÷')}
        >
          ÷
        </button>

        <button className={styles.key} onClick={() => inputDigit('7')}>
          7
        </button>
        <button className={styles.key} onClick={() => inputDigit('8')}>
          8
        </button>
        <button className={styles.key} onClick={() => inputDigit('9')}>
          9
        </button>
        <button
          className={clsx(styles.key, styles.operator)}
          onClick={() => performOperation('×')}
        >
          ×
        </button>

        <button className={styles.key} onClick={() => inputDigit('4')}>
          4
        </button>
        <button className={styles.key} onClick={() => inputDigit('5')}>
          5
        </button>
        <button className={styles.key} onClick={() => inputDigit('6')}>
          6
        </button>
        <button
          className={clsx(styles.key, styles.operator)}
          onClick={() => performOperation('-')}
        >
          -
        </button>

        <button className={styles.key} onClick={() => inputDigit('1')}>
          1
        </button>
        <button className={styles.key} onClick={() => inputDigit('2')}>
          2
        </button>
        <button className={styles.key} onClick={() => inputDigit('3')}>
          3
        </button>
        <button
          className={clsx(styles.key, styles.operator)}
          onClick={() => performOperation('+')}
        >
          +
        </button>

        <button
          className={clsx(styles.key, styles.zero)}
          onClick={() => inputDigit('0')}
        >
          0
        </button>
        <button className={styles.key} onClick={inputDecimal}>
          .
        </button>
        <button
          className={clsx(styles.key, styles.operator)}
          onClick={handleEquals}
        >
          =
        </button>
      </div>
    </div>
  );
}

// Render the calculator
const container = document.getElementById('app');
if (container) {
  const root = createRoot(container);
  root.render(<Calculator />);
}
