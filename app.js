const express = require("express");
const app = express();
const { getAPI, getTopics } = require("./controllers/topics.controllers");

app.use(express.json());

app.get("/api", getAPI);

app.get("/api/topics", getTopics);

app.all("*", (req, res) => {
  res.status(404).send({ msg: "path not found" });
});

module.exports = app;
