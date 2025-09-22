import { state, useUnderstate } from 'react-understate';

// Store functions in state
const mathOperation = state((a: number, b: number) => a + b);
const validationRules = state({
  email: (email: string) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email),
  password: (pwd: string) => pwd.length >= 8
});

function Calculator() {
  const [operation] = useUnderstate(mathOperation);
  const [rules] = useUnderstate(validationRules);
  
  const switchToMultiply = () => {
    mathOperation.value = (a, b) => a * b;
  };
  
  return (
    <div>
      <p>5 + 3 = {operation(5, 3)}</p>
      <button onClick={switchToMultiply}>
        Switch to Multiplication
      </button>
      
      <p>Valid email: {rules.email('test@example.com') ? 'Yes' : 'No'}</p>
    </div>
  );
}