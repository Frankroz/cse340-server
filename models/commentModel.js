const pool = require("../database/");

/* **********************************
 * Add a new comment to the database
 * ********************************** */
async function addComment(accountId, invId, text) {
  try {
    const sql = `
      INSERT INTO comment (account_id, inv_id, comment_text)
      VALUES ($1, $2, $3)
      RETURNING *`;
    const result = await pool.query(sql, [accountId, invId, text]);
    return result.rows[0];
  } catch (error) {
    console.error("addComment error: " + error);
    return error.message;
  }
}

/* **********************************
 * Get all comments for a specific vehicle
 * ********************************** */
async function getCommentsByInventoryId(invId) {
  try {
    const sql = `
      SELECT
        c.comment_id,
        c.comment_text,
        c.comment_date,
        c.account_id,
        a.account_firstname,
        a.account_lastname
      FROM
        comment c
      JOIN
        account a ON c.account_id = a.account_id
      WHERE
        c.inv_id = $1
      ORDER BY
        c.comment_date DESC`;
    const result = await pool.query(sql, [invId]);
    return result.rows;
  } catch (error) {
    console.error("getCommentsByInventoryId error: " + error);
    return error.message;
  }
}

/* *****************************
 * Get comments by account ID (User's comments)
 * NOTE: Joins comment data with inventory data to show vehicle info
 * *************************** */
async function getUserCommentsByAccountId(account_id) {
  try {
    const sql = `
      SELECT 
        c.comment_id, 
        c.comment_text, 
        c.comment_date, 
        i.inv_id,
        i.inv_make,
        i.inv_model
      FROM comment AS c
      JOIN inventory AS i ON c.inv_id = i.inv_id
      WHERE c.account_id = $1
      ORDER BY c.comment_date DESC
    `;
    // We get the rows array directly to pass to the view
    const data = await pool.query(sql, [account_id]);
    return data.rows;
  } catch (error) {
    console.error("getUserCommentsByAccountId model error: " + error);
    throw new Error("Failed to retrieve user comments.");
  }
}

/* *****************************
 * Get single comment by comment ID
 * *************************** */
async function getCommentById(comment_id) {
  try {
    const sql = `
      SELECT *
      FROM comment
      WHERE comment_id = $1
    `;
    const data = await pool.query(sql, [comment_id]);
    return data.rows[0];
  } catch (error) {
    console.error("getCommentById model error: " + error);
    throw new Error("Failed to retrieve comment.");
  }
}

/* *****************************
 * Update a comment
 * *************************** */
async function updateComment(comment_id, comment_text) {
  try {
    const sql = `
      UPDATE comment SET comment_text = $1, comment_date = NOW()
      WHERE comment_id = $2
      RETURNING *
    `;
    return await pool.query(sql, [comment_text, comment_id]);
  } catch (error) {
    console.error("updateComment model error: " + error);
    throw new Error("Failed to update comment.");
  }
}

/* **********************************
 * Delete a specific comment
 * ********************************** */
async function deleteComment(commentId) {
  try {
    const sql = "DELETE FROM comment WHERE comment_id = $1";
    const result = await pool.query(sql, [commentId]);
    return result;
  } catch (error) {
    console.error("deleteComment error: " + error);
    return error.message;
  }
}

module.exports = {
  addComment,
  getCommentsByInventoryId,
  getUserCommentsByAccountId,
  getCommentById,
  updateComment,
  deleteComment,
};
