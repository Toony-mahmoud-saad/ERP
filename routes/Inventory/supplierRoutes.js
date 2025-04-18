const express = require('express');
const router = express.Router();
const supplierController = require('../../controllers/Inventory/supplierController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, supplierController.getAllSuppliers)
  .post(authorize, supplierController.createSupplier);

router.route('/:id')
  .get(authorize, supplierController.getSupplierById)
  .put(authorize, supplierController.updateSupplier)
  .delete(authorize, supplierController.deleteSupplier);

module.exports = router;