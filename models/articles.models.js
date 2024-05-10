const db = require("../db/connection");

function fetchArticleById(article_id) {
  return db
    .query(
      `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, articles.body, COUNT(*)::INT AS comment_count 
       FROM articles 
       LEFT JOIN comments 
       ON comments.article_id = articles.article_id
       WHERE articles.article_id=$1
       GROUP BY articles.article_id`,
      [article_id]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return rows[0];
    });
}

function fetchArticles(topic, sort_by = "created_at", order = "desc") {
  const validSortByList = ["created_at", "comment_count", "votes"];
  const validOrderList = ["asc", "desc"];
  const queryVals = [];

  let sqlQueryString = `SELECT articles.author, title, articles.article_id, topic, articles.created_at, articles.votes, article_img_url, COUNT(*)::INT AS comment_count
                        FROM articles 
                        LEFT JOIN comments 
                        ON comments.article_id = articles.article_id `;

  if (topic) {
    queryVals.push(topic);
    sqlQueryString += `WHERE topic = $1 `;
  }

  sqlQueryString += `GROUP BY articles.article_id
                     ORDER BY ${sort_by} ${order};`;

  if (!validSortByList.includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "invalid query value" });
  }
  if (!validOrderList.includes(order)) {
    return Promise.reject({ status: 400, msg: "invalid query value" });
  }

  return db.query(sqlQueryString, queryVals).then(({ rows }) => {
    return rows;
  });
}

function checkTopicExists(topic) {
  if (topic)
    return db
      .query(`SELECT * FROM topics WHERE slug=$1`, [topic])
      .then(({ rows }) => {
        if (!rows.length) {
          return Promise.reject({ status: 404, msg: "topic does not exist" });
        }
      });
}

function updateArticleById(articleId, incVotes) {
  return db
    .query(
      `UPDATE articles SET votes=$1+votes WHERE article_id=$2 RETURNING *`,
      [incVotes, articleId]
    )
    .then(({ rows }) => {
      if (!rows.length) {
        return Promise.reject({ status: 404, msg: "article does not exist" });
      }
      return rows[0];
    });
}

module.exports = {
  fetchArticles,
  fetchArticleById,
  updateArticleById,
  checkTopicExists,
};
