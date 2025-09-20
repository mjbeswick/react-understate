// ❌ Before
const count = state(0)
function Counter() {
  return <div>{count.value}</div>
}

// ✅ After
function Counter() {
  useUnderstate(count)
  return <div>{count.value}</div>
}