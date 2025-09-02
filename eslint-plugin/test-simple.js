// Simple test file to demonstrate the ESLint plugin
// This file contains examples of correct and incorrect usage

const { state, useSubscribe } = require("react-understate");

const count = state(0);
const name = state("John");

// ❌ INCORRECT: Missing useSubscribe
function BadCounter() {
  console.log(count.value); // Error: Missing useSubscribe call
}

// ✅ CORRECT: Proper useSubscribe usage
function GoodCounter() {
  useSubscribe(count);
  console.log(count.value);
}

// ✅ CORRECT: Multiple useSubscribe calls
function GoodUserInfo() {
  useSubscribe(name);
  useSubscribe(count);

  console.log(name.value);
  console.log(count.value);
}

// ✅ CORRECT: Arrow function component
const GoodArrowComponent = () => {
  useSubscribe(count);
  console.log(count.value);
};

// ❌ INCORRECT: Arrow function without useSubscribe
const BadArrowComponent = () => {
  console.log(count.value); // Error: Missing useSubscribe call
};

// ✅ CORRECT: Non-component function (should not trigger error)
function regularFunction() {
  return count.value; // This is fine - not a React component
}
