const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");
const util = require("../utilities/").Util;
const regValidate = require("./validationMiddleware");

router.get(
  "/login",
  util.checkJWT,
  util.handleErrors(accountController.buildLogin)
);

// Route to process the login attempt
router.post(
  "/login",
  regValidate.loginRules(),
  regValidate.checkLoginData,
  util.handleErrors(accountController.accountLogin)
);

// Route to build the account management view
router.get(
  "/",
  util.checkJWT,
  util.handleErrors(accountController.buildAccountManagement)
);

/* ****************************************
 * Registration Routes
 * *************************************** */
router.get("/register", util.handleErrors(accountController.buildRegistration));

router.post(
  "/register",
  regValidate.registationRules(),
  regValidate.checkRegData,
  util.handleErrors(accountController.registerAccount)
);

/* ****************************************
 * Update Account Routes
 * *************************************** */
router.get(
  "/update/:accountId",
  util.checkJWT,
  util.handleErrors(accountController.buildUpdateAccount)
);

// Routes to process the Change Password form
router.post(
  "/update",
  util.checkJWT,
  regValidate.updateAccountRules(),
  regValidate.checkUpdateData,
  util.handleErrors(accountController.updateAccount)
);

router.post(
  "/change-password",
  util.checkJWT,
  regValidate.passwordRules(),
  regValidate.checkPasswordData,
  util.handleErrors(accountController.updatePassword)
);

/* ****************************************
 * Logout Route
 * *************************************** */

router.get("/logout", util.handleErrors(accountController.accountLogout));

module.exports = router;
