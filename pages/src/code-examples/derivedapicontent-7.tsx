import { state, derived } from 'react-understate';

const mode = state('simple');
const simpleValue = state(10);
const complexValue = state({ x: 5, y: 15 });

// Conditional computation based on mode
const result = derived(() => {
  if (mode.value === 'simple') {
    // Only depends on simpleValue when in simple mode
    return simpleValue.value * 2;
  } else {
    // Only depends on complexValue when in complex mode
    return complexValue.value.x * complexValue.value.y;
  }
});

// This derived will only recalculate when:
// - mode changes, OR
// - mode is 'simple' AND simpleValue changes, OR
// - mode is 'complex' AND complexValue changes
