const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics.controllers");
const endpointsInfo = require("./endpoints.json");
const {
  getArticles,
  getArticleById,
} = require("./controllers/articles.controllers");

app.use(express.json());

app.get("/api", (req, res, next) => {
  return res.status(200).send({ endpoints: endpointsInfo });
});

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

app.use((err, req, res, next) => {
  if (err.status && err.msg) {
    res.status(err.status).send({ msg: err.msg });
  } else if (err.code === "22P02") {
    res.status(400).send({ msg: "bad request" });
  }
});

module.exports = app;
