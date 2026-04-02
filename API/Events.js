const ical = require("node-ical");

export default async function handler(request, response) {
  try {
    // PASTE YOUR WEBCAL LINK HERE. Keep the quotes!
    const calendarUrl = "webcal://p161-caldav.icloud.com/published/2/ODUwNDM3NjI4NTA0Mzc2MlSLob-1XVFuM3MQvP12xNm6YB2s3sorAzrBNeoL3GdeUkdeCHrC1bPxBU2h9IQGXuwTDNCdw7psWkIvvaf_3G4".replace("webcal://", "https://");
    
    const events = await ical.async.fromURL(calendarUrl);
    const today = new Date();
    today.setHours(0,0,0,0);
    
    let todaysEvents = [];

    for (const event of Object.values(events)) {
      if (event.type === 'VEVENT') {
        const eventDate = new Date(event.start);
        eventDate.setHours(0,0,0,0);
        
        if (eventDate.getTime() === today.getTime()) {
          todaysEvents.push({
            time: new Date(event.start).toLocaleTimeString('en-GB', {hour: '2-digit', minute:'2-digit'}),
            title: (event.summary || "BUSY").toUpperCase().substring(0, 15),
            location: (event.location || "TBC").toUpperCase().substring(0, 10)
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
