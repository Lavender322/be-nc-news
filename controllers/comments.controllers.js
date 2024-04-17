const {
  fetchCommentsByArticleId,
  checkArticleExists,
  insertCommentByArticleId,
} = require("../models/comments.models");

function getCommentsByArticleId(req, res, next) {
  const { article_id } = req.params;
  Promise.all([
    fetchCommentsByArticleId(article_id),
    checkArticleExists(article_id),
  ])
    .then(([comments]) => {
      res.status(200).send({ comments });
    })
    .catch((err) => {
      next(err);
    });
}

function postCommentByArticleId(req, res, next) {
  const { article_id } = req.params;
  const { username, body } = req.body;
  return insertCommentByArticleId(article_id, username, body)
    .then((comment) => {
      res.status(201).send({ comment });
    })
    .catch((err) => {
      next(err);
    });
}

module.exports = { getCommentsByArticleId, postCommentByArticleId };
