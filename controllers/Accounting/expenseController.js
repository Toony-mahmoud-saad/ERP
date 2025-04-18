const Expense = require('../../models/Accounting/Expense');
const asyncHandler = require('express-async-handler');

// @desc    إنشاء مصروف جديد
// @route   POST /api/expenses
// @access  Private/Admin/Accountant
const createExpense = asyncHandler(async (req, res) => {
  const { description, category, amount, date, paymentMethod, reference, taxDeductible, notes } = req.body;

  const expense = await Expense.create({
    description,
    category,
    amount,
    date: new Date(date),
    paymentMethod,
    reference,
    taxDeductible: taxDeductible || false,
    notes,
    recordedBy: req.user.id
  });

  res.status(201).json(expense);
});

// @desc    الحصول على جميع المصروفات
// @route   GET /api/expenses
// @access  Private/Admin/Accountant
const getAllExpenses = asyncHandler(async (req, res) => {
  const { category, startDate, endDate, paymentMethod } = req.query;
  let query = {};

  if (category) query.category = category;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const expenses = await Expense.find(query)
    .populate('recordedBy', 'name')
    .sort({ date: -1 });

  res.json(expenses);
});

// @desc    الحصول على مصروف بواسطة ID
// @route   GET /api/expenses/:id
// @access  Private/Admin/Accountant
const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('recordedBy', 'name');

  if (expense) {
    res.json(expense);
  } else {
    res.status(404);
    throw new Error('المصروف غير موجود');
  }
});

// @desc    تحديث مصروف
// @route   PUT /api/expenses/:id
// @access  Private/Admin/Accountant
const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (expense) {
    expense.description = req.body.description || expense.description;
    expense.category = req.body.category || expense.category;
    expense.amount = req.body.amount || expense.amount;
    expense.date = req.body.date ? new Date(req.body.date) : expense.date;
    expense.paymentMethod = req.body.paymentMethod || expense.paymentMethod;
    expense.reference = req.body.reference || expense.reference;
    expense.taxDeductible = req.body.taxDeductible || expense.taxDeductible;
    expense.notes = req.body.notes || expense.notes;

    const updatedExpense = await expense.save();
    res.json(updatedExpense);
  } else {
    res.status(404);
    throw new Error('المصروف غير موجود');
  }
});

// @desc    حذف مصروف
// @route   DELETE /api/expenses/:id
// @access  Private/Admin
const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);

  if (expense) {
    await expense.remove();
    res.json({ message: 'تم حذف المصروف بنجاح' });
  } else {
    res.status(404);
    throw new Error('المصروف غير موجود');
  }
});

module.exports = {
  createExpense,
  getAllExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense
};