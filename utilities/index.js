const invModel = require("../models/inventory-model");

/* ***************************
 * Build vehicle detail HTML
 * ************************** */
async function buildVehicleDetail(data) {
  const vehicle = data[0];

  let detail = '<div class="vehicle-detail-container">';

  detail += '<div class="main-vehicle-image">';
  detail += `<img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model}">`;
  detail += "</div>";
  detail += '<div class="vehicle-info-panel">';
  detail += `<h2>${vehicle.inv_make} ${vehicle.inv_model} Details</h2>`;

  detail += '<div class="detail-list-section">';

  detail +=
    '<p class="detail-price"><strong>Price:</strong> ' +
    `$${new Intl.NumberFormat("en-US").format(vehicle.inv_price)}</p>`;

  detail +=
    '<p class="detail-description"><strong>Description:</strong> ' +
    `${vehicle.inv_description}</p>`;

  detail +=
    '<p class="detail-color"><strong>Color:</strong> ' +
    `${vehicle.inv_color}</p>`;

  detail += "</div>";

  detail += `<p class="detail-miles"><strong>Miles:</strong> ${new Intl.NumberFormat(
    "en-US"
  ).format(vehicle.inv_miles)}</p>`;

  detail += "</div>";
  detail += "</div>";
  return detail;
}

/* ***************************
 * Build vehicle detail view
 * ************************** */
async function buildByInvId(req, res, next) {
  const inv_id = req.params.inv_id;
  const invData = await invModel.getVehicleByInvId(inv_id);

  if (!invData || invData.length === 0) {
    res.status(404).render("errors/error", {
      title: "Vehicle Not Found",
      message: "The requested vehicle could not be found.",
    });
    return;
  }

  const vehicleDetail = await utilities.buildVehicleDetail(invData);
  const vehicleMake = invData[0].inv_make;
  const vehicleModel = invData[0].inv_model;

  res.render("./inventory/vehicle-detail", {
    title: vehicleMake + " " + vehicleModel,
    nav,
    vehicleDetail,
  });
}

/* ***************************
 * Build grid view
 * ************************** */
async function buildClassificationList(data) {
  let grid = "";

  if (!data) {
    grid = '<ul id="inv-display">';
    data.forEach((vehicle) => {
      grid += `
      <li class="vehicle-card">
        <div class="image-container">
          <a href="/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${
        vehicle.inv_model
      } details">
            <img src="${vehicle.inv_thumbnail}" alt="Image of ${
        vehicle.inv_make
      } ${vehicle.inv_model}">
          </a>
        </div>
        <div class="name-price-box">
          <h2>
            <a href="/detail/${vehicle.inv_id}" title="View ${
        vehicle.inv_make
      } ${vehicle.inv_model} details">${vehicle.inv_make} ${
        vehicle.inv_model
      }</a>
          </h2>
          <span>$${new Intl.NumberFormat("en-US").format(
            vehicle.inv_price
          )}</span>
        </div>
      </li>`;
    });
    grid += "</ul>";
  }
  
  return grid;
}

/*********************************
 * Add new info into the database
 ********************************/
const Util = {};

/* ****************************************
 * Higher-Order Function to Handle Errors
 * ****************************************/
Util.handleErrors = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/* ****************************************
 * Build the classification navigation list HTML
 * This list is used by the views/partials/navigation.ejs partial.
 * ****************************************/
Util.getNav = async function () {
  try {
    let data = await invModel.getClassifications();

    let list = "<ul>";

    list += '<li><a href="/" title="Home link">Home</a></li>';

    data.rows.forEach((row) => {
      list += "<li>";
      list +=
        '<a href="/category/' +
        row.classification_id +
        '" title="' +
        row.classification_name +
        '">';
      list += row.classification_name;
      list += "</a></li>";
    });

    list += "</ul>";

    return list;
  } catch (error) {
    console.error("Error in getNav:", error);
    return '<ul><li><a href="/">Home</a></li></ul>';
  }
};

/* ****************************************
 * Build the classification select list
 * ****************************************/
Util.buildClassificationList = async function (classification_id = null) {
  let data = await invModel.getClassifications();
  let classificationList =
    '<select name="classification_id" id="classificationList" required>';
  classificationList += "<option value=''>Choose a Classification</option>";
  data.rows.forEach((row) => {
    classificationList += '<option value="' + row.classification_id + '"';
    if (
      classification_id != null &&
      row.classification_id == classification_id
    ) {
      classificationList += " selected ";
    }
    classificationList += ">" + row.classification_name + "</option>";
  });
  classificationList += "</select>";
  return classificationList;
};

module.exports = {
  buildVehicleDetail,
  buildByInvId,
  buildClassificationList,
  Util,
};
