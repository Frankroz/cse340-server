const invModel = require("../models/inventory-model");
const commentModel = require("../models/commentModel");
const utilities = require("../utilities/");
const { validationResult } = require("express-validator");

/* ****************************************
 * Build vehicle detail view with comments
 * *************************************** */
async function getVehicleDetailsWithComments(req, res, next) {
  const inv_id = req.params.inv_id;

  const invData = await invModel.getVehicleByInvId(inv_id);

  if (!invData || invData.length === 0) {
    return next({
      status: 404,
      message: "Sorry, that vehicle could not be found.",
    });
  }

  const comments = await commentModel.getCommentsByInventoryId(inv_id);

  const vehicleDetail = await utilities.buildVehicleDetail(invData);
  const vehicleMake = invData[0].inv_make;
  const vehicleModel = invData[0].inv_model;

  let nav = await utilities.Util.getNav();

  res.render("vehicle-detail", {
    title: vehicleMake + " " + vehicleModel,
    nav,
    vehicleDetail,
    invData: invData[0],
    comments: comments,
    errors: null,
  });
}

/* ****************************************
 * Process new comment submission
 * Route: POST /inv/comment/add
 * *************************************** */
async function addComment(req, res, next) {
  const inv_id = parseInt(req.body.inv_id);
  const comment_text = req.body.comment_text;

  const account_id = res.locals.accountData.account_id;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    let nav = await utilities.Util.getNav();
    const invData = await invModel.getVehicleByInvId(inv_id);
    const comments = await commentModel.getCommentsByInventoryId(inv_id);

    const vehicleDetail = await utilities.buildVehicleDetail(invData);
    const vehicleMake = invData[0].inv_make;
    const vehicleModel = invData[0].inv_model;

    req.flash("notice", "Please provide a valid comment.");
    res.locals.comment_text = comment_text;

    return res.render("vehicle-detail", {
      title: vehicleMake + " " + vehicleModel,
      nav,
      vehicleDetail,
      invData: invData[0],
      comments: comments,
      errors: errors.array(),
    });
  }

  try {
    const result = await commentModel.addComment(
      account_id,
      inv_id,
      comment_text
    );

    if (result) {
      req.flash("success", "Your comment was successfully posted.");
      res.redirect("/detail/" + inv_id);
    } else {
      req.flash("error", "Comment submission failed. Please try again.");
      res.redirect("/detail/" + inv_id);
    }
  } catch (error) {
    console.error("Error adding comment: ", error.message);
    req.flash("error", "Sorry, an internal error occurred during submission.");
    res.redirect("/detail/" + inv_id);
  }
}

/* ****************************************
 * Deliver view to edit a comment
 * *************************************** */
async function buildEditCommentView(req, res, next) {
  if (res.locals.accountData === undefined) {
    req.flash("error", "You must be logged in to delete a comment.");
    return res.redirect("/account/login");
  }

  const comment_id = parseInt(req.params.commentId);
  const commentData = await commentModel.getCommentById(comment_id);
  const nav = await utilities.Util.getNav();

  if (
    !commentData ||
    commentData.account_id !== res.locals.accountData.account_id
  ) {
    req.flash("notice", "You are not authorized to edit this comment.");
    return res.redirect("/account");
  }

  res.render("edit-comment", {
    title: "Edit Comment",
    nav,
    commentData,
    errors: null,
    messages: req.flash(),
  });
}

/* ****************************************
 * Process comment update
 * *************************************** */
async function updateComment(req, res, next) {
  if (res.locals.accountData === undefined) {
    req.flash("error", "You must be logged in to edit a comment.");
    return res.redirect("/account/login");
  }
  const { comment_id, comment_text } = req.body;
  const account_id = res.locals.accountData.account_id;

  if (!comment_text || comment_text.trim().length < 5) {
    req.flash("error", "Comment must be at least 5 characters long.");

    const nav = await utilities.Util.getNav();
    const commentData = await commentModel.getCommentById(comment_id);

    return res.render("/edit-comment", {
      title: "Edit Comment",
      nav,
      commentData: { ...commentData, comment_text },
      errors: [{ msg: "Comment must be at least 5 characters long." }],
      messages: req.flash(),
    });
  }

  const existingComment = await commentModel.getCommentById(comment_id);
  if (!existingComment || existingComment.account_id !== account_id) {
    req.flash("error", "You are not authorized to update this comment.");
    return res.redirect("/account");
  }

  try {
    const result = await commentModel.updateComment(comment_id, comment_text);

    if (result.rowCount > 0) {
      req.flash("success", "Comment successfully updated.");
      res.redirect("/account");
    } else {
      req.flash("error", "Comment update failed. Please try again.");
      res.redirect(`/comment/edit/${comment_id}`);
    }
  } catch (error) {
    console.error("Update comment error:", error);
    req.flash("error", "A server error occurred during update.");
    res.redirect(`/comment/edit/${comment_id}`);
  }
}

/* ****************************************
 * Process comment deletion
 * *************************************** */
async function deleteComment(req, res, next) {
  if (res.locals.accountData === undefined) {
    req.flash("error", "You must be logged in to delete a comment.");
    return res.redirect("/account/login");
  }

  const comment_id = parseInt(req.params.commentId);

  const account_id = res.locals.accountData.account_id;

  const existingComment = await commentModel.getCommentById(comment_id);
  if (!existingComment || existingComment.account_id !== account_id) {
    req.flash("error", "You are not authorized to delete this comment.");
    return res.redirect("/account");
  }

  try {
    const result = await commentModel.deleteComment(comment_id);

    if (result.rowCount > 0) {
      req.flash("success", "Comment successfully deleted.");
    } else {
      req.flash("error", "Comment deletion failed.");
    }
    res.redirect("/account");
  } catch (error) {
    console.error("Delete comment error:", error);
    req.flash("error", "A server error occurred during deletion.");
    res.redirect("/account");
  }
}

module.exports = {
  getVehicleDetailsWithComments,
  addComment,
  buildEditCommentView,
  updateComment,
  deleteComment,
};
