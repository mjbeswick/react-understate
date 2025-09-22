import React from 'react';
import { useUnderstate } from 'react-understate';
import { count } from './introduction-2';

export default function Counter() {
  const [value] = useUnderstate(count);
  return (
    <button onClick={() => (count.value = value + 1)}>
      Count: {value}
    </button>
  );
}

import React from 'react';
import { useUnderstate } from 'react-understate';
import * as store from './introduction-2';

function BearCounter() {
  const { count } = useUnderstate(store);
  return <h1>{count} bears around here...</h1>;
}

function Controls() {
  const { increment } = useUnderstate(store);
  return <button onClick={increment}>one up</button>;
}
