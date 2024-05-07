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
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
    });
}

function insertCommentByArticleId(articleId, username, body) {
  return db
    .query(
      `INSERT INTO comments (body, article_id, author) VALUES ($1, $2, $3) RETURNING *`,
      [body, articleId, username]
    )
    .then(({ rows }) => {
      return rows[0];
    });
}

function removeCommentById(commentId) {
  return db
    .query(`DELETE FROM comments WHERE comment_id=$1 RETURNING *`, [commentId])
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "comment does not exist" });
      }
      return rows[0];
    });
}

module.exports = {
  fetchCommentsByArticleId,
  checkArticleExists,
  insertCommentByArticleId,
  removeCommentById,
};
