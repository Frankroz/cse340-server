const { body, validationResult } = require("express-validator");
const utilities = require("../utilities/").Util;
const accountModel = require("../models/accountModel"); // Required for checking existing email

/* ****************************************
 * Registration Data Validation Rules
 * *************************************** */
const registationRules = () => {
  return [
    body("account_firstname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("First name is required."),

    body("account_lastname")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Last name is required."),

    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required.")
      .normalizeEmail()
      .custom(async (account_email) => {
        const emailExists = await utilities.checkExistingEmail(account_email);
        if (emailExists) {
          throw new Error(
            "Email exists. Please log in or use a different email."
          );
        }
      }),

    body("account_password")
      .trim()
      .notEmpty()
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/
      )
      .withMessage(
        "Password must contain at least 1 capital letter, 1 number, and 1 special character."
      ),
  ];
};

/* ****************************************
 * Check Registration Data
 * *************************************** */
const checkRegData = async (req, res, next) => {
  const { account_firstname, account_lastname, account_email } = req.body;
  let errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    req.flash("notice", "Please provide a valid email, password, and name.");
    res.render("register", {
      title: "Register",
      nav,
      errors: errors.array(),
      account_firstname,
      account_lastname,
      account_email,
    });
    return;
  }
  next();
};

/* ****************************************
 * Login Data Validation Rules
 * *************************************** */
const loginRules = () => {
  return [
    body("account_email")
      .trim()
      .isEmail()
      .withMessage("A valid email address is required.")
      .normalizeEmail(),

    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("Password field cannot be empty."),
  ];
};

/* ****************************************
 * Check Login Data
 * *************************************** */
const checkLoginData = async (req, res, next) => {
  const { account_email } = req.body;
  let errors = validationResult(req);
  let nav = await utilities.getNav();

  if (!errors.isEmpty()) {
    req.flash("notice", "Please check your information and try again.");
    res.render("login", {
      title: "Login",
      nav,
      errors: errors.array(),
      account_email,
    });
    return;
  }
  next();
};

/* ****************************************
 * Update Account Data Validation Rules (Provided by user)
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
 * Check Update Data (Provided by user)
 * *************************************** */
const checkUpdateData = async (req, res, next) => {
  const { account_id, account_firstname, account_lastname, account_email } =
    req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    req.flash("notice", "Please check your information and try again.");
    res.render("update", {
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
 * Check Password Data (Provided by user)
 * *************************************** */
const checkPasswordData = async (req, res, next) => {
  const { account_id } = req.body;
  let errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.getNav();
    const accountData = await accountModel.getAccountById(account_id);

    req.flash(
      "notice",
      "Password does not meet requirements. Please try again."
    );
    res.render("update", {
      title: "Update Account Information",
      nav,
      errors: errors.array(),
      accountData: accountData,
    });
    return;
  }
  next();
};

/* ****************************************
 * Password Change Validation Rules
 * *************************************** */
const passwordRules = () => {
  return [
    body("account_password")
      .trim()
      .notEmpty()
      .withMessage("New password is required.")
      .isLength({ min: 12 })
      .withMessage("Password must be at least 12 characters.")
      .matches(
        /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{12,}$/
      )
      .withMessage(
        "Password must contain at least 1 capital letter, 1 number, and 1 special character."
      ),
  ];
};

module.exports = {
  registationRules,
  checkRegData,
  loginRules,
  checkLoginData,
  updateAccountRules,
  checkUpdateData,
  checkPasswordData,
  passwordRules,
};
