const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/Accounting/transactionController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, transactionController.getAllTransactions);

router.route('/:id')
  .get(authorize, transactionController.getTransactionById)
  .put(authorize, transactionController.updateTransaction)
  .delete(authorize, transactionController.deleteTransaction);

module.exports = router;