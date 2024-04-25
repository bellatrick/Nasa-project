const request = require("supertest");
const app = require("../../app");
describe("Test GET /launches", () => {
  test("It should respond with 200 success", async () => {
    await request(app).get("/launches").expect(200);
  });
});

describe("Test POST /launch", () => {
  test("It should respond with 201 created", async () => {
    await request(app)
      .post("/launches")
      .send({
        mission: "USS Enterprise",
        rocket: "NCC",
        target: "kepler",
        launchDate: "January 22, 2044",
      })
      .expect(201)
      .expect("Content-Type", /json/);
  });
});
