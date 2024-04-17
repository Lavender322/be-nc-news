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
function insertCommentByArticleId(articleId, username, body) {
  return db
    .query(
      `INSERT INTO comments (body, article_id, author, votes, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [body, articleId, username, 0, new Date()]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

module.exports = {
  fetchCommentsByArticleId,
  checkArticleExists,
  insertCommentByArticleId,
};