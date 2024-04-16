const db = require("../db/connection");

function fetchCommentsByArticleId(articleId) {
  return db
    .query(
      `SELECT * FROM comments 
       WHERE article_id=$1
       ORDER BY created_at DESC`,
      [articleId]
    )
    .then(({ rows }) => {
      return rows;
    });
}

function checkArticleExists(articleId) {
  return db
    .query(`SELECT * FROM articles WHERE article_id=$1`, [articleId])
    .then(({ rows }) => {
      if (!rows.length)
        return Promise.reject({ status: 404, msg: "article does not exist" });
    });
}

module.exports = { fetchCommentsByArticleId, checkArticleExists };
