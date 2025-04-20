const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الرجاء إدخال اسم المنتج'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'الرجاء إدخال وصف المنتج']
  },
  sku: { // Automatically generated SKU
    type: String,
    unique: true,
    default: function () {
      return `SKU-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  },
  barcode: { // optional 'sparse' allow null or undefined
    type: String,
    unique: true,
    sparse: true
  },
  rfid: { // similar to barcode
    type: String,
    unique: true,
    sparse: true
  },
  category: {
    type: String,
    required: [true, 'الرجاء إدخال الفئة']
  },
  quantity: {
    type: Number,
    required: [true, 'الرجاء إدخال الكمية'],
    min: [0, 'الكمية لا يمكن أن تكون سلبية'],
    default: 0
  },
  minQuantity: {
    type: Number,
    required: [true, 'الرجاء إدخال الحد الأدنى للكمية'],
    min: [0, 'الحد الأدنى للكمية لا يمكن أن يكون سلبياً'],
    default: 10
  },
  price: {
    type: Number,
    required: [true, 'الرجاء إدخال السعر'],
    min: [0, 'السعر لا يمكن أن يكون سلبياً']
  },
  cost: {
    type: Number,
    required: [true, 'الرجاء إدخال التكلفة'],
    min: [0, 'التكلفة لا يمكن أن تكون سلبية']
  },
  location: {
    type: String,
    required: [true, 'الرجاء إدخال موقع التخزين']
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'الرجاء تحديد المورد']
  },
  lastSold: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// إنشاء فهرس للبحث السريع
productSchema.index({ name: 'text', description: 'text', sku: 'text' });

module.exports = mongoose.model('Product', productSchema);