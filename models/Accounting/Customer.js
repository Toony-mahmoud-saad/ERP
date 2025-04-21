const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الرجاء إدخال اسم العميل'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'الرجاء إدخال البريد الإلكتروني'],
    unique: true,
    match: [/.+@.+\..+/, 'الرجاء إدخال بريد إلكتروني صحيح']
  },
  phone: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الهاتف']
  },
  address: {
    type: String,
    required: [true, 'الرجاء إدخال العنوان']
  },
  taxNumber: {
    type: String,
    required: [true, 'الرجاء إدخال الرقم الضريبي']
  },
  paymentTerms: {
    type: Number,
    default: 30,
    min: [0, 'لا يمكن أن تكون شروط الدفع سلبية']
  },
  creditLimit: {
    type: Number,
    default: 0,
    min: [0, 'حد الائتمان لا يمكن أن يكون سلبياً']
  },
  accountBalance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active'
  },
  notes: {
    type: String,
    default: ''
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

module.exports = mongoose.model('Customer', customerSchema);