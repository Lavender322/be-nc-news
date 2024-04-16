const {
  fetchCommentsByArticleId,
  checkArticleExists,
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

module.exports = { getCommentsByArticleId };
