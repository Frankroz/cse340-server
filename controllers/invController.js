const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");

async function buildByInvId(req, res, next) {
  const inv_id = req.params.inv_id;
  const invData = await invModel.getVehicleByInvId(inv_id);
  const vehicleDetail = await utilities.buildVehicleDetail(invData);
  const vehicleMake = invData[0].inv_make;
  const vehicleModel = invData[0].inv_model;
  res.render("vehicle-detail", {
    title: vehicleMake + " " + vehicleModel,
    vehicleDetail,
  });
}

async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );
    const grid = await utilities.buildClassificationList(data);
    const className = ["Custom", "Sedan", "Sport", "SUV", "Truck"][
      classification_id - 1
    ];
    res.render("classification", {
      title: className + " vehicles",
      grid,
    });
  } catch (error) {
    console.error("buildByClassificationId error: " + error);
    res.status(500).render("error-handling", {
      title: "Server Error",
      message: "Sorry, there was a problem processing your request.",
    });
  }
}

module.exports = { buildByInvId, buildByClassificationId };
