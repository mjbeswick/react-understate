import { state, derived } from 'react-understate';

const inputValue = state('42');

const parsedNumber = derived(() => {
  try {
    const num = parseFloat(inputValue.value);
    if (isNaN(num)) {
      throw new Error('Invalid number');
    }
    return { value: num, error: null };
  } catch (error) {
    return { value: 0, error: error.message };
  }
});

const calculation = derived(() => {
  const parsed = parsedNumber.value;
  if (parsed.error) {
    return { result: null, error: parsed.error };
  }

  try {
    const result = Math.sqrt(parsed.value);
    return { result, error: null };
  } catch (error) {
    return { result: null, error: 'Calculation failed' };
  }
});

function Calculator() {
  const {
    inputValue: input,
    parsedNumber: parsed,
    calculation: calc,
  } = useUnderstate({
    inputValue,
    parsedNumber,
    calculation,
  });

  return (
    <div>
      <input
        value={input}
        onChange={e => (inputValue.value = e.target.value)}
        placeholder="Enter a number"
      />

      {parsed.error && (
        <p style={{ color: 'red' }}>Input Error: {parsed.error}</p>
      )}

      {calc.error ? (
        <p style={{ color: 'red' }}>Calculation Error: {calc.error}</p>
      ) : (
        <p>Square Root: {calc.result?.toFixed(2)}</p>
      )}
    </div>
  );
}
