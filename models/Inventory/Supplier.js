const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الرجاء إدخال اسم المورد'],
    trim: true
  },
  // contactPerson: {
  //   type: String,
  //   required: [true, 'الرجاء إدخال اسم الشخص المسؤول']
  // },
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
  // taxNumber: {
  //   type: String,
  //   required: [true, 'الرجاء إدخال الرقم الضريبي']
  // },
  paymentTerms: {
    type: Number,
    default: 30,
    min: [0, 'لا يمكن أن تكون شروط الدفع سلبية']
  },
  // accountNumber: {
  //   type: String
  // },
  bankName: {
    type: String
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

module.exports = mongoose.model('Supplier', supplierSchema);