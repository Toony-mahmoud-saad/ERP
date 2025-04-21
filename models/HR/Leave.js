const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'الرجاء تحديد الموظف']
  },
  startDate: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ بداية الإجازة']
  },
  endDate: {
    type: Date,
    required: [true, 'الرجاء تحديد تاريخ نهاية الإجازة']
  },
  type: {
    type: String,
    enum: ['annual', 'sick', 'unpaid', 'maternity', 'paternity', 'compassionate'],
    required: [true, 'الرجاء تحديد نوع الإجازة']
  },
  reason: {
    type: String,
    required: [true, 'الرجاء إدخال سبب الإجازة']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  days: {
    type: Number,
    required: [true, 'الرجاء إدخال عدد أيام الإجازة'],
    min: [0.5, 'عدد الأيام يجب أن يكون 0.5 على الأقل']
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB'
  },
  notes: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);