#!/bin/bash

# Get current hour (0-23)
hour=$(date +%H)

# Remove leading zero for arithmetic
hour=$((10#$hour))

if [ $hour -ge 8 ] && [ $hour -lt 13 ]; then
    # 08:00 to 12:59 - count up from 0% to 100%
    # 08:00 = 0%, 09:00 = 20%, 10:00 = 40%, 11:00 = 60%, 12:00 = 80%, 01:00 (13:00) = 100%
    percentage=$(((hour - 8) * 20))
elif [ $hour -ge 13 ] && [ $hour -lt 23 ]; then
    # 13:00 (01:00 PM) to 22:59 - count down from 100% to 10%
    # 13:00 = 100%, 14:00 = 90%, 15:00 = 80%, ..., 22:00 = 10%
    percentage=$((100 - (hour - 13) * 10))
elif [ $hour -ge 23 ] || [ $hour -lt 8 ]; then
    # 23:00 to 07:59 - stays at 0%
    percentage=0
fi

# Get the directory where the script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Update the README.md file (works on both Linux and macOS)
sed -i.bak "s/\*\*Current Energy:\*\* [0-9]\{1,3\}\/100/\*\*Current Energy:\*\* ${percentage}\/100/" "$SCRIPT_DIR/README.md" && rm "$SCRIPT_DIR/README.md.bak"

# Update the energy.svg file - update both the animation width and display text
sed -i.bak "s/to { width: [0-9]\{1,3\}%;/to { width: ${percentage}%;/" "$SCRIPT_DIR/energy.svg" && rm "$SCRIPT_DIR/energy.svg.bak"
sed -i.bak "s/<div id=\"energy\">[0-9]\{1,3\}%<\/div>/<div id=\"energy\">${percentage}%<\/div>/" "$SCRIPT_DIR/energy.svg" && rm "$SCRIPT_DIR/energy.svg.bak"

echo "${percentage}%"
