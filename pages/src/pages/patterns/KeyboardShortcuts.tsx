import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../shared.module.css';
import CodeBlock from '../../components/CodeBlock';

const KeyboardShortcuts: React.FC = () => {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <h1>Keyboard Shortcuts</h1>
        <p className={styles.subtitle}>
          Handle keyboard input with effects and actions for better UX
        </p>
      </header>

      <h2>Overview</h2>
      <p>
        Keyboard shortcuts greatly improve user experience by allowing power
        users to interact with your application without reaching for the mouse.
        React Understate makes it easy to implement keyboard shortcuts using
        effects and actions.
      </p>

      <div
        className="pattern-benefits"
        style={{
          background: '#f8fafc',
          padding: '1.5rem',
          borderRadius: '0.5rem',
          margin: '2rem 0',
        }}
      >
        <h3 style={{ margin: '0 0 1rem 0' }}>✅ Benefits</h3>
        <ul style={{ margin: 0 }}>
          <li>Improved accessibility and usability</li>
          <li>Faster interaction for power users</li>
          <li>Centralized keyboard handling logic</li>
          <li>Easy to test and maintain</li>
          <li>Works with complex state operations</li>
        </ul>
      </div>

      <h2>Basic Pattern</h2>
      <p>
        The basic pattern involves using an effect to listen for keyboard events
        and actions to handle the specific operations:
      </p>

      <CodeBlock
        language="tsx"
        code={`import { state, action, effect } from 'react-understate';

// State
const count = state(0, 'count');

// Actions
const increment = action(() => {
  count.value++;
}, 'increment');

const decrement = action(() => {
  count.value--;
}, 'decrement');

const reset = action(() => {
  count.value = 0;
}, 'reset');

// Keyboard shortcuts effect
const setupKeyboardShortcuts = effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    // Prevent default for handled keys
    const handled = true;
    
    switch (event.key) {
      case 'ArrowUp':
      case '+':
        increment();
        break;
      case 'ArrowDown':
      case '-':
        decrement();
        break;
      case 'r':
      case 'R':
        if (event.ctrlKey || event.metaKey) {
          reset();
        } else {
          handled = false;
        }
        break;
      default:
        handled = false;
    }
    
    if (handled) {
      event.preventDefault();
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  
  // Cleanup
  return () => {
    document.removeEventListener('keydown', handleKeyDown);
  };
}, 'setupKeyboardShortcuts');`}
      />

      <h2>Calculator Example</h2>
      <p>
        Here's a real-world example from a calculator application that handles
        complex keyboard input mapping:
      </p>

      <CodeBlock
        language="tsx"
        code={`// calculatorStore.ts
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
}, 'keyboardEffect');`}
      />

      <h2>Advanced Patterns</h2>

      <h3>Conditional Shortcuts</h3>
      <p>
        Sometimes you want shortcuts to only work in certain contexts or modes:
      </p>

      <CodeBlock
        language="tsx"
        code={`const mode = state<'normal' | 'editing' | 'selecting'>('normal', 'mode');
const selectedItems = state<string[]>([], 'selectedItems');

const setupConditionalShortcuts = effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const currentMode = mode.value;
    
    // Global shortcuts (work in any mode)
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case 's':
          saveDocument();
          event.preventDefault();
          return;
        case 'z':
          if (event.shiftKey) {
            redo();
          } else {
            undo();
          }
          event.preventDefault();
          return;
      }
    }
    
    // Mode-specific shortcuts
    switch (currentMode) {
      case 'normal':
        handleNormalModeKeys(event);
        break;
      case 'editing':
        handleEditingModeKeys(event);
        break;
      case 'selecting':
        handleSelectingModeKeys(event);
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [mode], 'conditionalShortcuts');

const handleNormalModeKeys = action((event: KeyboardEvent) => {
  switch (event.key) {
    case 'n':
      createNewItem();
      event.preventDefault();
      break;
    case 'e':
      enterEditMode();
      event.preventDefault();
      break;
    case 'Delete':
      deleteSelectedItems();
      event.preventDefault();
      break;
  }
}, 'handleNormalModeKeys');`}
      />

      <h3>Keyboard Shortcuts with Modifiers</h3>
      <p>Handle complex key combinations with modifier keys:</p>

      <CodeBlock
        language="tsx"
        code={`const handleShortcutsWithModifiers = action((event: KeyboardEvent) => {
  const { key, ctrlKey, metaKey, shiftKey, altKey } = event;
  const cmdOrCtrl = ctrlKey || metaKey; // Cmd on Mac, Ctrl on Windows/Linux

  // Text editing shortcuts
  if (cmdOrCtrl) {
    switch (key) {
      case 'a':
        selectAll();
        event.preventDefault();
        break;
      case 'c':
        copySelection();
        event.preventDefault();
        break;
      case 'v':
        pasteFromClipboard();
        event.preventDefault();
        break;
      case 'x':
        cutSelection();
        event.preventDefault();
        break;
      case 'z':
        if (shiftKey) {
          redo();
        } else {
          undo();
        }
        event.preventDefault();
        break;
      case 'f':
        openFindDialog();
        event.preventDefault();
        break;
      case 'n':
        if (shiftKey) {
          createNewFolder();
        } else {
          createNewFile();
        }
        event.preventDefault();
        break;
    }
  }
  
  // Alt/Option shortcuts
  if (altKey) {
    switch (key) {
      case 'ArrowUp':
        moveSelectionUp();
        event.preventDefault();
        break;
      case 'ArrowDown':
        moveSelectionDown();
        event.preventDefault();
        break;
    }
  }
  
  // Shift shortcuts (usually for selection)
  if (shiftKey && !cmdOrCtrl) {
    switch (key) {
      case 'ArrowUp':
        extendSelectionUp();
        event.preventDefault();
        break;
      case 'ArrowDown':
        extendSelectionDown();
        event.preventDefault();
        break;
    }
  }
}, 'handleShortcutsWithModifiers');`}
      />

      <h3>Focus-Aware Shortcuts</h3>
      <p>Only handle shortcuts when appropriate elements are focused:</p>

      <CodeBlock
        language="tsx"
        code={`const setupFocusAwareShortcuts = effect(() => {
  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    
    // Don't handle shortcuts if user is typing in an input
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      return;
    }
    
    // Only handle shortcuts when the main app area is focused
    if (!target.closest('.app-main')) {
      return;
    }
    
    // Now handle the shortcuts
    switch (event.key) {
      case 'j':
        selectNext();
        event.preventDefault();
        break;
      case 'k':
        selectPrevious();
        event.preventDefault();
        break;
      case 'Enter':
        openSelected();
        event.preventDefault();
        break;
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, 'focusAwareShortcuts');`}
      />

      <h2>Component Integration</h2>
      <p>
        Here's how to integrate keyboard shortcuts in your React components:
      </p>

      <CodeBlock
        language="tsx"
        code={`// Calculator.tsx
import React, { useEffect } from 'react';
import { useUnderstate } from 'react-understate';
import { calculatorStore } from './calculatorStore';

function Calculator() {
  const { displayValue, operation, handleKeyDown, clear } = useUnderstate(calculatorStore);

  // Set up keyboard shortcuts
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      handleKeyDown(event);
    };

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [handleKeyDown]);

  return (
    <div 
      className="calculator"
      tabIndex={0} // Make it focusable
      onKeyDown={(e) => handleKeyDown(e.nativeEvent)}
    >
      <div className="display">
        {displayValue}
        {operation && <span className="operation">{operation}</span>}
      </div>
      
      <div className="keypad">
        <button onClick={clear}>Clear (Esc)</button>
        {/* Other buttons... */}
      </div>
      
      <div className="shortcuts-help">
        <h4>Keyboard Shortcuts:</h4>
        <ul>
          <li><kbd>0-9</kbd> - Input digits</li>
          <li><kbd>+ - * /</kbd> - Operations</li>
          <li><kbd>Enter</kbd> or <kbd>=</kbd> - Calculate</li>
          <li><kbd>Esc</kbd> - Clear</li>
          <li><kbd>.</kbd> - Decimal point</li>
          <li><kbd>%</kbd> - Percentage</li>
          <li><kbd>P</kbd> - Plus/minus toggle</li>
        </ul>
      </div>
    </div>
  );
}`}
      />

      <h2>Testing Keyboard Shortcuts</h2>
      <p>Test keyboard shortcuts by dispatching keyboard events:</p>

      <CodeBlock
        language="tsx"
        code={`// keyboardShortcuts.test.ts
import { fireEvent } from '@testing-library/react';
import { calculatorStore } from './calculatorStore';

describe('Calculator Keyboard Shortcuts', () => {
  beforeEach(() => {
    calculatorStore.clear();
  });

  test('number keys input digits', () => {
    const event = new KeyboardEvent('keydown', { key: '5' });
    calculatorStore.handleKeyDown(event);
    
    expect(calculatorStore.displayValue.value).toBe('5');
  });

  test('operation keys perform operations', () => {
    // Input: 5 + 3 =
    fireEvent.keyDown(document, { key: '5' });
    fireEvent.keyDown(document, { key: '+' });
    fireEvent.keyDown(document, { key: '3' });
    fireEvent.keyDown(document, { key: 'Enter' });
    
    expect(calculatorStore.displayValue.value).toBe('8');
  });

  test('escape key clears calculator', () => {
    calculatorStore.inputDigit('123');
    fireEvent.keyDown(document, { key: 'Escape' });
    
    expect(calculatorStore.displayValue.value).toBe('0');
  });

  test('prevents default for handled keys', () => {
    const event = new KeyboardEvent('keydown', { key: '+' });
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    calculatorStore.handleKeyDown(event);
    
    expect(preventDefaultSpy).toHaveBeenCalled();
  });
});`}
      />

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Prevent default:</strong> Always call{' '}
          <code>preventDefault()</code> for handled keys
        </li>
        <li>
          <strong>Consider focus:</strong> Don't interfere with typing in form
          fields
        </li>
        <li>
          <strong>Use standard conventions:</strong> Follow platform conventions
          (Cmd on Mac, Ctrl on Windows)
        </li>
        <li>
          <strong>Provide visual feedback:</strong> Show which shortcuts are
          available
        </li>
        <li>
          <strong>Clean up listeners:</strong> Always remove event listeners in
          effect cleanup
        </li>
        <li>
          <strong>Test thoroughly:</strong> Test all key combinations and edge
          cases
        </li>
        <li>
          <strong>Be accessible:</strong> Ensure keyboard shortcuts improve, not
          hinder, accessibility
        </li>
        <li>
          <strong>Document shortcuts:</strong> Make shortcuts discoverable
          through UI hints
        </li>
      </ul>

      <div className={styles.navigation}>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Previous</span>
          <Link to="/patterns" className={styles.navLink}>
            ← Patterns Index
          </Link>
        </div>
        <div className={styles.navItem}>
          <span className={styles.navLabel}>Next</span>
          <Link to="/patterns/local-storage" className={styles.navLink}>
            Local Storage →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcuts;
