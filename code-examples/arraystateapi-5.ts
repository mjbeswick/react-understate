// Get array length
items.length: number

// Get/set array value
items.value: T[]

// Subscribe to changes
items.subscribe(fn: () => void): () => void