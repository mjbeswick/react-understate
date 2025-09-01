#!/bin/bash

# Run all React Understate examples
echo "Starting all React Understate examples..."

# Function to run an example
run_example() {
    local example=$1
    local port=$2

    echo "Starting $example on port $port..."
    cd "$example"
    npm install --silent
    npm run dev &
    cd ..
}

# Get all directories in examples folder
examples=($(find . -maxdepth 1 -type d -not -name "." -not -name "node_modules" | sort))

# Start port counter
port=5173

# Start all examples
for example in "${examples[@]}"; do
    # Remove "./" prefix
    example_name=${example#./}

    # Skip if no package.json exists
    if [ ! -f "$example/package.json" ]; then
        echo "Skipping $example_name (no package.json found)"
        continue
    fi

    run_example "$example_name" "$port"
    ((port++))
done

echo ""
echo "All examples are starting..."
echo "Press Ctrl+C to stop all examples"

# Wait for all background processes
wait
