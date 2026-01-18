# Garmin Swim Tracker

Automatically fetches swim data from Garmin Connect for the current week (Monday-Sunday).

## Setup

1. Install dependencies:
   ```bash
   cd garmin
   npm install
   ```

2. Create `.env` file with your Garmin credentials:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. Run from the root directory:
   ```bash
   ./update_swim_stats.sh
   ```

## What it does

- Logs into your Garmin Connect account
- Fetches all swim activities from Monday through Sunday of the current week
- Calculates total days swam and total distance in yards
- Updates the README.md automatically

## Manual usage

You can also fetch the data directly:
```bash
cd garmin
node get-swim-data.js
```

This outputs JSON:
```json
{
  "daysSwam": 3,
  "totalDistanceYards": 3300,
  "weekStart": "2026-01-13",
  "weekEnd": "2026-01-19"
}
```
