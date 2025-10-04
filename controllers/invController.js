const invModel = require("../models/inventory-model");
const utilities = require("../utilities/");
const nav = require("../utilities/").Util;

async function buildByInvId(req, res, next) {
  const inv_id = req.params.inv_id;
  const invData = await invModel.getVehicleByInvId(inv_id);

  console.log(invData);

  if (!invData || invData.length === 0) {
    return next({
      status: 404,
      message: "Sorry, that vehicle could not be found.",
    });
  }

  const vehicleDetail = await utilities.buildVehicleDetail(invData);
  const vehicleMake = invData[0].inv_make;
  const vehicleModel = invData[0].inv_model;
  res.render("vehicle-detail", {
    title: vehicleMake + " " + vehicleModel,
    nav: await nav.getNav(),
    vehicleDetail,
  });
}

const getClassName = (classification_id, classifications) => {
  let className = "";

  if (classifications) {
    classifications.forEach((classification) => {
      if (classification.classification_id === parseInt(classification_id)) {
        className = classification.classification_name;
      }
    });
  }

  return className;
};

async function buildByClassificationId(req, res, next) {
  try {
    const classification_id = req.params.classificationId;
    let classifications = await invModel.getClassifications();
    const data = await invModel.getInventoryByClassificationId(
      classification_id
    );

    const grid = await utilities.buildClassificationList(data);
    const className = getClassName(classification_id, classifications.rows);

    if (grid.length) {
      res.render("classification", {
        title: className + " vehicles",
        nav: await nav.getNav(),
        grid,
      });
    } else {
      res.status(404).render("error-handling", {
        title: "Classification Not Found",
        nav: await nav.getNav(),
        message: "Sorry, there was a problem processing your request.",
      });
    }
  } catch (error) {
    console.error("buildByClassificationId error: " + error);
    res.status(500).render("error-handling", {
      title: "Server Error",
      nav: await nav.getNav(),
      message: "Sorry, there was a problem processing your request.",
    });
  }
}

async function buildManagement(req, res, next) {
  res.render("management", {
    title: "Inventory Management",
    nav: await nav.getNav(),
    messages: "",
  });
}

async function buildAddClassification(req, res, next) {
  res.render("add-classification", {
    title: "Add New Classification",
    nav: await nav.getNav(),
    messages: "",
    errors: null,
  });
}

async function registerClassification(req, res, next) {
  const { classification_name } = req.body;

  const regResult = await invModel.addClassification(classification_name);

  if (regResult) {
    res.render("management", {
      title: "Inventory Management",
      messages: {
        success: `Success, The ${classification_name} classification was successfully added.`,
      },
      nav: await nav.getNav(),
    });
  } else {
    res.render("add-classification", {
      title: "Add New Classification",
      nav: await nav.getNav(),
      messages: { error: "Sorry, adding the new classification failed." },
      errors: null,
      classification_name,
    });
  }
}

async function buildAddInventory(req, res, next) {
  let classificationList = await utilities.Util.buildClassificationList();

  res.render("add-inventory", {
    title: "Add New Inventory Item",
    nav: await nav.getNav(),
    classificationList,
    messages: "",
    errors: null,
    inv_make: "",
    inv_model: "",
    inv_year: "",
    inv_description: "",
    inv_image: "",
    inv_thumbnail: "",
    inv_price: "",
    inv_miles: "",
    inv_color: "",
    classification_id: "",
  });
}

async function registerInventory(req, res, next) {
  const {
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
  } = req.body;

  const regResult = await invModel.addInventory(
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
  );

  if (regResult) {
    res.render("management", {
      title: "Inventory Management",
      nav: await nav.getNav(),
      messages: {
        success: `The ${inv_make} ${inv_model} was successfully added to inventory.`,
      },
    });
  } else {
    let classificationList = await utilities.Util.buildClassificationList(
      classification_id
    );

    res.render("add-inventory", {
      title: "Add New Inventory Item",
      nav: await nav.getNav(),
      messages: { error: "Sorry, adding the new inventory item failed." },
      classificationList,
      ...req.body,
    });
  }
}

module.exports = {
  buildByInvId,
  buildByClassificationId,
  buildManagement,
  buildAddClassification,
  registerClassification,
  buildAddInventory,
  registerInventory,
};
