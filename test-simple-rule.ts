// Simple test for the rule

import { state, effect } from 'react-understate';

const count = state(0, { name: 'count' });

effect(
  () => {
    count(42);
  },
  { name: 'badEffect' },
);
