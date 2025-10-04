const express = require("express");
const router = express.Router();
const invController = require("../controllers/invController");
const invValidate = require("../utilities/inventory-validation");
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
// Route to build inventory management view
router.get("/inv", utilities.handleErrors(invController.buildManagement));

// Route to build add classification view
router.get(
  "/inv/add-classification",
  utilities.handleErrors(invController.buildAddClassification)
);

// Route to process the new classification data
router.post(
  "/inv/add-classification",
  invValidate.classificationRules(),
  invValidate.validateClassification,
  utilities.handleErrors(invController.registerClassification)
);

// Route to build add inventory view
router.get(
  "/inv/add-inventory",
  utilities.handleErrors(invController.buildAddInventory)
);

// Route to process the new item data
router.post(
  "/inv/add-inventory",
  invValidate.invRules(),
  invValidate.validateInventory,
  utilities.handleErrors(invController.registerInventory)
);

module.exports = router;
