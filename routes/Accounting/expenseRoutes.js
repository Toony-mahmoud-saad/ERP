const express = require('express');
const router = express.Router();
const expenseController = require('../../controllers/Accounting/expenseController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .post(authorize, expenseController.createExpense)
  .get(authorize, expenseController.getAllExpenses);

router.route('/:id')
  .get(authorize, expenseController.getExpenseById)
  .put(authorize, expenseController.updateExpense)
  .delete(authorize, expenseController.deleteExpense);

module.exports = router;