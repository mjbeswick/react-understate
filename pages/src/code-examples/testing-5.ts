import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useUnderstate } from 'react-understate';

// Test component
const Counter = () => {
  const count = useUnderstate(counterState);
  const increment = useUnderstate(incrementAction);
  
  return (
    <div>
      <span data-testid="count">{count}</span>
      <button onClick={increment}>Increment</button>
    </div>
  );
};

// Testing React components
describe('React Component Testing', () => {
  beforeEach(() => {
    // Reset state before each test
    counterState(0);
  });

  test('should render initial state', () => {
    render(<Counter />);
    
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  test('should update when state changes', () => {
    render(<Counter />);
    
    // Update state directly
    counterState(5);
    
    expect(screen.getByTestId('count')).toHaveTextContent('5');
  });

  test('should handle user interactions', () => {
    render(<Counter />);
    
    const button = screen.getByText('Increment');
    fireEvent.click(button);
    
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  test('should handle multiple state subscriptions', () => {
    const MultiStateComponent = () => {
      const count = useUnderstate(counterState);
      const name = useUnderstate(nameState);
      
      return (
        <div>
          <span data-testid="count">{count}</span>
          <span data-testid="name">{name}</span>
        </div>
      );
    };
    
    render(<MultiStateComponent />);
    
    counterState(5);
    nameState('John');
    
    expect(screen.getByTestId('count')).toHaveTextContent('5');
    expect(screen.getByTestId('name')).toHaveTextContent('John');
  });
});

// Testing component with effects
describe('Component with Effects', () => {
  test('should handle effect cleanup on unmount', () => {
    const cleanupSpy = jest.fn();
    
    const EffectComponent = () => {
      const count = useUnderstate(counterState);
      
      React.useEffect(() => {
        const interval = setInterval(() => {
          console.log('tick');
        }, 100);
        
        return () => {
          cleanupSpy();
          clearInterval(interval);
        };
      }, [count]);
      
      return <div>{count}</div>;
    };
    
    const { unmount } = render(<EffectComponent />);
    
    // Unmount component
    unmount();
    
    expect(cleanupSpy).toHaveBeenCalled();
  });
});

// Testing async components
describe('Async Component Testing', () => {
  test('should handle async state updates', async () => {
    const AsyncComponent = () => {
      const data = useUnderstate(asyncDataState);
      const loading = useUnderstate(loadingState);
      
      if (loading) {
        return <div>Loading...</div>;
      }
      
      return <div data-testid="data">{data?.name}</div>;
    };
    
    render(<AsyncComponent />);
    
    // Trigger async update
    loadingState(true);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    
    // Simulate async completion
    await waitFor(() => {
      loadingState(false);
      asyncDataState({ name: 'Test Data' });
    });
    
    expect(screen.getByTestId('data')).toHaveTextContent('Test Data');
  });
});