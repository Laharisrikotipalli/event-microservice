const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "user-activity-service",
  brokers: ["kafka:9092"]  
});

module.exports = kafka;
