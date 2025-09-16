// Calculator.tsx
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
}