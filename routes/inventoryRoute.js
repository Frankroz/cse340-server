const express = require('express');
const router = express.Router();
const invController = require('../controllers/invController');


// Route to build inventory by classification view
router.get('/category/:classificationId', invController.buildByClassificationId);

// Route to build a specific vehicle detail view
router.get('/detail/:inv_id', invController.buildByInvId);

module.exports = router;



