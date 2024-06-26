const {
  fetchArticles,
  fetchArticleById,
  updateArticleById,
  checkTopicExists,
} = require("../models/articles.models");

function getArticleById(req, res, next) {
  const { article_id } = req.params;
  return fetchArticleById(article_id)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

function getArticles(req, res, next) {
  const { topic, sort_by, order } = req.query;
  Promise.all([fetchArticles(topic, sort_by, order), checkTopicExists(topic)])
    .then(([articles]) => {
      res.status(200).send({ articles });
    })
    .catch((err) => {
      next(err);
    });
}

function patchArticleById(req, res, next) {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  return updateArticleById(article_id, inc_votes)
    .then((article) => {
      res.status(200).send({ article });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = {
  getArticles,
  getArticleById,
  patchArticleById,
};
