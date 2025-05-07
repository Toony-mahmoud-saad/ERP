const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'الرجاء تحديد الموظف']
  },
  month: {
    type: Number,
    required: [true, 'الرجاء تحديد الشهر'],
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: [true, 'الرجاء تحديد السنة']
  },
  basicSalary: {
    type: Number,
    required: [true, 'الرجاء إدخال الراتب الأساسي']
  },
  allowances: {
    type: Number,
    default: 0
  },
  deductions: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  bonus: {
    type: Number,
    default: 0
  },
  absentDays: {
    type: Number,
    default: 0
  },
  lateDays: {
    type: Number,
    default: 0
  },
  leaveDays: {
    type: Number,
    default: 0
  },
  netSalary: {
    type: Number,
    required: [true, 'الرجاء إدخال صافي الراتب']
  },
  status: {
    type: String,
    enum: ['draft', 'processed', 'paid'], // ['مسودة'، 'معالجة'، 'مدفوع']
    default: 'draft'
  },
  paymentDate: {
    type: Date
  },
  notes: {
    type: String
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB'
  }
}, { timestamps: true });

// لمنع تكرار كشف الرواتب لنفس الموظف في نفس الشهر
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);