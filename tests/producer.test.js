jest.mock("kafkajs", () => {
  return {
    Kafka: jest.fn(() => ({
      producer: jest.fn(() => ({
        connect: jest.fn(),
        send: jest.fn()
      }))
    }))
  }
})

const { publishEvent } = require("../src/kafka/producer")

describe("Producer Unit Test", () => {

  test("Should return a valid eventId", async () => {
    const eventId = await publishEvent("user123", "LOGIN")
    expect(eventId).toBeDefined()
    expect(typeof eventId).toBe("string")
  })

})
