const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/Accounting/customerController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, customerController.getAllCustomers)
  .post(authorize, customerController.createCustomer);

router.route('/:id')
  .get(authorize, customerController.getCustomerById)
  .put(authorize, customerController.updateCustomer);

router.get('/:id/invoices', authorize, customerController.getCustomerInvoices);
router.get('/:id/transactions', authorize, customerController.getCustomerTransactions);

module.exports = router;