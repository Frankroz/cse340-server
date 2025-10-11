const jwt = require("jsonwebtoken");
const utilities = require("../utilities/");
const { body, validationResult } = require("express-validator");

/* ****************************************
 * Check account type for admin access
 * *************************************** */
function checkAuthorization(req, res, next) {
  if (!res.locals.loggedin) {
    req.flash(
      "notice",
      "Please log in to access the inventory management area."
    );
    return res.redirect("/account/login");
  }

  const accountType = res.locals.accountData.account_type;

  if (accountType === "Employee" || accountType === "Admin") {
    next();
  } else {
    req.flash(
      "notice",
      "You do not have the required permissions to access the inventory management area."
    );
    return res.redirect("/account/");
  }
}

/* ****************************************
 * Update Account Data Validation Rules
 * *************************************** */
const updateAccountRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required.")
      .isLength({ min: 1 })
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required.")
      .isLength({ min: 2 })
      .withMessage("Last name must be at least 2 characters."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required.")
      .normalizeEmail(),
  ];
};

/* ****************************************
 * Check Update Data
 * *************************************** */
const checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await utilities.getAccountById(account_id);

    req.flash("notice", "Please check your information and try again.");
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData: accountData,
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ****************************************
 * Check Password Data
 * *************************************** */
const checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await utilities.getAccountById(account_id);

    req.flash(
      "notice",
      "Password does not meet requirements. Please try again."
    );
    res.render("account/update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData: accountData,
    });
    return;
  }
  next();
};

module.exports = {
  checkAuthorization,
  updateAccountRules,
  checkUpdateData,
  checkPasswordData,
};
