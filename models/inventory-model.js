const pool = require("../database/");

async function getVehicleByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM inventory
      WHERE inv_id = $1`,
      [inv_id]
    );
    return data.rows;
  } catch (error) {
    console.error("getVehicleByInvId error: " + error);
  }
}

async function getInventoryByClassificationId(classification_id, sort_method) {
  try {
    const sortMethods = Array.isArray(sort_method)
      ? sort_method
      : sort_method
      ? [sort_method]
      : [];

    let orderByClauses = [];

    sortMethods.forEach((method) => {
      switch (method) {
        case "price_asc":
          orderByClauses.push("inv_price ASC");
          break;
        case "price_desc":
          orderByClauses.push("inv_price DESC");
          break;
        case "name_asc":
          orderByClauses.push("inv_make ASC, inv_model ASC");
          break;
        case "name_desc":
          orderByClauses.push("inv_make DESC, inv_model DESC");
          break;
      }
    });

    let orderByString = "";
    if (orderByClauses.length > 0) {
      orderByString = `ORDER BY ${orderByClauses.join(", ")}`;
    } else {
      orderByString = "ORDER BY inv_make ASC, inv_model ASC";
    }

    const sql = `SELECT * FROM inventory WHERE classification_id = $1 ${orderByString}`;

    const data = await pool.query(sql, [classification_id]);

    return data.rows;
  } catch (error) {
    console.error("getInventoryByClassificationId error: " + error);
  }
}

async function getClassifications() {
  try {
    return await pool.query(
      "SELECT * FROM classification ORDER BY classification_name"
    );
  } catch (error) {
    console.error("getClassifications error: " + error);
    throw new Error("Failed to get classifications.");
  }
}

async function checkExistingClassification(classification_name) {
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1";
    const classification = await pool.query(sql, [classification_name]);
    return classification.rowCount;
  } catch (error) {
    return error.message;
  }
}

async function addClassification(classification_name) {
  try {
    const sql =
      "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *";
    return await pool.query(sql, [classification_name]);
  } catch (error) {
    return error.message;
  }
}

/* *****************************
 * Insert new inventory item
 * *************************** */
async function addInventory(
  inv_make,
  inv_model,
  inv_year,
  inv_description,
  inv_image,
  inv_thumbnail,
  inv_price,
  inv_miles,
  inv_color,
  classification_id
) {
  try {
    const sql = `
      INSERT INTO inventory 
        (inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
      RETURNING *
    `;
    return await pool.query(sql, [
      inv_make,
      inv_model,
      inv_year,
      inv_description,
      inv_image,
      inv_thumbnail,
      inv_price,
      inv_miles,
      inv_color,
      classification_id,
    ]);
  } catch (error) {
    return error.message;
  }
}

module.exports = {
  getVehicleByInvId,
  getInventoryByClassificationId,
  checkExistingClassification,
  addClassification,
  addInventory,
  getClassifications,
};
