const { Kafka } = require("kafkajs")
const { pool } = require("../db")

const kafka = new Kafka({
  clientId: "user-activity-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
})

let consumer
let dlqProducer

async function startConsumer() {
  // Do not start Kafka in test mode
  if (process.env.NODE_ENV === "test") return

  consumer = kafka.consumer({
    groupId: process.env.KAFKA_CONSUMER_GROUP || "test-group",
  })

  dlqProducer = kafka.producer()

  await consumer.connect()
  await dlqProducer.connect()

  await consumer.subscribe({
    topic: process.env.KAFKA_TOPIC,
    fromBeginning: true,
  })

  await consumer.run({
    eachMessage: async ({ message }) => {
      try {
        const event = JSON.parse(message.value.toString())

        console.log("Processing Event:", event)

        await pool.query(
          `INSERT INTO events (id, user_id, event_type, payload)
           VALUES ($1, $2, $3, $4)
           ON CONFLICT (id) DO NOTHING`,
          [
            event.eventId,
            event.userId,
            event.eventType,
            event.payload || {},
          ]
        )

        console.log("Inserted into DB:", event.eventId)

      } catch (error) {
        console.error("Consumer Error:", error.message)

        if (dlqProducer) {
          await dlqProducer.send({
            topic: process.env.KAFKA_DLQ_TOPIC,
            messages: [{ value: message.value.toString() }],
          })
        }

        console.log("Sent event to DLQ")
      }
    },
  })
}

async function disconnectConsumer() {
  if (consumer) await consumer.disconnect()
  if (dlqProducer) await dlqProducer.disconnect()
}

module.exports = {
  startConsumer,
  disconnectConsumer,
}
