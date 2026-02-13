const request = require("supertest")

jest.mock("../src/kafka/producer", () => ({
  publishEvent: jest.fn().mockResolvedValue("mock-event-id"),
}))

const app = require("../src/app")

describe("API Routes", () => {
  test("POST /events/generate should return success", async () => {
    const response = await request(app)
      .post("/events/generate")
      .send({
        userId: "user123",
        eventType: "LOGIN",
      })

    expect(response.statusCode).toBe(200)
    expect(response.body.message).toBeDefined()
    expect(response.body.eventId).toBe("mock-event-id")
  })
})
