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
