const Invoice = require('../../models/Accounting/Invoice');
const Transaction = require('../../models/Accounting/Transaction');
const asyncHandler = require('express-async-handler');

// @desc    إنشاء فاتورة جديدة
// @route   POST /api/invoices
// @access  Private/Admin/Accountant
const createInvoice = asyncHandler(async (req, res) => {
  const { type, party, partyType, items, discount, paymentMethod, notes, dueDate } = req.body;

  // توليد رقم فاتورة تلقائي
  const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 });
  const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;

  const invoice = await Invoice.create({
    invoiceNumber,
    type,
    party,
    partyType,
    items,
    discount: discount || 0,
    paymentMethod,
    notes,
    dueDate: new Date(dueDate),
    createdBy: req.user.id
  });

  res.status(201).json(invoice);
});

// @desc    الحصول على جميع الفواتير
// @route   GET /api/invoices
// @access  Private/Admin/Accountant
const getAllInvoices = asyncHandler(async (req, res) => {
  const { type, status, startDate, endDate, party } = req.query;
  let query = {};

  if (type) query.type = type;
  if (status) query.status = status;
  if (party) query.party = party;

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const invoices = await Invoice.find(query)
    .populate('party', 'name')
    .populate('createdBy', 'name')
    .sort({ date: -1 });

  res.json(invoices);
});

// @desc    الحصول على فاتورة بواسطة ID
// @route   GET /api/invoices/:id
// @access  Private/Admin/Accountant
const getInvoiceById = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('party', 'name email phone')
    .populate('createdBy', 'name')
    .populate('updatedBy', 'name');

  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404);
    throw new Error('الفاتورة غير موجودة');
  }
});

// @desc    تحديث فاتورة
// @route   PUT /api/invoices/:id
// @access  Private/Admin/Accountant
const updateInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    // لا يمكن تحديث الفاتورة إذا كانت مدفوعة بالكامل
    if (invoice.status === 'paid') {
      res.status(400);
      throw new Error('لا يمكن تعديل فاتورة مدفوعة بالكامل');
    }

    invoice.items = req.body.items || invoice.items;
    invoice.discount = req.body.discount || invoice.discount;
    invoice.notes = req.body.notes || invoice.notes;
    invoice.updatedBy = req.user.id;

    const updatedInvoice = await invoice.save();
    res.json(updatedInvoice);
  } else {
    res.status(404);
    throw new Error('الفاتورة غير موجودة');
  }
});

// @desc    حذف فاتورة
// @route   DELETE /api/invoices/:id
// @access  Private/Admin
const deleteInvoice = asyncHandler(async (req, res) => {
  const invoice = await Invoice.findById(req.params.id);

  if (invoice) {
    // لا يمكن حذف فاتورة بها مدفوعات
    const hasTransactions = await Transaction.exists({ invoice: invoice._id });
    if (hasTransactions) {
      res.status(400);
      throw new Error('لا يمكن حذف فاتورة بها مدفوعات مسجلة');
    }

    await invoice.remove();
    res.json({ message: 'تم حذف الفاتورة بنجاح' });
  } else {
    res.status(404);
    throw new Error('الفاتورة غير موجودة');
  }
});

// @desc    تسجيل دفعة للفاتورة
// @route   POST /api/invoices/:id/payments
// @access  Private/Admin/Accountant
const recordPayment = asyncHandler(async (req, res) => {
  const { amount, paymentMethod, reference, notes } = req.body;

  const invoice = await Invoice.findById(req.params.id);
  if (!invoice) {
    res.status(404);
    throw new Error('الفاتورة غير موجودة');
  }

  // إنشاء حركة الدفع
  const transaction = await Transaction.create({
    invoice: invoice._id,
    amount,
    paymentMethod,
    reference,
    notes,
    recordedBy: req.user.id
  });

  // تحديث الفاتورة
  invoice.paidAmount += amount;
  invoice.paymentMethod = paymentMethod;

  if (invoice.paidAmount >= invoice.total) {
    invoice.status = 'paid';
  } else if (invoice.paidAmount > 0) {
    invoice.status = 'partial';
  }

  await invoice.save();

  res.status(201).json(transaction);
});

module.exports = {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  updateInvoice,
  deleteInvoice,
  recordPayment
};