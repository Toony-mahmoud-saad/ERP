const mongoose = require('mongoose');

const financialReportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'الرجاء إدخال عنوان التقرير']
  },
  type: {
    type: String,
    enum: ['profit_loss', 'balance_sheet', 'cash_flow', 'tax', 'custom'],
    required: [true, 'الرجاء تحديد نوع التقرير']
  },
  startDate: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ البداية']
  },
  endDate: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ النهاية']
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: true
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('FinancialReport', financialReportSchema);