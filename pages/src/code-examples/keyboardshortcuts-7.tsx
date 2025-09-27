// keyboardShortcuts.test.ts
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
});
