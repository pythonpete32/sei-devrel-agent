#!/bin/bash

# Mentat precommit script to run linting and formatting
echo "🔧 Running Biome linting and formatting..."

# Run Biome check (includes linting and formatting)
bun run check

# Check if there were any errors
if [ $? -ne 0 ]; then
    echo "❌ Linting failed. Trying to auto-fix..."
    
    # Try to auto-fix linting issues
    bun run lint
    
    if [ $? -ne 0 ]; then
        echo "❌ Auto-fix failed. Please fix linting issues manually."
        exit 1
    fi
    
    echo "✅ Auto-fix successful."
fi

# Run formatting
echo "📝 Formatting code..."
bun run format

echo "✅ All checks passed!"
