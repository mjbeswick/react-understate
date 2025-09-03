import { createRoot } from 'react-dom/client';
import { useUnderstate } from 'react-understate';
import { useEffect } from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';
import store from './store';

const {
  displayValue,
  previousValue,
  operation,
  waitingForOperand,
  handleKeyDown,
  inputDigit,
  inputDecimal,
  clear,
  performOperation,
  handleEquals,
  handlePercentage,
  handlePlusMinus,
} = store;

// Calculator component
function Calculator() {
  // Use useUnderstate hook to automatically subscribe to state changes
  useUnderstate(displayValue, previousValue, operation, waitingForOperand);

  console.log('render with useUnderstate:', displayValue.value);

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
