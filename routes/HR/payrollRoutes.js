const express = require('express');
const router = express.Router();
const payrollController = require('../../controllers/HR/payrollController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .post(authorize, payrollController.createPayroll);

router.route('/employee/:id')
  .get(authorize, payrollController.getEmployeePayrolls);

router.route('/:id')
  .get(authorize, payrollController.getPayrollById);

router.put('/:id/pay', authorize, payrollController.markPayrollAsPaid);
router.get('/report/monthly', authorize, payrollController.getMonthlyPayrollReport);

module.exports = router;