import { state, action } from 'react-understate'

// Store object pattern (react-understate)
export const store = {
  count: state(0, 'count'),
  increment: action(() => {
    store.count.value = store.count.value + 1
  }, 'increment'),
  decrement: action(() => {
    store.count.value = store.count.value - 1
  }, 'decrement'),
  reset: action(() => {
    store.count.value = 0
  }, 'reset'),
}