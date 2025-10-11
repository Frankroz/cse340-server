const pool = require("../database/");

/* ****************************************
 * GET Account Data by Account ID
 * *************************************** */
async function getAccountById(account_id) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type FROM account WHERE account_id = $1",
      [account_id]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountById error: " + error);
    return null;
  }
}

/* ****************************************
 * Register new account
 * *************************************** */
async function registerAccount(
  account_firstname,
  account_lastname,
  account_email,
  account_password
) {
  try {
    const sql =
      "INSERT INTO account (account_firstname, account_lastname, account_email, account_password, account_type) VALUES ($1, $2, $3, $4, 'Client') RETURNING *";
    return await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_password,
    ]);
  } catch (error) {
    console.error("registerAccount error:", error.message);
    return error.message;
  }
}

/* ****************************************
 * GET Account Data by Email
 * *************************************** */
async function getAccountByEmail(account_email) {
  try {
    const result = await pool.query(
      "SELECT account_id, account_firstname, account_lastname, account_email, account_type, account_password FROM account WHERE account_email = $1",
      [account_email]
    );
    return result.rows[0];
  } catch (error) {
    console.error("getAccountByEmail error: " + error);
    return null;
  }
}

/* ****************************************
 * Update Account Information
 * *************************************** */
async function updateAccountInfo(
  account_firstname,
  account_lastname,
  account_email,
  account_id
) {
  try {
    const sql =
      "UPDATE account SET account_firstname = $1, account_lastname = $2, account_email = $3 WHERE account_id = $4 RETURNING *";
    const result = await pool.query(sql, [
      account_firstname,
      account_lastname,
      account_email,
      account_id,
    ]);
    return result.rowCount;
  } catch (error) {
    console.error("updateAccountInfo error: " + error);
    return 0;
  }
}

/* ****************************************
 * Update Password
 * *************************************** */
async function updatePassword(hashedPassword, account_id) {
  try {
    const sql =
      "UPDATE account SET account_password = $1 WHERE account_id = $2";
    const result = await pool.query(sql, [hashedPassword, account_id]);
    return result.rowCount;
  } catch (error) {
    console.error("updatePassword error: " + error);
    return 0;
  }
}

module.exports = {
  getAccountById,
  registerAccount,
  getAccountByEmail,
  updateAccountInfo,
  updatePassword,
};
