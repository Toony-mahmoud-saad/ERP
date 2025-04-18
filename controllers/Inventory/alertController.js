const InventoryAlert = require('../../models/Inventory/InventoryAlert');
const Product = require('../../models/Inventory/Product');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على جميع تنبيهات المخزون
// @route   GET /api/alerts
// @access  Private/Admin/Inventory Keeper
const getAllAlerts = asyncHandler(async (req, res) => {
  const { status } = req.query;
  let query = {};

  if (status) {
    query.status = status;
  } else {
    query.status = 'active';
  }

  const alerts = await InventoryAlert.find(query)
    .populate('product', 'name sku quantity minQuantity location')
    .populate('resolvedBy', 'name role')
    .sort({ createdAt: -1 });

  res.json(alerts);
});

// @desc    تحديث حالة التنبيه
// @route   PUT /api/alerts/:id
// @access  Private/Admin/Inventory Keeper
const updateAlertStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const alert = await InventoryAlert.findById(req.params.id);
  if (!alert) {
    res.status(404);
    throw new Error('التنبيه غير موجود');
  }

  alert.status = status || alert.status;
  
  if (status === 'resolved') {
    alert.resolvedBy = req.user.id;
    alert.resolvedAt = new Date();
  } else if (status === 'active') {
    alert.resolvedBy = null;
    alert.resolvedAt = null;
  }

  const updatedAlert = await alert.save();
  res.json(updatedAlert);
});

// @desc    حل جميع التنبيهات النشطة
// @route   PUT /api/alerts/resolve-all
// @access  Private/Admin/Inventory Keeper
const resolveAllAlerts = asyncHandler(async (req, res) => {
  const result = await InventoryAlert.updateMany(
    { status: 'active' },
    { 
      status: 'resolved',
      resolvedBy: req.user.id,
      resolvedAt: new Date()
    }
  );

  res.json({ message: `تم حل ${result.nModified} تنبيهات` });
});

module.exports = {
  getAllAlerts,
  updateAlertStatus,
  resolveAllAlerts
};