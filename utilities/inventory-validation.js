const { body, validationResult } = require("express-validator");
const invModel = require("../models/inventory-model");
const utilities = require("../utilities");
const nav = require("../utilities/").Util;

const classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z]+$/)
      .withMessage("Name must be alphabetical characters only.")
      .custom(async (classification_name) => {
        const classificationExists = await invModel.checkExistingClassification(
          classification_name
        );
        if (classificationExists) {
          throw new Error("Classification name already exists.");
        }
      }),
  ];
};

const validateClassification = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  res.render("add-classification", {
    errors: errors.array(),
    title: "Add New Classification",
    nav: await nav.getNav(),
    classification_name: req.body.classification_name,
    messages: "",
  });
};

const invRules = () => {
  return [
    body("classification_id")
      .trim()
      .isInt({ min: 1 })
      .withMessage("Please select a classification."),

    body("inv_make")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Please provide a make."),

    body("inv_model")
      .trim()
      .isLength({ min: 3 })
      .withMessage("Please provide a model."),

    body("inv_year")
      .trim()
      .isInt({ min: 1000, max: 9999 })
      .withMessage("Please provide a valid 4-digit year."),

    body("inv_description")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a description."),

    body("inv_image")
      .trim()
      .isLength({ min: 1 })
      .matches(/^\/images\/vehicles\/.*$/)
      .withMessage("Please provide a valid image path."),

    body("inv_thumbnail")
      .trim()
      .isLength({ min: 1 })
      .matches(/^\/images\/vehicles\/.*$/)
      .withMessage("Please provide a valid thumbnail path."),

    body("inv_price")
      .trim()
      .isFloat({ min: 0 })
      .withMessage("Please provide a valid positive price."),

    body("inv_miles")
      .trim()
      .isInt({ min: 0 })
      .withMessage("Please provide a valid positive mileage."),

    body("inv_color")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Please provide a color."),
  ];
};

const validateInventory = async (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const classificationList = await utilities.buildClassificationList(
    req.body.classification_id
  );

  const locals = req.body;

  res.render("add-inventory", {
    errors: errors.array(),
    title: "Add New Inventory Item",
    nav: await nav.getNav(),
    messages: req.flash(),
    classificationList,
    ...locals,
  });
};

module.exports = {
  classificationRules,
  validateClassification,
  invRules,
  validateInventory,
};
