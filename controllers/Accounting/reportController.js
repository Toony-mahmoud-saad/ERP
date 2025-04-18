const Invoice = require('../../models/Accounting/Invoice');
const Expense = require('../../models/Accounting/Expense');
const FinancialReport = require('../../models/Accounting/FinancialReport');
const asyncHandler = require('express-async-handler');

// @desc    إنشاء تقرير الربح والخسارة
// @route   POST /api/reports/profit-loss
// @access  Private/Admin/Accountant
const generateProfitLossReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  // حساب الإيرادات من فواتير المبيعات
  const salesInvoices = await Invoice.find({
    type: 'sale',
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const totalRevenue = salesInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  // حساب تكلفة البضاعة المباعة من فواتير المشتريات
  const purchaseInvoices = await Invoice.find({
    type: 'purchase',
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const totalCostOfGoodsSold = purchaseInvoices.reduce((sum, invoice) => sum + invoice.total, 0);

  // حساب المصروفات
  const expenses = await Expense.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  // حساب صافي الربح
  const grossProfit = totalRevenue - totalCostOfGoodsSold;
  const netProfit = grossProfit - totalExpenses;

  // إنشاء التقرير
  const reportData = {
    totalRevenue,
    totalCostOfGoodsSold,
    grossProfit,
    totalExpenses,
    netProfit,
    salesCount: salesInvoices.length,
    purchaseCount: purchaseInvoices.length,
    expenseCount: expenses.length
  };

  // حفظ التقرير في قاعدة البيانات
  const report = await FinancialReport.create({
    title: `تقرير الربح والخسارة من ${startDate} إلى ${endDate}`,
    type: 'profit_loss',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    data: reportData,
    generatedBy: req.user.id
  });

  res.status(201).json(report);
});

// @desc    الحصول على تقارير مالية
// @route   GET /api/reports
// @access  Private/Admin/Accountant
const getFinancialReports = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  let query = {};

  if (type) query.type = type;
  if (startDate && endDate) {
    query.startDate = {
      $gte: new Date(startDate)
    };
    query.endDate = {
      $lte: new Date(endDate)
    };
  }

  const reports = await FinancialReport.find(query)
    .populate('generatedBy', 'name')
    .sort({ createdAt: -1 });

  res.json(reports);
});

// @desc    الحصول على تقرير مالي بواسطة ID
// @route   GET /api/reports/:id
// @access  Private/Admin/Accountant
const getFinancialReportById = asyncHandler(async (req, res) => {
  const report = await FinancialReport.findById(req.params.id)
    .populate('generatedBy', 'name');

  if (report) {
    res.json(report);
  } else {
    res.status(404);
    throw new Error('التقرير غير موجود');
  }
});

// @desc    إنشاء تقرير التدفق النقدي
// @route   POST /api/reports/cash-flow
// @access  Private/Admin/Accountant
const generateCashFlowReport = asyncHandler(async (req, res) => {
  const { startDate, endDate } = req.body;

  // الحصول على جميع الحركات المالية
  const transactions = await Transaction.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).populate('invoice');

  // تصنيف الحركات
  const cashInflows = transactions.filter(t => t.invoice.type === 'sale');
  const cashOutflows = transactions.filter(t => t.invoice.type === 'purchase');

  // حساب إجمالي التدفقات
  const totalInflows = cashInflows.reduce((sum, t) => sum + t.amount, 0);
  const totalOutflows = cashOutflows.reduce((sum, t) => sum + t.amount, 0);
  const netCashFlow = totalInflows - totalOutflows;

  // الحصول على المصروفات
  const expenses = await Expense.find({
    date: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  });

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  // إنشاء التقرير
  const reportData = {
    totalInflows,
    totalOutflows,
    totalExpenses,
    netCashFlow: netCashFlow - totalExpenses,
    transactionCount: transactions.length,
    expenseCount: expenses.length
  };

  // حفظ التقرير في قاعدة البيانات
  const report = await FinancialReport.create({
    title: `تقرير التدفق النقدي من ${startDate} إلى ${endDate}`,
    type: 'cash_flow',
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    data: reportData,
    generatedBy: req.user.id
  });

  res.status(201).json(report);
});

module.exports = {
  generateProfitLossReport,
  getFinancialReports,
  getFinancialReportById,
  generateCashFlowReport
};