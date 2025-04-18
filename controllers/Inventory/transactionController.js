const InventoryTransaction = require('../../models/Inventory/InventoryTransaction');
const Product = require('../../models/Inventory/Product');
const InventoryAlert = require('../../models/Inventory/InventoryAlert');
const asyncHandler = require('express-async-handler');

// @desc    تسجيل حركة مخزون
// @route   POST /api/transactions
// @access  Private/Admin/Inventory Keeper
const createTransaction = asyncHandler(async (req, res) => {
  const { product, quantity, type, reference, notes } = req.body;

  const productData = await Product.findById(product);
  if (!productData) {
    res.status(404);
    throw new Error('المنتج غير موجود');
  }

  // تحديث كمية المنتج بناءً على نوع الحركة
  if (type === 'purchase' || type === 'return') {
    productData.quantity += quantity;
  } else if (type === 'sale') {
    if (productData.quantity < quantity) {
      res.status(400);
      throw new Error('الكمية المتاحة غير كافية');
    }
    productData.quantity -= quantity;
    productData.lastSold = new Date();
  } else if (type === 'adjustment') {
    if (quantity < 0 && productData.quantity < Math.abs(quantity)) {
      res.status(400);
      throw new Error('الكمية المتاحة غير كافية');
    }
    productData.quantity += quantity;
  }

  // حفظ المنتج المحدث
  await productData.save();

  // إنشاء حركة المخزون
  const transaction = await InventoryTransaction.create({
    product,
    quantity: type === 'sale' ? -Math.abs(quantity) : Math.abs(quantity),
    type,
    reference,
    user: req.user.id,
    notes
  });

  // التحقق من تنبيهات المخزون
  if (productData.quantity < productData.minQuantity) {
    const existingAlert = await InventoryAlert.findOne({ 
      product: productData._id,
      status: 'active'
    });

    if (!existingAlert) {
      await InventoryAlert.create({
        product: productData._id,
        currentQuantity: productData.quantity,
        minQuantity: productData.minQuantity
      });
    }
  } else {
    // حل التنبيه إذا كان موجودًا والكمية أصبحت كافية
    await InventoryAlert.updateMany(
      { product: productData._id, status: 'active' },
      { status: 'resolved', resolvedBy: req.user.id, resolvedAt: new Date() }
    );
  }

  res.status(201).json(transaction);
});

// @desc    الحصول على جميع حركات المخزون
// @route   GET /api/transactions
// @access  Private/Admin/Inventory Keeper
const getAllTransactions = asyncHandler(async (req, res) => {
  const { product, type, startDate, endDate } = req.query;
  let query = {};

  if (product) {
    query.product = product;
  }

  if (type) {
    query.type = type;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const transactions = await InventoryTransaction.find(query)
    .populate('product', 'name sku')
    .populate('user', 'name role')
    .sort({ date: -1 });

  res.json(transactions);
});

// @desc    الحصول على حركة مخزون بواسطة ID
// @route   GET /api/transactions/:id
// @access  Private/Admin/Inventory Keeper
const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await InventoryTransaction.findById(req.params.id)
    .populate('product', 'name sku')
    .populate('user', 'name role');

  if (transaction) {
    res.json(transaction);
  } else {
    res.status(404);
    throw new Error('حركة المخزون غير موجودة');
  }
});

// @desc    الحصول على تاريخ حركات منتج معين
// @route   GET /api/transactions/product/:id
// @access  Private/Admin/Inventory Keeper
const getProductTransactions = asyncHandler(async (req, res) => {
  const { type, startDate, endDate } = req.query;
  let query = { product: req.params.id };

  if (type) {
    query.type = type;
  }

  if (startDate && endDate) {
    query.date = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const transactions = await InventoryTransaction.find(query)
    .populate('user', 'name role')
    .sort({ date: -1 });

  res.json(transactions);
});

module.exports = {
  createTransaction,
  getAllTransactions,
  getTransactionById,
  getProductTransactions
};