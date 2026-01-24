#!/bin/bash

# Script to generate swim contribution graph from Garmin data
# Usage: ./update_swim_graph.sh

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

# Fetch daily swim data from Garmin
echo "Fetching daily swim data from Garmin Connect..."
DAILY_SWIM_DATA=$(node get-daily-swim-data.js)

if [ $? -ne 0 ]; then
  echo "Failed to fetch Garmin data"
  exit 1
fi

echo "Generating swim contribution graph..."

# Go back to root directory
cd ..

# Generate SVG
echo "$DAILY_SWIM_DATA" | node generate-swim-graph.js > swim-graph.svg

if [ $? -ne 0 ]; then
  echo "Failed to generate swim graph"
  exit 1
fi

echo "Swim graph generated successfully: swim-graph.svg"
