// Simple test to verify debug logging is working
import { inputDigit, clear } from './store.js';

console.log('Testing debug logging...');

// Test clear action
console.log('Calling clear()...');
clear();

// Test inputDigit action
console.log('Calling inputDigit("5")...');
inputDigit('5');

console.log('Debug test completed');
