const express = require("express");
const router = express.Router();
const { getAllEvents } = require("../store/eventStore");

router.get("/processed", (req, res) => {
  const events = getAllEvents();
  res.status(200).json(events);
});

module.exports = router;
