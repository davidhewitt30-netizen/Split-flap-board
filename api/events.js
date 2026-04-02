const ical = require("node-ical");

export default async function handler(request, response) {
  try {
    // 1. ADD YOUR THREE CALENDAR LINKS HERE
    const calendars = [
      { color: "white",  url: "webcal://p161-caldav.icloud.com/published/2/ODUwNDM3NjI4NTA0Mzc2MlSLob-1XVFuM3MQvP12xNm6YB2s3sorAzrBNeoL3GdeUkdeCHrC1bPxBU2h9IQGXuwTDNCdw7psWkIvvaf_3G4".replace("webcal://", "https://") },
      { color: "blue",   url: "webcal://p161-caldav.icloud.com/published/2/ODUwNDM3NjI4NTA0Mzc2MlSLob-1XVFuM3MQvP12xNkU0mZ-7LA2htrZycIuE2ulO_RUijro6yXdmUTnM6NF8pitJic7JJlHpHR2Z8yfFLA".replace("webcal://", "https://") },
      { color: "purple", url: "webcal://p38-caldav.icloud.com/published/2/ODUwNDM3NjI4NTA0Mzc2MlSLob-1XVFuM3MQvP12xNkJK62hSz2sIZVbH8H9-9hroffnilNmuJhu1CQRBadU7l9xbQ_jHG5GnzZ2CdkiOJk".replace("webcal://", "https://") }
    ];
    
    const now = new Date();
    const todayDay = now.getDate();
    const todayMonth = now.getMonth();
    const todayYear = now.getFullYear();
    
    let todaysEvents = [];

    // 2. Fetch all calendars at the same time
    await Promise.all(calendars.map(async (cal) => {
      // Safety check in case you leave a URL blank
      if (!cal.url.startsWith("https")) return; 

      try {
        const events = await ical.async.fromURL(cal.url);
        
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
                title: (event.summary || "BUSY").toUpperCase(),
                location: (event.location || "").toUpperCase(),
                color: cal.color // Tag the event with the calendar's color
              });
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching ${cal.color} calendar:`, err);
      }
    }));

    // 3. Sort chronologically across all calendars
    todaysEvents.sort((a, b) => a.time.localeCompare(b.time));
    response.status(200).json(todaysEvents);

  } catch (error) {
    console.error(error);
    response.status(500).json({ error: "Could not fetch calendars" });
  }
}
