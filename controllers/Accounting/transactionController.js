const Transaction = require('../../models/Accounting/Transaction');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على جميع الحركات المالية
// @route   GET /api/transactions
// @access  Private/Admin/Accountant
const getAllTransactions = asyncHandler(async (req, res) => {
  const { type, paymentMethod, startDate, endDate } = req.query;
  let query = {};

  if (paymentMethod) query.paymentMethod = paymentMethod;

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  // إذا كان النوع محددًا، نحتاج إلى البحث في الفواتير المرتبطة
  if (type) {
    const invoices = await Invoice.find({ type }).select('_id');
    query.invoice = { $in: invoices.map(i => i._id) };
  }

  const transactions = await Transaction.find(query)
    .populate({
      path: 'invoice',
      populate: {
        path: 'party',
        select: 'name'
      }
    })
    .populate('recordedBy', 'name')
    .sort({ date: -1 });

  res.json(transactions);
});

// @desc    الحصول على حركة مالية بواسطة ID
// @route   GET /api/transactions/:id
// @access  Private/Admin/Accountant
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate({
      path: 'invoice',
      populate: {
        path: 'party',
        select: 'name'
      }
    })
    .populate('recordedBy', 'name');

  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('الحركة المالية غير موجودة');
  }
});

// @desc    تحديث حركة مالية
// @route   PUT /api/transactions/:id
// @access  Private/Admin/Accountant
const updateTransaction = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, reference, notes } = req.body;

  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404);
    throw new Error('الحركة المالية غير موجودة');
  }

  // الحصول على الفاتورة المرتبطة
  const invoice = await Invoice.findById(transaction.invoice);

  // إعادة ضبط المبلغ المدفوع في الفاتورة
  invoice.paidAmount -= transaction.amount;

  // تحديث الحركة
  transaction.amount = amount;
  transaction.paymentMethod = paymentMethod;
  transaction.reference = reference;
  transaction.notes = notes;

  await transaction.save();

  // تحديث الفاتورة بالمبلغ الجديد
  invoice.paidAmount += amount;

  if (invoice.paidAmount >= invoice.total) {
    invoice.status = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.status = 'partial';
  } else {
    invoice.status = 'unpaid';
  }

  await invoice.save();

  res.json(transaction);
});

// @desc    حذف حركة مالية
// @route   DELETE /api/transactions/:id
// @access  Private/Admin
const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await Transaction.findById(req.params.id);
  if (!transaction) {
    res.status(404);
    throw new Error('الحركة المالية غير موجودة');
  }

  // الحصول على الفاتورة المرتبطة
  const invoice = await Invoice.findById(transaction.invoice);

  // تحديث الفاتورة
  invoice.paidAmount -= transaction.amount;

  if (invoice.paidAmount >= invoice.total) {
    invoice.status = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.status = 'partial';
  } else {
    invoice.status = 'unpaid';
  }

  await invoice.save();
  await transaction.remove();

  res.json({ message: 'تم حذف الحركة المالية بنجاح' });
});

module.exports = {
  getAllTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction
};