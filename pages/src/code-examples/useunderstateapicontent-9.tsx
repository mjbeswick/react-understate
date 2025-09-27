import React from 'react';
import { state, useUnderstate, action } from 'react-understate';

const errorStore = {
  hasError: state(false, 'hasError'),
  errorMessage: state('', 'errorMessage'),

  setError: action((message: string) => {
    errorStore.hasError.value = true;
    errorStore.errorMessage.value = message;
  }, 'setError'),

  clearError: action(() => {
    errorStore.hasError.value = false;
    errorStore.errorMessage.value = '';
  }, 'clearError'),
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Report error to global error store
    errorStore.setError(error.message);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorDisplay />;
    }

    return this.props.children;
  }
}

function ErrorDisplay() {
  const { errorMessage, clearError } = useUnderstate(errorStore);

  return (
    <div
      style={{ padding: '20px', background: '#fee', border: '1px solid #f00' }}
    >
      <h2>Something went wrong!</h2>
      <p>{errorMessage}</p>
      <button onClick={clearError}>Try Again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <YourAppComponents />
    </ErrorBoundary>
  );
}
