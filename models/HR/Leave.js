const mongoose = require('mongoose');
// الاجازات
const leaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  type: {
    type: String,
    enum: ['annual', 'sick', 'unpaid', 'maternity', 'paternity'], // ['سنوي'، 'مرضي'، 'غير مدفوع الأجر'، 'أمومة'، 'أبوة']،
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // ['معلق'، 'موافق عليه'، 'مرفوض']
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  days: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Leave', leaveSchema);
