const { Kafka } = require("kafkajs")
const { v4: uuidv4 } = require("uuid")

const kafka = new Kafka({
  clientId: "user-activity-service",
  brokers: [process.env.KAFKA_BROKER || "localhost:9092"],
})

const producer = kafka.producer()

async function connectProducer() {
  await producer.connect()
  console.log("Producer connected to Kafka")
}

async function publishEvent(userId, eventType, payload = {}) {
  const event = {
    eventId: uuidv4(),
    userId,
    eventType,
    timestamp: new Date().toISOString(),
    payload, 
  }

  await producer.send({
    topic: process.env.KAFKA_TOPIC,
    messages: [{ value: JSON.stringify(event) }],
  })

  console.log("Event published to Kafka:", event.eventId)
  return event.eventId
}

async function disconnectProducer() {
  await producer.disconnect()
  console.log("Kafka Producer disconnected")
}

module.exports = {
  connectProducer,
  publishEvent,
  disconnectProducer,
}
