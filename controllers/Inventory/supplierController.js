const Supplier = require('../../models/Inventory/Supplier');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على جميع الموردين
// @route   GET /api/suppliers
// @access  Private/Admin/Inventory Keeper
const getAllSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find({}).sort({ name: 1 });
  res.json(suppliers);
});

// @desc    إنشاء مورد جديد
// @route   POST /api/suppliers
// @access  Private/Admin/Inventory Keeper
const createSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    // contactPerson,
    email,
    phone,
    address,
    // taxNumber,
    paymentTerms,
    // accountNumber,
    bankName,
    notes
  } = req.body;

  const supplierExists = await Supplier.findOne({ email });

  if (supplierExists) {
    res.status(400);
    throw new Error('المورد موجود بالفعل');
  }

  const supplier = await Supplier.create({
    name,
    // contactPerson,
    email,
    phone,
    address,
    // taxNumber,
    paymentTerms,
    // accountNumber,
    bankName,
    notes
  });

  res.status(201).json(supplier);
});

// @desc    الحصول على مورد بواسطة ID
// @route   GET /api/suppliers/:id
// @access  Private/Admin/Inventory Keeper
const getSupplierById = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    res.json(supplier);
  } else {
    res.status(404);
    throw new Error('المورد غير موجود');
  }
});

// @desc    تحديث مورد
// @route   PUT /api/suppliers/:id
// @access  Private/Admin/Inventory Keeper
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    supplier.name = req.body.name || supplier.name;
    // supplier.contactPerson = req.body.contactPerson || supplier.contactPerson;
    supplier.email = req.body.email || supplier.email;
    supplier.phone = req.body.phone || supplier.phone;
    supplier.address = req.body.address || supplier.address;
    // supplier.taxNumber = req.body.taxNumber || supplier.taxNumber;
    supplier.paymentTerms = req.body.paymentTerms || supplier.paymentTerms;
    // supplier.accountNumber = req.body.accountNumber || supplier.accountNumber;
    supplier.bankName = req.body.bankName || supplier.bankName;
    supplier.notes = req.body.notes || supplier.notes;

    const updatedSupplier = await supplier.save();
    res.json(updatedSupplier);
  } else {
    res.status(404);
    throw new Error('المورد غير موجود');
  }
});

// @desc    حذف مورد
// @route   DELETE /api/suppliers/:id
// @access  Private/Admin
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);

  if (supplier) {
    await Supplier.findByIdAndDelete(req.params.id);
    res.json({ message: 'تم حذف المورد بنجاح' });
  } else {
    res.status(404);
    throw new Error('المورد غير موجود');
  }
});

module.exports = {
  getAllSuppliers,
  createSupplier,
  getSupplierById,
  updateSupplier,
  deleteSupplier
};