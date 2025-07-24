#!/bin/bash

# Script to update all localhost:5000 references to use dynamic API configuration

# Function to update a file
update_file() {
    local file="$1"
    echo "Updating $file..."
    
    # Check if file already imports createApiUrl
    if ! grep -q "createApiUrl" "$file" 2>/dev/null; then
        # Add import statement after existing imports
        if grep -q "import.*axios.*from.*axios" "$file" 2>/dev/null; then
            # Add import after axios import
            sed -i "/import.*axios.*from.*axios/a import { createApiUrl } from '../config/api'" "$file" 2>/dev/null || \
            sed -i "/import.*axios.*from.*axios/a import { createApiUrl } from '../../config/api'" "$file" 2>/dev/null || \
            sed -i "/import.*axios.*from.*axios/a import { createApiUrl } from '../../../config/api'" "$file" 2>/dev/null
        fi
    fi
    
    # Replace all http://localhost:5000 with createApiUrl calls
    sed -i "s|'http://localhost:5000/\([^']*\)'|createApiUrl('\1')|g" "$file" 2>/dev/null
    sed -i 's|`http://localhost:5000/\([^`]*\)`|createApiUrl(`\1`)|g' "$file" 2>/dev/null
    sed -i 's|"http://localhost:5000/\([^"]*\)"|createApiUrl("\1")|g' "$file" 2>/dev/null
}

# Find all TypeScript/JavaScript files that contain localhost:5000
echo "Finding files with localhost:5000 references..."

# Update files in frontend/src
find frontend/src -name "*.tsx" -o -name "*.ts" | while read file; do
    if grep -q "http://localhost:5000" "$file" 2>/dev/null; then
        update_file "$file"
    fi
done

echo "✅ All localhost:5000 references have been updated!"
echo "🔄 Please restart the development server to apply changes."
