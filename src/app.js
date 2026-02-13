require("dotenv").config()
const express = require("express")
const { pool, initializeDatabase } = require("./db")

const { startConsumer, disconnectConsumer } = require("./kafka/consumer")
const { connectProducer, disconnectProducer, publishEvent } = require("./kafka/producer")

const app = express()
app.use(express.json())

if (process.env.NODE_ENV !== "test") {
  ;(async () => {
    await initializeDatabase()
    await connectProducer()
    await startConsumer()
  })()
}


// -------------------- ROUTES -------------------- //

app.get("/", (req, res) => {
  res.send("Kafka Event Microservice Running")
})

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP" })
})

app.get("/events/processed", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM events ORDER BY created_at DESC"
    )
    res.json(result.rows)
  } catch (err) {
    console.error("Database error:", err)
    res.status(500).json({ error: "Database error" })
  }
})
app.post("/events/generate", async (req, res) => {
  try {
    const { userId, eventType, payload } = req.body

    if (!userId || !eventType) {
      return res.status(400).json({
        error: "userId and eventType required",
      })
    }

    const eventId = await publishEvent(
      userId,
      eventType,
      payload || {}
    )

    res.status(200).json({
      message: "Event published successfully",
      eventId,
    })
  } catch (error) {
    console.error("Error publishing event:", error)
    res.status(500).json({ error: "Internal Server Error" })
  }
})


let server

if (require.main === module) {
  const PORT = process.env.PORT || 3000

  server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
  })
}

// -------------------- GRACEFUL SHUTDOWN -------------------- //

async function shutdown() {
  console.log("Shutting down gracefully...")

  try {
    await disconnectProducer()
    await disconnectConsumer()
    await pool.end()
  } catch (err) {
    console.error("Shutdown error:", err)
  }

  if (server) {
    server.close(() => {
      console.log("Server closed")
      process.exit(0)
    })
  }
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)

module.exports = app
