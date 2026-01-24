#!/usr/bin/env node

import fs from 'fs';

// Read daily swim data from stdin
const input = fs.readFileSync(0, 'utf-8');
const dailyData = JSON.parse(input);

// Configuration
const CELL_SIZE = 10;
const CELL_GAP = 2;
const WEEK_WIDTH = CELL_SIZE + CELL_GAP;
const DAY_HEIGHT = CELL_SIZE + CELL_GAP;
const WEEKS_TO_SHOW = 52;
const DAYS_IN_WEEK = 7;

// Color scheme based on meters
const COLORS = {
  empty: '#ece7e1',
  level1: '#c6e3f5', // 1-549 meters - lightest blue
  level2: '#7bc8f0', // 550-1099 meters - light blue
  level3: '#3ba3e0', // 1100-2199 meters - medium blue
  level4: '#0969da', // 2200-3299 meters - dark blue
  level5: '#033d8b'  // 3300+ meters - darkest blue
};

function getColor(meters) {
  if (meters === 0) return COLORS.empty;
  if (meters < 550) return COLORS.level1;
  if (meters < 1100) return COLORS.level2;
  if (meters < 2200) return COLORS.level3;
  if (meters < 3300) return COLORS.level4;
  return COLORS.level5;
}

function getLevel(meters) {
  if (meters === 0) return 0;
  if (meters < 550) return 1;
  if (meters < 1100) return 2;
  if (meters < 2200) return 3;
  if (meters < 3300) return 4;
  return 5;
}

// Generate dates for the last 52 weeks
const today = new Date();
const startDate = new Date(today);
startDate.setDate(today.getDate() - (WEEKS_TO_SHOW * 7));

// Adjust to start on Sunday
const dayOfWeek = startDate.getDay();
startDate.setDate(startDate.getDate() - dayOfWeek);

// Build grid data
const grid = [];
let currentDate = new Date(startDate);

for (let week = 0; week < WEEKS_TO_SHOW; week++) {
  const weekData = [];
  for (let day = 0; day < DAYS_IN_WEEK; day++) {
    const dateStr = currentDate.toISOString().split('T')[0];
    const meters = dailyData[dateStr] || 0;
    weekData.push({
      date: dateStr,
      meters: Math.round(meters),
      color: getColor(meters),
      level: getLevel(meters)
    });
    currentDate.setDate(currentDate.getDate() + 1);
  }
  grid.push(weekData);
}

// Calculate SVG dimensions
const graphWidth = WEEKS_TO_SHOW * WEEK_WIDTH;
const graphHeight = DAYS_IN_WEEK * DAY_HEIGHT;
const PADDING = 20;
const LEGEND_HEIGHT = 30;
const svgWidth = graphWidth + (PADDING * 2);
const svgHeight = graphHeight + (PADDING * 2) + LEGEND_HEIGHT;

// Generate SVG
let svg = `<svg width="${svgWidth}" height="${svgHeight}" xmlns="http://www.w3.org/2000/svg">
  <style>
    .day { rx: 2; }
    .day:hover { stroke: #000; stroke-width: 1; }
    text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 9px; fill: #666; }
    .legend-text { font-size: 10px; }
  </style>
  <g transform="translate(${PADDING}, ${PADDING})">
`;

// Draw grid
grid.forEach((week, weekIndex) => {
  week.forEach((day, dayIndex) => {
    const x = weekIndex * WEEK_WIDTH;
    const y = dayIndex * DAY_HEIGHT;
    svg += `    <rect class="day" width="${CELL_SIZE}" height="${CELL_SIZE}" x="${x}" y="${y}" fill="${day.color}" data-date="${day.date}" data-meters="${day.meters}">
      <title>${day.date}: ${day.meters}m</title>
    </rect>\n`;
  });
});

// Add month labels
const monthLabels = [];
let lastMonth = -1;
grid.forEach((week, weekIndex) => {
  const firstDay = week[0];
  const date = new Date(firstDay.date);
  const month = date.getMonth();

  if (month !== lastMonth && weekIndex > 0) {
    monthLabels.push({
      x: weekIndex * WEEK_WIDTH,
      label: date.toLocaleString('default', { month: 'short' })
    });
    lastMonth = month;
  }
});

monthLabels.forEach(label => {
  svg += `    <text x="${label.x}" y="-5">${label.label}</text>\n`;
});

// Add legend
const legendY = graphHeight + 20;
svg += `    <g transform="translate(0, ${legendY})">
      <text x="0" y="8" class="legend-text">Less</text>`;

const legendSquares = [
  { color: COLORS.empty, x: 30 },
  { color: COLORS.level1, x: 42 },
  { color: COLORS.level2, x: 54 },
  { color: COLORS.level3, x: 66 },
  { color: COLORS.level4, x: 78 },
  { color: COLORS.level5, x: 90 }
];

legendSquares.forEach(square => {
  svg += `\n      <rect width="10" height="10" x="${square.x}" y="0" fill="${square.color}" rx="2"/>`;
});

svg += `\n      <text x="105" y="8" class="legend-text">More</text>
    </g>`;

svg += `
  </g>
</svg>`;

console.log(svg);
