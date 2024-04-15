const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const seed = require("../db/seeds/seed");
const data = require("../db/data/test-data");
const endpointsInfo = require("../endpoints.json");

afterAll(() => {
  db.end();
});

beforeEach(() => {
  return seed(data);
});

describe("/api", () => {
  test("GET 200: Responds with a description of all other endpoints available", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body }) => {
        const { endpoints } = body;
        expect(endpoints).toEqual(endpointsInfo);
      });
  });
});

describe("/api/topics", () => {
  test("GET 200: Responds with all topics with their respective slugs and descriptions", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body }) => {
        const { topics } = body;
        expect(topics).toHaveLength(3);
        topics.forEach(({ description, slug }) => {
          expect(typeof description).toBe("string");
          expect(typeof slug).toBe("string");
        });
      });
  });
});

describe("NOT EXISTED", () => {
  test("GET 404: Responds with an appropriate status and error message when given a non-existing endpoint", () => {
    return request(app)
      .get("/api/not-a-path")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("path not found");
      });
  });
});
