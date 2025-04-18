const Product = require('../../models/Inventory/Product');
const InventoryAlert = require('../../models/Inventory/InventoryAlert');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على جميع المنتجات
// @route   GET /api/products
// @access  Private/Admin/Inventory Keeper
const getAllProducts = asyncHandler(async (req, res) => {
  const { category, lowStock, search } = req.query;
  let query = {};

  if (category) {
    query.category = category;
  }

  if (lowStock === 'true') {
    query.quantity = { $lte: '$minQuantity' };
  }

  if (search) {
    query.$text = { $search: search };
  }

  const products = await Product.find(query)
    .populate('supplier', 'name contactPerson phone')
    .sort({ quantity: 1 });

  res.json(products);
});

// @desc    إنشاء منتج جديد
// @route   POST /api/products
// @access  Private/Admin/Inventory Keeper
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    sku,
    barcode,
    rfid,
    category,
    quantity,
    minQuantity,
    price,
    cost,
    location,
    supplier
  } = req.body;

  const productExists = await Product.findOne({ sku });
  if (productExists) {
    res.status(400);
    throw new Error('المنتج موجود بالفعل');
  }

  const product = await Product.create({
    name,
    description,
    sku,
    barcode,
    rfid,
    category,
    quantity,
    minQuantity,
    price,
    cost,
    location,
    supplier
  });

  // التحقق من تنبيهات المخزون
  if (product.quantity < product.minQuantity) {
    await InventoryAlert.create({
      product: product._id,
      currentQuantity: product.quantity,
      minQuantity: product.minQuantity
    });
  }

  res.status(201).json(product);
});

// @desc    الحصول على منتج بواسطة ID
// @route   GET /api/products/:id
// @access  Private
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('supplier', 'name');

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('المنتج غير موجود');
  }
});

// @desc    تحديث منتج
// @route   PUT /api/products/:id
// @access  Private/Admin/Inventory Keeper
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    product.name = req.body.name || product.name;
    product.description = req.body.description || product.description;
    product.barcode = req.body.barcode || product.barcode;
    product.rfid = req.body.rfid || product.rfid;
    product.category = req.body.category || product.category;
    product.minQuantity = req.body.minQuantity || product.minQuantity;
    product.price = req.body.price || product.price;
    product.cost = req.body.cost || product.cost;
    product.location = req.body.location || product.location;
    product.supplier = req.body.supplier || product.supplier;

    const updatedProduct = await product.save();

    // التحقق من تنبيهات المخزون
    if (updatedProduct.quantity < updatedProduct.minQuantity) {
      const existingAlert = await InventoryAlert.findOne({ 
        product: updatedProduct._id,
        status: 'active'
      });

      if (!existingAlert) {
        await InventoryAlert.create({
          product: updatedProduct._id,
          currentQuantity: updatedProduct.quantity,
          minQuantity: updatedProduct.minQuantity
        });
      }
    }

    res.json(updatedProduct);
  } else {
    res.status(404);
    throw new Error('المنتج غير موجود');
  }
});

// @desc    حذف منتج
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    await product.remove();
    await InventoryAlert.deleteMany({ product: product._id });
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } else {
    res.status(404);
    throw new Error('المنتج غير موجود');
  }
});

// @desc    الحصول على تقارير المخزون
// @route   GET /api/products/reports/summary
// @access  Private/Admin/Inventory Keeper
const getInventorySummary = asyncHandler(async (req, res) => {
  const totalProducts = await Product.countDocuments();
  const totalValue = await Product.aggregate([
    { $group: { _id: null, total: { $sum: { $multiply: ['$quantity', '$cost'] } } } }
  ]);
  const lowStockProducts = await Product.countDocuments({ 
    $expr: { $lte: ['$quantity', '$minQuantity'] } 
  });
  const outOfStockProducts = await Product.countDocuments({ quantity: 0 });

  res.json({
    totalProducts,
    totalValue: totalValue[0]?.total || 0,
    lowStockProducts,
    outOfStockProducts
  });
});

// @desc    الحصول على المنتجات الأكثر مبيعًا
// @route   GET /api/products/reports/top-selling
// @access  Private/Admin/Inventory Keeper
const getTopSellingProducts = asyncHandler(async (req, res) => {
  const { limit = 10, period = 'month' } = req.query;
  let dateFilter = {};

  if (period === 'month') {
    dateFilter = { 
      date: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) 
      } 
    };
  } else if (period === 'year') {
    dateFilter = { 
      date: { 
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
      } 
    };
  }

  const topSelling = await InventoryTransaction.aggregate([
    { $match: { type: 'sale', ...dateFilter } },
    { $group: { _id: '$product', totalSold: { $sum: '$quantity' } } },
    { $sort: { totalSold: -1 } },
    { $limit: parseInt(limit) },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    { $project: { 
        productName: '$product.name', 
        productCategory: '$product.category',
        totalSold: 1 
      } 
    }
  ]);

  res.json(topSelling);
});

// @desc    الحصول على المنتجات غير المباعة
// @route   GET /api/products/reports/non-selling
// @access  Private/Admin/Inventory Keeper
const getNonSellingProducts = asyncHandler(async (req, res) => {
  const { period = 'month' } = req.query;
  let dateFilter = {};

  if (period === 'month') {
    dateFilter = { 
      date: { 
        $gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) 
      } 
    };
  } else if (period === 'year') {
    dateFilter = { 
      date: { 
        $gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1)) 
      } 
    };
  }

  const soldProducts = await InventoryTransaction.distinct('product', { 
    type: 'sale', 
    ...dateFilter 
  });

  const nonSellingProducts = await Product.find({
    _id: { $nin: soldProducts },
    quantity: { $gt: 0 }
  }).select('name category quantity price cost location');

  res.json(nonSellingProducts);
});

module.exports = {
  getAllProducts,
  createProduct,
  getProductById,
  updateProduct,
  deleteProduct,
  getInventorySummary,
  getTopSellingProducts,
  getNonSellingProducts
};