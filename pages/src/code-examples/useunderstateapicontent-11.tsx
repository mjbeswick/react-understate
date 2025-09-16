import { render, screen, fireEvent } from '@testing-library/react';
import { state, useUnderstate, action } from 'react-understate';

// Test store
const testStore = {
  count: state(0, 'testCount'),
  increment: action(() => {
    testStore.count.value++;
  }, 'testIncrement')
};

// Component under test
function TestCounter() {
  const { count, increment } = useUnderstate(testStore);
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button data-testid="increment" onClick={increment}>
        Increment
      </button>
    </div>
  );
}

describe('useUnderstate integration', () => {
  beforeEach(() => {
    // Reset state before each test
    testStore.count.value = 0;
  });
  
  it('should render current state value', () => {
    render(<TestCounter />);
    
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });
  
  it('should update when state changes', () => {
    render(<TestCounter />);
    
    const incrementButton = screen.getByTestId('increment');
    fireEvent.click(incrementButton);
    
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });
  
  it('should update when state changes externally', () => {
    render(<TestCounter />);
    
    // Update state outside component
    testStore.count.value = 42;
    
    expect(screen.getByTestId('count')).toHaveTextContent('42');
  });
  
  it('should handle multiple rapid updates', () => {
    render(<TestCounter />);
    
    const incrementButton = screen.getByTestId('increment');
    
    // Rapid clicks
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    fireEvent.click(incrementButton);
    
    expect(screen.getByTestId('count')).toHaveTextContent('3');
  });
});