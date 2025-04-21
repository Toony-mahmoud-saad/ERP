const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: [true, 'الرجاء تحديد الموظف']
  },
  date: {
    type: Date,
    required: [true, 'الرجاء تحديد التاريخ'],
    default: Date.now
  },
  checkIn: {
    type: Date
  },
  checkOut: {
    type: Date
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late', 'on_leave', 'half_day'],
    default: 'absent'
  },
  notes: {
    type: String
  },
  recordedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'userDB',
    required: true
  }
}, { timestamps: true });

// لمنع تسجيل حضور متكرر لنفس الموظف في نفس اليوم
attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);