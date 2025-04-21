const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    required: [true, 'الرجاء تحديد الفاتورة المرتبطة']
  },
  amount: {
    type: Number,
    required: [true, 'الرجاء إدخال المبلغ'],
    min: [0.01, 'المبلغ يجب أن يكون أكبر من الصفر']
  },
  date: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ العملية'],
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
  notes: {
    type: String,
    default: ""
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Transaction', transactionSchema);