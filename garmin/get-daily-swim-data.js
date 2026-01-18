import pkg from 'garmin-connect';
const { GarminConnect } = pkg;

async function getDailySwimData() {
  const gcClient = new GarminConnect({
    username: process.env.GARMIN_USERNAME,
    password: process.env.GARMIN_PASSWORD
  });

  try {
    // Suppress console output during login
    const originalLog = console.log;
    const originalError = console.error;
    console.log = () => {};
    console.error = () => {};
    
    await gcClient.login();
    
    // Restore console
    console.log = originalLog;
    console.error = originalError;

    // Get data for the last year
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Fetch activities
    const activities = await gcClient.getActivities(0, 500);

    // Filter for swimming activities in the last year
    const swimActivities = activities.filter(activity => {
      const activityDate = new Date(activity.startTimeLocal);
      const isSwim = activity.activityType?.typeKey?.toLowerCase().includes('swim') || 
                     activity.activityName?.toLowerCase().includes('swim');
      const isInRange = activityDate >= startDate && activityDate <= endDate;
      return isSwim && isInRange;
    });

    // Group by date and sum distances
    const dailyData = {};
    swimActivities.forEach(activity => {
      const date = activity.startTimeLocal.split(' ')[0]; // Get YYYY-MM-DD
      const distanceMeters = activity.distance || 0;
      
      if (!dailyData[date]) {
        dailyData[date] = 0;
      }
      dailyData[date] += distanceMeters;
    });

    console.log(JSON.stringify(dailyData));

  } catch (error) {
    // Write to stderr so it doesn't interfere with JSON output
    process.stderr.write(`Error fetching Garmin data: ${error.message}\n`);
    process.exit(1);
  }
}

getDailySwimData();
