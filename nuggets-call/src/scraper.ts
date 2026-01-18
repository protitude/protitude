import puppeteer from 'puppeteer';

async function scrapeNuggetsScores() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();
    console.log('Navigating to NBA Nuggets page...');
    
    await page.goto('https://nba.com/nuggets', {
      waitUntil: 'networkidle2',
      timeout: 30000,
    });

    console.log('Waiting for game results...');
    await page.waitForSelector('[class^="Game_featuredGameResult"]', {
      timeout: 10000,
    });

    const gameData = await page.evaluate(() => {
      const scoreElements = document.querySelectorAll('[class^="Game_featuredGameResult"] span.leading-none');
      const teamElements = document.querySelectorAll('[class^="Game_featuredGameTeam"] p.leading-none');
      
      const scores = [];
      const teams = [];
      
      for (let i = 0; i < Math.min(2, scoreElements.length); i++) {
        scores.push(scoreElements[i].textContent?.trim() || '');
      }
      
      for (let i = 0; i < Math.min(2, teamElements.length); i++) {
        teams.push(teamElements[i].textContent?.trim() || '');
      }
      
      return { scores, teams };
    });

    console.log('\n=== Latest Nuggets Scores ===');
    gameData.teams.forEach((team, index) => {
      console.log(`${team}: ${gameData.scores[index]}`);
    });

    const nuggetsIndex = gameData.teams.findIndex(team => 
      team.toLowerCase().includes('nuggets')
    );
    
    if (nuggetsIndex !== -1) {
      const opponentIndex = nuggetsIndex === 0 ? 1 : 0;
      const nuggetsScore = parseInt(gameData.scores[nuggetsIndex]);
      const opponentScore = parseInt(gameData.scores[opponentIndex]);
      
      if (nuggetsScore > opponentScore) {
        console.log('\nNuggets win! 🎉');
      } else if (nuggetsScore < opponentScore) {
        console.log('\nNuggets Lost 😿');
      } else {
        console.log('\nIt\'s a tie! 🤝');
      }
    }

    return gameData;
  } catch (error) {
    console.error('Error scraping scores:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

scrapeNuggetsScores().catch(console.error);
