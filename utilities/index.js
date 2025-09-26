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
  let grid;
  if (data.length > 0) {
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
  } else {
    grid += '<p class="notice">Sorry, no vehicles could be found.</p>';
  }
  return grid;
}

module.exports = { buildVehicleDetail, buildByInvId, buildClassificationList };
