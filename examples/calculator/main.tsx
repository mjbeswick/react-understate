import { createRoot } from 'react-dom/client';
import { useUnderstate } from 'react-understate';
import { useEffect } from 'react';
import styles from './styles.module.css';
import clsx from 'clsx';
import * as store from './store';

// Calculator component
function Calculator() {
  const {
    displayValue,
    previousValue,
    operation,
    handleKeyDown,
    inputDigit,
    inputDecimal,
    clear,
    performOperation,
    handleEquals,
    handlePercentage,
    handlePlusMinus,
  } = useUnderstate(store);

  // Add event listener
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={styles.calculator}>
      <div className={styles.display}>
        <div className={styles.expression}>
          {previousValue !== null &&
            operation &&
            `${previousValue} ${operation}`}
        </div>
        <div
          className={styles.result}
          style={{
            fontSize:
              displayValue.length > 9
                ? `${Math.max(24, 48 - (displayValue.length - 9) * 3)}px`
                : '48px',
          }}
        >
          {displayValue}
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
