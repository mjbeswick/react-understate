function BearCounter() {
  const count = useCountStore((state) => state.count)
  return <h1>{count} bears around here...</h1>
}

function Controls() {
  const increment = useCountStore((state) => state.increment)
  return <button onClick={increment}>one up</button>
}