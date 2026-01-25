#!/bin/bash

# Script to update README with latest Nuggets score
# Usage: ./update_nuggets.sh

cd "$(dirname "$0")/balldontlie"

# Fetch latest Nuggets score
echo "Fetching latest Nuggets score..."
SCORE_OUTPUT=$(npx tsx fetchNuggetsScore.ts 2>&1)

if [ $? -ne 0 ]; then
  echo "Failed to fetch Nuggets score"
  exit 1
fi

# Check if no game was found
if echo "$SCORE_OUTPUT" | grep -q "No game found"; then
  echo "No game found - skipping README update"
  exit 0
fi

# Parse the output - expecting two lines:
# Team 1: Score 1
# Team 2: Score 2
TEAM1=$(echo "$SCORE_OUTPUT" | grep -v "^⠋\|^⠙\|^⠹\|^⠸\|^⠼\|^⠴\|^⠦\|^⠧\|^⠇\|^⠏" | head -1 | sed 's/:.*//')
SCORE1=$(echo "$SCORE_OUTPUT" | grep -v "^⠋\|^⠙\|^⠹\|^⠸\|^⠼\|^⠴\|^⠦\|^⠧\|^⠇\|^⠏" | head -1 | sed 's/.*: //')
TEAM2=$(echo "$SCORE_OUTPUT" | grep -v "^⠋\|^⠙\|^⠹\|^⠸\|^⠼\|^⠴\|^⠦\|^⠧\|^⠇\|^⠏" | tail -1 | sed 's/:.*//')
SCORE2=$(echo "$SCORE_OUTPUT" | grep -v "^⠋\|^⠙\|^⠹\|^⠸\|^⠼\|^⠴\|^⠦\|^⠧\|^⠇\|^⠏" | tail -1 | sed 's/.*: //')

echo "Game retrieved:"
echo "  $TEAM1: $SCORE1"
echo "  $TEAM2: $SCORE2"

# Determine result
if [[ "$TEAM1" == *"Nuggets"* ]]; then
  NUGGETS_SCORE=$SCORE1
  OPPONENT_TEAM=$TEAM2
  OPPONENT_SCORE=$SCORE2
else
  NUGGETS_SCORE=$SCORE2
  OPPONENT_TEAM=$TEAM1
  OPPONENT_SCORE=$SCORE1
fi

if [ "$NUGGETS_SCORE" -gt "$OPPONENT_SCORE" ]; then
  RESULT="Nuggets Won! 🎉"
else
  RESULT="Nuggets Lost 😿"
fi

# Go back to root directory
cd ..

# Update README.md - replace the Latest Nuggets Scores section
# Using a temporary file approach for more reliable updates
awk -v nuggets="$NUGGETS_SCORE" -v opponent="$OPPONENT_TEAM" -v opp_score="$OPPONENT_SCORE" -v result="$RESULT" '
/^## Latest Nuggets Scores$/ { print; in_section=1; line_num=0; next }
in_section && line_num == 0 && /^$/ { print; line_num=1; next }
in_section && line_num == 1 && /^\*\*Nuggets:/ { print "**Nuggets: " nuggets "**"; line_num=2; next }
in_section && line_num == 2 && /^$/ { print; line_num=3; next }
in_section && line_num == 3 && /^\*\*.*:/ { print "**" opponent ": " opp_score "**"; line_num=4; next }
in_section && line_num >= 4 && /^Nuggets (Won|Lost)/ { print ""; print result; in_section=0; next }
in_section && line_num >= 4 && /^$/ { next }
{ print }
' README.md > README.md.tmp && mv README.md.tmp README.md

echo ""
echo "README.md updated successfully!"
echo "$RESULT"
