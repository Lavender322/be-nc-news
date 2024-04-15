const { fetchTopics } = require("../models/topics.models");
const endpointsInfo = require("../endpoints.json");

function getAPI(req, res, next) {
  return res.status(200).send({ endpoints: endpointsInfo });
}

function getTopics(req, res, next) {
  return fetchTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getAPI, getTopics };
