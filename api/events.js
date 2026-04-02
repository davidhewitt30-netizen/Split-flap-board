const ical = require("node-ical");

export default async function handler(request, response) {
  try {
    // PASTE YOUR WEBCAL LINK HERE
    const calendarUrl = "webcal://p161-caldav.icloud.com/published/2/ODUwNDM3NjI4NTA0Mzc2MlSLob-1XVFuM3MQvP12xNm6YB2s3sorAzrBNeoL3GdeUkdeCHrC1bPxBU2h9IQGXuwTDNCdw7psWkIvvaf_3G4".replace("webcal://", "https://");
    
    const events = await ical.async.fromURL(calendarUrl);
    
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    
    let todaysEvents = [];

    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT' && event.start) {
        const eventDate = new Date(event.start);
        
        if (
          eventDate.getDate() === todayDay &&
          eventDate.getMonth() === todayMonth &&
          eventDate.getFullYear() === todayYear
        ) {
          todaysEvents.push({
            time: eventDate.toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}),
            // Removed the strict character limits here:
            title: (event.summary || "BUSY").toUpperCase(),
            location: (event.location || "").toUpperCase()
          });
        }
      }
    }

    todaysEvents.sort((a, b) => a.time.localeCompare(b.time));
    response.status(200).json(todaysEvents);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Could not fetch calendar" });
  }
}
