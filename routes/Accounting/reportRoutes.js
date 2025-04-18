const express = require('express');
const router = express.Router();
const reportController = require('../../controllers/Accounting/reportController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, reportController.getFinancialReports);

router.route('/:id')
  .get(authorize, reportController.getFinancialReportById);

router.post('/profit-loss', authorize, reportController.generateProfitLossReport);
router.post('/cash-flow', authorize, reportController.generateCashFlowReport);

module.exports = router;