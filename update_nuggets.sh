#!/bin/bash

echo "Fetching latest Nuggets score..."

# Run the nuggets-call script and capture output
cd nuggets-call
output=$(npm start 2>&1)
cd ..

# Extract the individual lines
nuggets_score=$(echo "$output" | grep "^Nuggets:" | head -1)
opponent_score=$(echo "$output" | grep -v "^Nuggets:" | grep ":" | head -1)
result=$(echo "$output" | grep "Nuggets \(Won\|Lost\)")

if [ -z "$nuggets_score" ]; then
    echo "Failed to fetch Nuggets scores"
    exit 1
fi

# Update the README - remove everything after "## Latest Nuggets Scores" and add new content
sed -i '' '/## Latest Nuggets Scores/,$d' README.md

# Append the new scores section
cat >> README.md << EOF
## Latest Nuggets Scores

**$nuggets_score**
**$opponent_score**

$result
EOF

echo ""
echo "README.md updated successfully with latest Nuggets scores!"
echo "$nuggets_score"
echo "$opponent_score"
echo "$result"
