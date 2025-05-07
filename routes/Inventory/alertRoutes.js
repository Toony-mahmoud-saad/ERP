const express = require('express');
const router = express.Router();
const alertController = require('../../controllers/Inventory/alertController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, alertController.getAllAlerts);

router.route('/:id')
  .put(authorize, alertController.updateAlertStatus);

router.route('/resolve_all')
  .put(authorize, alertController.resolveAllAlerts);

module.exports = router;