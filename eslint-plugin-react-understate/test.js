// Test file to demonstrate the ESLint plugin
// This file contains examples of correct and incorrect usage

import { state, useSubscribe } from 'react-understate';

const count = state(0);
const name = state('John');
const isActive = state(false);

// ❌ INCORRECT: Missing useSubscribe
function BadCounter() {
  return <div>Count: {count.value}</div>; // Error: Missing useSubscribe call
}

// ❌ INCORRECT: Missing useSubscribe for multiple states
function BadUserInfo() {
  return (
    <div>
      <p>Name: {name.value}</p> {/* Error: Missing useSubscribe call */}
      <p>Count: {count.value}</p> {/* Error: Missing useSubscribe call */}
    </div>
  );
}

// ✅ CORRECT: Proper useSubscribe usage
function GoodCounter() {
  useSubscribe(count);
  return <div>Count: {count.value}</div>;
}

// ✅ CORRECT: Multiple useSubscribe calls
function GoodUserInfo() {
  useSubscribe(name);
  useSubscribe(count);
  
  return (
    <div>
      <p>Name: {name.value}</p>
      <p>Count: {count.value}</p>
    </div>
  );
}

// ✅ CORRECT: Arrow function component
const GoodArrowComponent = () => {
  useSubscribe(isActive);
  return <div>Active: {isActive.value ? 'Yes' : 'No'}</div>;
};

// ❌ INCORRECT: Arrow function without useSubscribe
const BadArrowComponent = () => {
  return <div>Active: {isActive.value ? 'Yes' : 'No'}</div>; // Error: Missing useSubscribe call
};

// ✅ CORRECT: Non-component function (should not trigger error)
function regularFunction() {
  return count.value; // This is fine - not a React component
}

// ✅ CORRECT: Lowercase function (not detected as React component)
function lowercaseFunction() {
  return <div>{count.value}</div>; // This is fine - not detected as React component
}
