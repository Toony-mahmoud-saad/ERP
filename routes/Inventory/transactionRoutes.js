const express = require('express');
const router = express.Router();
const transactionController = require('../../controllers/Inventory/transactionController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .post(authorize, transactionController.createTransaction)
  .get(authorize, transactionController.getAllTransactions);

router.route('/:id')
  .get(authorize, transactionController.getTransactionById);

router.get('/product/:id', authorize, transactionController.getProductTransactions);

module.exports = router;