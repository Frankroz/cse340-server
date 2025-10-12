const utilities = require("../utilities/").Util;
const accountModel = require("../models/accountModel");
const commentModel = require("../models/commentModel");
const bcrypt = require("bcryptjs");

/* ****************************************
 * Deliver login view
 * *************************************** */
async function buildLogin(req, res, next) {
  if (res.locals.loggedin) {
    req.flash(
      "notice",
      "Please log in to access your account management page."
    );
    return res.redirect("/account/");
  }

  let nav = await utilities.getNav();
  res.render("login", {
    title: "Login",
    nav,
    errors: null,
  });
}

/* ****************************************
 * Process login request
 * *************************************** */
async function accountLogin(req, res, next) {
  let nav = await utilities.getNav();
  const { account_email, account_password } = req.body;

  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(400).render("login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password;

      const accessToken = utilities.buildToken(accountData);

      res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

      return res.redirect("/account/");
    }
  } catch (error) {
    req.flash("notice", "Please check your credentials and try again.");
    res.status(500).render("login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    });
    return;
  }

  req.flash("notice", "Please check your credentials and try again.");
  res.status(400).render("login", {
    title: "Login",
    nav,
    errors: null,
    account_email,
  });
}

/* ****************************************
 * Deliver update account view
 * *************************************** */
async function buildUpdateAccount(req, res, next) {
  const accountId = parseInt(req.params.accountId);
  let nav = await utilities.getNav();
  const accountData = await accountModel.getAccountById(accountId);

  res.render("update", {
    title: "Update Account Information",
    nav,
    errors: null,
    accountData: accountData,
  });
}

/* ****************************************
 * Deliver registration view (NEW)
 * *************************************** */
async function buildRegistration(req, res, next) {
  let nav = await utilities.getNav();
  res.render("register", {
    title: "Register",
    nav,
    errors: null,
  });
}

/* ****************************************
 * Process Registration
 * *************************************** */
async function registerAccount(req, res, next) {
  const {
    account_firstname,
    account_lastname,
    account_email,
    account_password,
  } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash(
      "notice",
      "Sorry, there was an error processing the registration."
    );
    return res.redirect("/account/register");
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  );

  if (regResult) {
    req.flash(
      "success",
      `Congratulations, ${account_firstname}, you are registered! Please log in.`
    );
    res.status(201).redirect("/account/login");
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(500).redirect("/account/register");
  }
}

/* ****************************************
 * Deliver account management view
 * *************************************** */
async function buildAccountManagement(req, res, next) {
  if (!res.locals.loggedin) {
    req.flash(
      "notice",
      "Please log in to access your account management page."
    );
    return res.redirect("/account/login");
  }

  res.locals.userComments = await commentModel.getUserCommentsByAccountId(
    res.locals.accountData.account_id
  );

  let nav = await utilities.getNav();

  res.render("accountManagement", {
    title: "Account Management",
    nav,
    errors: null,
    message: "",
    userComments: res.locals.userComments,
  });
}

/* ****************************************
 * Process Account Update
 * *************************************** */
async function updateAccount(req, res, next) {
  let nav = await utilities.getNav();
  const { account_firstname, account_lastname, account_email, account_id } =
    req.body;

  const currentAccount = await accountModel.getAccountById(account_id);
  if (account_email !== currentAccount.account_email) {
    const emailExists = await utilities.checkExistingEmail(account_email);
    if (emailExists) {
      req.flash(
        "notice",
        "Error: The new email address already exists in our system."
      );
      const freshAccountData = await accountModel.getAccountById(account_id);
      res.render("update", {
        title: "Update Account Information",
        nav,
        errors: null,
        accountData: freshAccountData,
        account_firstname,
        account_lastname,
        account_email,
      });
      return;
    }
  }

  const updateResult = await accountModel.updateAccountInfo(
    account_firstname,
    account_lastname,
    account_email,
    account_id
  );

  if (updateResult) {
    req.flash(
      "notice",
      `Success! ${account_firstname}'s account information was successfully updated.`
    );

    const updatedAccount = await accountModel.getAccountById(account_id);

    const accessToken = utilities.buildToken(updatedAccount);
    res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 });

    res.locals.accountData = updatedAccount;
    res.locals.loggedin = 1;

    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the update failed. Please try again.");
    const freshAccountData = await accountModel.getAccountById(account_id);
    res.render("update", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData: freshAccountData,
      account_firstname,
      account_lastname,
      account_email,
    });
  }
}

/* ****************************************
 * Process Password Change
 * *************************************** */
async function updatePassword(req, res, next) {
  let nav = await utilities.getNav();
  const { account_password, account_id } = req.body;

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(account_password, 10);
  } catch (error) {
    req.flash("notice", "An error occurred during password hashing.");
    res.redirect("/account/");
    return;
  }

  const updateResult = await accountModel.updatePassword(
    hashedPassword,
    account_id
  );

  if (updateResult) {
    req.flash("notice", "Success! Your password was successfully changed.");
    res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, the password change failed. Please try again.");
    const freshAccountData = await accountModel.getAccountById(account_id);
    res.render("update", {
      title: "Update Account Information",
      nav,
      errors: null,
      accountData: freshAccountData,
    });
  }
}

/* ****************************************
 * Process Logout Request
 * *************************************** */
function accountLogout(req, res, next) {
  res.clearCookie("jwt");

  res.locals.loggedin = 0;
  res.locals.accountData = null;

  req.flash("notice", "You have successfully logged out.");

  res.redirect("/");
}

module.exports = {
  buildLogin,
  accountLogin,
  buildRegistration,
  registerAccount,
  buildAccountManagement,
  buildUpdateAccount,
  updateAccount,
  updatePassword,
  accountLogout,
};
