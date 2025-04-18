const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  description: {
    type: String,
    required: [true, 'الرجاء إدخال وصف المصروف']
  },
  category: {
    type: String,
    enum: ['salary', 'rent', 'utilities', 'office_supplies', 'marketing', 'maintenance', 'taxes', 'other'],
    required: [true, 'الرجاء تحديد تصنيف المصروف']
  },
  amount: {
    type: Number,
    required: [true, 'الرجاء إدخال المبلغ'],
    min: [0.01, 'المبلغ يجب أن يكون أكبر من الصفر']
  },
  date: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ المصروف'],
    default: Date.now
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'bank_transfer', 'credit_card', 'cheque'],
    required: [true, 'الرجاء تحديد طريقة الدفع']
  },
  reference: {
    type: String,
    required: [true, 'الرجاء إدخال المرجع']
  },
  taxDeductible: {
    type: Boolean,
    default: false
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: true
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Expense', expenseSchema);