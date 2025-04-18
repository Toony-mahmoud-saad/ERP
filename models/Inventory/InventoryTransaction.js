const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'الرجاء تحديد المنتج']
  },
  quantity: {
    type: Number,
    required: [true, 'الرجاء إدخال الكمية'],
    min: [1, 'الكمية يجب أن تكون على الأقل 1']
  },
  type: {
    type: String,
    enum: ['purchase', 'sale', 'adjustment', 'return'],
    required: [true, 'الرجاء تحديد نوع العملية']
  },
  reference: {
    type: String,
    required: [true, 'الرجاء إدخال المرجع']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: [true, 'الرجاء تحديد المستخدم']
  },
  notes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('InventoryTransaction', transactionSchema);