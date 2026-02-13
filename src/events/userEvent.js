const { v4: uuidv4 } = require("uuid");

function buildUserEvent(data) {
  return {
    eventId: uuidv4(),
    userId: data.userId,
    eventType: data.eventType,
    timestamp: new Date().toISOString(),
    payload: data.payload || {}
  };
}

module.exports = { buildUserEvent };
