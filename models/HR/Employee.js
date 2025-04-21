const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'الرجاء إدخال اسم الموظف بالكامل']
  },
  position: {
    type: String,
    required: [true, 'الرجاء إدخال المسمى الوظيفي']
  },
  department: {
    type: String,
    required: [true, 'الرجاء إدخال القسم']
  },
  hireDate: {
    type: Date,
    required: [true, 'الرجاء إدخال تاريخ التعيين'],
    default: Date.now
  },
  salary: {
    type: Number,
    required: [true, 'الرجاء إدخال الراتب الأساسي'],
    min: [0, 'الراتب لا يمكن أن يكون سلبياً']
  },
  idNumber: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الهوية'],
    unique: true,
    default: () => `ID-${Math.floor(Math.random() * 1000000)}`
  },
  email: {
    type: String,
    required: [true, 'الرجاء إدخال البريد الإلكتروني'],
    unique: true,
    match: [/.+@.+\..+/, 'الرجاء إدخال بريد إلكتروني صحيح']
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: [true, 'الرجاء إدخال رقم الهاتف']
  },
  address: {
    type: String,
    required: [true, 'الرجاء إدخال العنوان']
  },
  emergencyContact: {
    name: String,
    relation: String,
    phone: String
  },
  leaveBalance: {
    type: Number,
    default: 21,
    min: [0, 'رصيد الإجازات لا يمكن أن يكون سلبياً']
  },
  status: {
    type: String,
    enum: ['active', 'on_leave', 'suspended', 'terminated'],
    default: 'active'
  },
  bankAccount: {
    bankName: String,
    accountNumber: String,
    iban: String
  },
  taxInfo: {
    taxNumber: String,
    exemption: Boolean
  },
  role: {
    type: String,
    enum: ["employee"],
    default: "employee"
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

module.exports = mongoose.model('Employee', employeeSchema);