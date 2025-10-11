const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
const { checkAuthorization } = require("./authMiddleware");
const utilities = require("../utilities/").Util;

// Route to build inventory by classification view
router.get(
  "/category/:classificationId",
  invController.buildByClassificationId
);

// Route to build a specific vehicle detail view
router.get("/detail/:inv_id", invController.buildByInvId);

/*******************
 * Inventory Management
 ********************/
router.get(
  "/inv",
  utilities.checkJWT,
  checkAuthorization,
  utilities.handleErrors(invController.buildManagement)
);

// Route to build add classification view
router.get(
  "/inv/add-classification",
  utilities.checkJWT,
  checkAuthorization,
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to process the new classification data
router.post(
  "/inv/add-classification",
  utilities.checkJWT,
  checkAuthorization,
  invValidate.classificationRules(),
  invValidate.validateClassification,
  utilities.handleErrors(invController.registerClassification)
);

// Route to build add inventory view
router.get(
  "/inv/add-inventory",
  utilities.checkJWT,
  checkAuthorization,
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to process the new item data
router.post(
  "/inv/add-inventory",
  utilities.checkJWT,
  checkAuthorization,
  invValidate.invRules(),
  invValidate.validateInventory,
  utilities.handleErrors(invController.registerInventory)
);

module.exports = router;
