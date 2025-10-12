const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const utilities = require("../utilities/").Util;

// Route to show the edit comment form
router.get(
  "/edit/:commentId",
  utilities.checkJWT,
  utilities.handleErrors(commentController.buildEditCommentView)
);

// Route to process the comment update
router.post(
  "/update",
  utilities.checkJWT,
  utilities.handleErrors(commentController.updateComment)
);

// Route to process comment deletion
router.get(
  "/delete/:commentId",
  utilities.checkJWT,
  utilities.handleErrors(commentController.deleteComment)
);

module.exports = router;
