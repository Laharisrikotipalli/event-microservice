const express = require("express");
const router = express.Router();

const { buildUserEvent } = require("../events/userEvent");
const { publishEvent } = require("../kafka/producer");

const TOPIC = "user-activity-events";

router.post("/events/generate", async (req, res) => {
  try {
    const { userId, eventType, payload } = req.body;

    if (!userId || !eventType) {
      return res.status(400).json({
        error: "userId and eventType are required"
      });
    }

    const event = buildUserEvent({ userId, eventType, payload });

    await publishEvent(TOPIC, event);

    return res.status(201).json({
      message: "Event published successfully",
      eventId: event.eventId
    });

  } catch (error) {
    console.error("Error publishing event:", error.message);
    return res.status(500).json({
      error: "Internal Server Error"
    });
  }
});

module.exports = router;
