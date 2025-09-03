// Test file for ESLint auto-fix
const displayValue = { value: '0' };
const previousValue = { value: null };
const operation = { value: null };
const waitingForOperand = { value: false };

export const testFunction = () => {
  batch(() => {
    displayValue.value = '0';
    previousValue.value = null;
    operation.value = null;
    waitingForOperand.value = false
  });
};
