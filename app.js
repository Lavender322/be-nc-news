const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const {
  getCommentsByArticleId,
  postCommentByArticleId,
  deleteCommentById,
} = require("./controllers/comments.controllers");
const endpoints = require("./endpoints.json");
const {
  getArticles,
  getArticleById,
  patchArticleById,
} = require("./controllers/articles.controllers");

app.use(express.json());

app.get("/api", (req, res, next) => {
  return res.status(200).send({ endpoints });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.patch("/api/articles/:article_id", patchArticleById);

app.get("/api/articles/:article_id/comments", getCommentsByArticleId);

app.post("/api/articles/:article_id/comments", postCommentByArticleId);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02" || err.code === "23502") {
    res.status(400).send({ msg: "bad request" });
  } else if (
    err.code === "23503" &&
    err.constraint === "comments_article_id_fkey"
  ) {
    res.status(404).send({ msg: "article does not exist" });
  }
});

module.exports = app;
