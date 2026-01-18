#!/bin/bash

# Script to update README with Garmin swim data automatically
# Usage: ./update_swim_stats.sh

cd "$(dirname "$0")/garmin"

# Check if .env file exists
if [ ! -f .env ]; then
  echo "Error: .env file not found in garmin directory"
  echo "Please create a .env file with your Garmin credentials"
  echo "See .env.example for template"
  exit 1
fi

# Check if node_modules exists
if [ ! -d node_modules ]; then
  echo "Installing dependencies..."
  npm install
fi

# Load environment variables
export $(cat .env | xargs)

# Fetch swim data from Garmin
echo "Fetching swim data from Garmin Connect..."
SWIM_DATA=$(node get-swim-data.js)

if [ $? -ne 0 ]; then
  echo "Failed to fetch Garmin data"
  exit 1
fi

# Parse JSON response
DAYS_SWAM=$(echo $SWIM_DATA | grep -o '"daysSwam":[0-9]*' | grep -o '[0-9]*')
DISTANCE_YARDS=$(echo $SWIM_DATA | grep -o '"totalDistanceYards":[0-9]*' | grep -o '[0-9]*')

echo "Swim data retrieved:"
echo "  Days swam: $DAYS_SWAM"
echo "  Total distance: $DISTANCE_YARDS yards"

# Go back to root directory
cd ..

# Update README.md
sed -i '' "s/\*\*Days swam this week:\*\* .*/\*\*Days swam this week:\*\* $DAYS_SWAM/" README.md
sed -i '' "s/\*\*Total Distance this week:\*\* .*/\*\*Total Distance this week:\*\* $DISTANCE_YARDS yards/" README.md

echo ""
echo "README.md updated successfully!"
