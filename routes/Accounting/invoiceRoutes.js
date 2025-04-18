const express = require('express');
const router = express.Router();
const invoiceController = require('../../controllers/Accounting/invoiceController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .post(authorize, invoiceController.createInvoice)
  .get(authorize, invoiceController.getAllInvoices);

router.route('/:id')
  .get(authorize, invoiceController.getInvoiceById)
  .put(authorize, invoiceController.updateInvoice)
  .delete(authorize, invoiceController.deleteInvoice);

router.post('/:id/payments', authorize, invoiceController.recordPayment);

module.exports = router;