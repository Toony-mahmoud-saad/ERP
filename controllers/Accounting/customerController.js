const Customer = require('../../models/Accounting/Customer');
const Invoice = require('../../models/Accounting/Invoice');
const Transaction = require('../../models/Accounting/Transaction')
const asyncHandler = require('express-async-handler');

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin/Accountant
const getAllCustomers = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};

  if (status) query.status = status;

  const customers = await Customer.find(query).sort({ name: 1 });
  res.json(customers);
});

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private/Admin/Accountant
const createCustomer = asyncHandler(async (req, res) => {
  const {
    name,
    contactPerson,
    email,
    phone,
    address,
    taxNumber,
    paymentTerms,
    creditLimit,
    notes
  } = req.body;

  const customerExists = await Customer.findOne({ email });

  if (customerExists) {
    res.status(400);
    throw new Error('العميل موجود بالفعل');
  }

  const customer = await Customer.create({
    name,
    contactPerson,
    email,
    phone,
    address,
    taxNumber,
    paymentTerms,
    creditLimit,
    notes
  });

  res.status(201).json(customer);
});

// @desc    Get customer by ID
// @route   GET /api/customers/:id
// @access  Private/Admin/Accountant
const getCustomerById = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    res.json(customer);
  } else {
    res.status(404);
    throw new Error('العميل غير موجود');
  }
});

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin/Accountant
const updateCustomer = asyncHandler(async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (customer) {
    customer.name = req.body.name || customer.name;
    customer.email = req.body.email || customer.email;
    customer.phone = req.body.phone || customer.phone;
    customer.address = req.body.address || customer.address;
    customer.taxNumber = req.body.taxNumber || customer.taxNumber;
    customer.paymentTerms = req.body.paymentTerms || customer.paymentTerms;
    customer.creditLimit = req.body.creditLimit || customer.creditLimit;
    customer.status = req.body.status || customer.status;
    customer.notes = req.body.notes || customer.notes;

    const updatedCustomer = await customer.save();
    res.json(updatedCustomer);
  } else {
    res.status(404);
    throw new Error('العميل غير موجود');
  }
});

// @desc    Get customer's invoices
// @route   GET /api/customers/:id/invoices
// @access  Private/Admin/Accountant
const getCustomerInvoices = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ 
    party: req.params.id,
    partyType: 'Customer'
  }).sort({ date: -1 });

  res.json(invoices);
});

// @desc    Get customer's transactions
// @route   GET /api/customers/:id/transactions
// @access  Private/Admin/Accountant
const getCustomerTransactions = asyncHandler(async (req, res) => {
  const invoices = await Invoice.find({ 
    party: req.params.id,
    partyType: 'Customer'
  }).select('_id');

  const transactions = await Transaction.find({
    invoice: { $in: invoices.map(i => i._id) }
  }).sort({ date: -1 });

  res.json(transactions);
});

module.exports = {
  getAllCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer,
  getCustomerInvoices,
  getCustomerTransactions
};