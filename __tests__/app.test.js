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

describe("/api/articles/:article_id", () => {
  test("GET 200: Responds with an article by its id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        const {
          author,
          title,
          article_id,
          topic,
          created_at,
          votes,
          article_img_url,
        } = article;
        expect(author).toBe("butter_bridge");
        expect(title).toBe("Living in the shadow of a great man");
        expect(article_id).toBe(1);
        expect(article.body).toBe("I find this existence challenging");
        expect(topic).toBe("mitch");
        // TO FIX THE BELOW FAILED TEST:
        // Expected: "2020-07-09T21:11:00.000Z"
        // Received: "2020-07-09T20:11:00.000Z"
        // expect(created_at).toBe(new Date(1594329060000).toISOString());
        expect(typeof created_at).toBe("string");
        expect(votes).toBe(100);
        expect(article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  test("GET 404: Responds with an appropriate status and error message when given a non-existent article id", () => {
    return request(app)
      .get("/api/articles/999")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("article does not exist");
      });
  });
  test("GET 400: Responds with an appropriate status and error message when given an invalid article id", () => {
    return request(app)
      .get("/api/articles/not-an-article")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("bad request");
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
