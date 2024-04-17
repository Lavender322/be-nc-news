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

describe("/api/articles", () => {
  test("GET 200: Responds with all articles sorted by default by date in descending order, where there should not be a body property present on any of the article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        expect(articles).toHaveLength(13);
        expect(articles);
        articles.forEach((article) => {
          expect(typeof article.author).toBe("string");
          expect(typeof article.title).toBe("string");
          expect(typeof article.article_id).toBe("number");
          expect(typeof article.topic).toBe("string");
          expect(typeof article.created_at).toBe("string");
          expect(typeof article.votes).toBe("number");
          expect(typeof article.article_img_url).toBe("string");
          expect(typeof article.comment_count).toBe("number");
          expect(article).not.toHaveProperty("body");
        });
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("/api/articles/:article_id", () => {
  test("GET 200: Responds with a single article by its id", () => {
    return request(app)
      .get("/api/articles/1")
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          votes: 100,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
        expect(typeof article.created_at).toBe("string");
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
  test("PATCH 200: Responds with an updated article by its id", () => {
    const newVote = -100;
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: newVote })
      .expect(200)
      .then(({ body }) => {
        const { article } = body;
        expect(article).toMatchObject({
          article_id: 1,
          title: "Living in the shadow of a great man",
          topic: "mitch",
          author: "butter_bridge",
          body: "I find this existence challenging",
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
        });
        expect(typeof article.created_at).toBe("string");
      });
  });
  test("PATCH 404: Responds with an appropriate status and error message when given a non-existent article id", () => {
    const newVote = 1;
    return request(app)
      .patch("/api/articles/999")
      .send({ inc_votes: newVote })
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("article does not exist");
      });
  });
  test("PATCH 400: Responds with an appropriate status and error message when provided with a bad newVotes", () => {
    const newVote = "not-a-number";
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: newVote })
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("/api/articles/:article_id/comments", () => {
  test("GET 200: Responds with all comments for an article retrieved by default with the most recent comments first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(11);
        comments.forEach(
          ({ comment_id, votes, created_at, author, body, article_id }) => {
            expect(article_id).toBe(1);
            expect(typeof comment_id).toBe("number");
            expect(typeof votes).toBe("number");
            expect(typeof created_at).toBe("string");
            expect(typeof author).toBe("string");
            expect(typeof body).toBe("string");
          }
        );
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("GET 200: Responds with an empty array when article has no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body }) => {
        const { comments } = body;
        expect(comments).toHaveLength(0);
      });
  });
  test("GET 404: Responds with an appropriate status and error message when given a non-existent article id", () => {
    return request(app)
      .get("/api/articles/14/comments")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("article does not exist");
      });
  });
  test("GET 400: Responds with an appropriate status and error message when given an invalid article id", () => {
    return request(app)
      .get("/api/articles/not-an-article/comments")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("bad request");
      });
  });
  test("POST 201: Responds with the posted comment for an article", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is eloquently crafted.",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(201)
      .then(({ body }) => {
        const { comment } = body;
        expect(comment).toMatchObject({
          comment_id: 19,
          body: "This is eloquently crafted.",
          article_id: 1,
          author: "butter_bridge",
          votes: 0,
        });
        expect(typeof comment.created_at).toBe("string");
      });
  });
  test("POST 404: Responds with an appropriate status and error message when given a non-existent article id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "This is eloquently crafted.",
    };
    return request(app)
      .post("/api/articles/14/comments")
      .send(newComment)
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("article does not exist");
      });
  });
  test("POST 400: Responds with an appropriate status and error message when provided with a bad body (no body)", () => {
    const newComment = {
      username: "butter_bridge",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("/api/comments/:comment_id", () => {
  test("DELETE 204: Deletes the specified comment and sends no body back", () => {
    return request(app).delete("/api/comments/3").expect(204);
  });
  test("DELETE 404: Responds with an appropriate status and error message when given a non-existent comment id", () => {
    return request(app)
      .delete("/api/comments/19")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("comment does not exist");
      });
  });
  test("DELETE 400: Responds with an appropriate status and error message when given an invalid comment id", () => {
    return request(app)
      .delete("/api/comments/not-a-comment")
      .expect(400)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("bad request");
      });
  });
});

describe("/api/users", () => {
  test("GET 200: Responds with all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body }) => {
        const { users } = body;
        expect(users).toHaveLength(4);
        users.forEach(({ username, name, avatar_url }) => {
          expect(typeof username).toBe("string");
          expect(typeof name).toBe("string");
          expect(typeof avatar_url).toBe("string");
        });
      });
  });
});

describe("NOT EXISTED", () => {
  test("GET 404: Responds with an appropriate status and error message when given a non-existent endpoint", () => {
    return request(app)
      .get("/api/not-a-path")
      .expect(404)
      .then(({ body }) => {
        const { msg } = body;
        expect(msg).toBe("path not found");
      });
  });
});
