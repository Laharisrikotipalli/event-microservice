const processedEvents = new Map(); 
// Map ensures uniqueness by eventId

const addEvent = (event) => {
  if (!processedEvents.has(event.eventId)) {
    processedEvents.set(event.eventId, event);
    return true;
  }
  return false;
};

const getAllEvents = () => {
  return Array.from(processedEvents.values());
};

module.exports = {
  addEvent,
  getAllEvents
};
