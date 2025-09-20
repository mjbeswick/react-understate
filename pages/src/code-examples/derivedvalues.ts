import { state, derived } from 'react-understate';

// Basic state
const firstName = state('John', { name: 'firstName' });
const lastName = state('Doe', { name: 'lastName' });
const age = state(30, { name: 'age' });

// Simple derived values
export const fullName = derived(() => {
  return `${firstName()} ${lastName()}`;
}, { name: 'fullName' });

export const isAdult = derived(() => {
  return age() >= 18;
}, { name: 'isAdult' });

export const greeting = derived(() => {
  const name = fullName();
  const adult = isAdult();
  return `Hello, ${name}! You are ${adult ? 'an adult' : 'a minor'}.`;
}, { name: 'greeting' });

// Derived values automatically update when dependencies change
firstName('Jane'); // fullName and greeting automatically update
age(16);           // isAdult and greeting automatically update