import pkg from 'garmin-connect';
const { GarminConnect } = pkg;

async function getWeeklySwimData() {
  const gcClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME,
    password: process.env.GARMIN_PASSWORD
  });

  try {
    // Use pre-generated OAuth tokens to avoid Cloudflare 429 on login
    if (process.env.GARMIN_TOKENS) {
      const { oauth1, oauth2 } = JSON.parse(process.env.GARMIN_TOKENS);
      gcClient.loadToken(oauth1, oauth2);
    } else {
      await gcClient.login();
    }

    // Get Monday of current week
    const now = new Date();
    const dayOfWeek = now.getDay();
    const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Sunday = 0, adjust to Monday start
    const monday = new Date(now);
    monday.setDate(now.getDate() - diff);
    monday.setHours(0, 0, 0, 0);

    // Get Sunday of current week
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Fetch activities for the week
    const activities = await gcClient.getActivities(0, 50); // Get recent activities

    // Filter for swimming activities in current week
    const swimActivities = activities.filter(activity => {
      const activityDate = new Date(activity.startTimeLocal);
      const isSwim = activity.activityType?.typeKey?.toLowerCase().includes('swim') || 
                     activity.activityName?.toLowerCase().includes('swim');
      const isThisWeek = activityDate >= monday && activityDate <= sunday;
      return isSwim && isThisWeek;
    });

    // Calculate totals
    const daysSwam = swimActivities.length;
    const totalDistanceMeters = swimActivities.reduce((sum, activity) => {
      return sum + (activity.distance || 0);
    }, 0);

    // Convert meters to yards (1 meter = 1.09361 yards)
    const totalDistanceYards = Math.round(totalDistanceMeters * 1.09361);

    console.log(JSON.stringify({
      daysSwam,
      totalDistanceYards,
      weekStart: monday.toISOString().split('T')[0],
      weekEnd: sunday.toISOString().split('T')[0]
    }));

  } catch (error) {
    console.error('Error fetching Garmin data:', error.message);
    process.exit(1);
  }
}

getWeeklySwimData();
