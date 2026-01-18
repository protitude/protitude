interface Game {
  id: number;
  date: string;
  home_team: Team;
  visitor_team: Team;
  home_team_score: number;
  visitor_team_score: number;
  status: string;
}

interface Team {
  id: number;
  name: string;
  full_name: string;
}

interface ApiResponse {
  data: Game[];
}

async function fetchNuggetsScore(date: string): Promise<Game | null> {
  const apiKey = process.env.NBA;

  if (!apiKey) {
    throw new Error('NBA API key not found in environment variables');
  }

  const url = `https://api.balldontlie.io/v1/games?team_ids[]=8&dates[]=${date}`;

  const response = await fetch(url, {
    headers: {
      'Authorization': apiKey
    }
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  const data: ApiResponse = await response.json();

  return data.data.length > 0 ? data.data[0] : null;
}

// Example usage
//const today = '2025-12-25';
// yesterdays date in the format '2025-12-26';
//const today = new Date().toISOString().split('T')[0]; // 'YYYY-MM-DD
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

fetchNuggetsScore(yesterday)
  .then(game => {
    if (game) {
      console.log(`${game.visitor_team.full_name}: ${game.visitor_team_score}`);
      console.log(`${game.home_team.full_name}: ${game.home_team_score}`);
    } else {
      console.log('No game found');
    }
  })
  .catch(error => console.error('Error:', error));
