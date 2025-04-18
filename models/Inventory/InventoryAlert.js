const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'الرجاء تحديد المنتج']
  },
  currentQuantity: {
    type: Number,
    required: [true, 'الرجاء إدخال الكمية الحالية']
  },
  minQuantity: {
    type: Number,
    required: [true, 'الرجاء إدخال الحد الأدنى للكمية']
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'ignored'],
    default: 'active'
  },
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB'
  },
  resolvedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('InventoryAlert', alertSchema);