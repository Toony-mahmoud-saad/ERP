const Attendance = require('../../models/HR/Attendance');
const Employee = require('../../models/HR/Employee');
const asyncHandler = require('express-async-handler');

// @desc    تسجيل الحضور
// @route   POST /api/attendance/checkin
// @access  Private
const checkIn = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    res.status(400);
    throw new Error('لا يوجد موظف مرتبط بهذا الحساب');
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }

  // التحقق من عدم تسجيل الحضور مسبقًا لنفس اليوم
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existingAttendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (existingAttendance) {
    res.status(400);
    throw new Error('تم تسجيل الحضور مسبقًا لهذا اليوم');
  }

  const attendance = await Attendance.create({
    employee: employeeId,
    checkIn: new Date(),
    status: 'present',
    recordedBy: req.user.id
  });

  res.status(201).json(attendance);
});

// @desc    تسجيل الانصراف
// @route   POST /api/attendance/checkout
// @access  Private
const checkOut = asyncHandler(async (req, res) => {
  const employeeId = req.user.employeeId;

  if (!employeeId) {
    res.status(400);
    throw new Error('لا يوجد موظف مرتبط بهذا الحساب');
  }

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }

  // الحصول على سجل الحضور لهذا اليوم
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const attendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: today,
      $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (!attendance) {
    res.status(400);
    throw new Error('لم يتم تسجيل الحضور لهذا اليوم');
  }

  if (attendance.checkOut) {
    res.status(400);
    throw new Error('تم تسجيل الانصراف مسبقًا لهذا اليوم');
  }

  attendance.checkOut = new Date();
  await attendance.save();

  res.json(attendance);
});

// @desc    تسجيل الحضور يدويًا (للمشرفين وموظفي HR)
// @route   POST /api/attendance/manual
// @access  Private/Admin/HR
const manualAttendance = asyncHandler(async (req, res) => {
  const { employeeId, date, checkIn, checkOut, status, notes } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }

  // تحديد تاريخ الحضور
  const attendanceDate = date ? new Date(date) : new Date();
  attendanceDate.setHours(0, 0, 0, 0);

  // التحقق من عدم وجود سجل حضور لنفس اليوم
  const existingAttendance = await Attendance.findOne({
    employee: employeeId,
    date: {
      $gte: attendanceDate,
      $lt: new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000)
    }
  });

  if (existingAttendance) {
    res.status(400);
    throw new Error('يوجد سجل حضور مسبق لنفس اليوم');
  }

  const attendance = await Attendance.create({
    employee: employeeId,
    date: attendanceDate,
    checkIn: checkIn ? new Date(checkIn) : null,
    checkOut: checkOut ? new Date(checkOut) : null,
    status: status || 'present',
    notes,
    recordedBy: req.user.id
  });

  res.status(201).json(attendance);
});

// @desc    الحصول على سجل الحضور لموظف
// @route   GET /api/attendance/employee/:id
// @access  Private
const getEmployeeAttendance = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  // التحقق من الصلاحيات
  if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.employeeId?.toString() !== employeeId) {
    res.status(403);
    throw new Error('غير مصرح لك بالوصول إلى هذه البيانات');
  }

  const { month, year } = req.query;
  
  let query = { employee: employeeId };
  
  if (month && year) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    query.date = { $gte: startDate, $lte: endDate };
  }

  const attendance = await Attendance.find(query).sort({ date: 1 });
  
  res.json(attendance);
});

// @desc    تقرير الحضور الشهري
// @route   GET /api/attendance/report/monthly
// @access  Private/Admin/HR
const getMonthlyAttendanceReport = asyncHandler(async (req, res) => {
  const { month, year, department } = req.query;

  if (!month || !year) {
    res.status(400);
    throw new Error('الرجاء إدخال الشهر والسنة');
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  let employeeFilter = {};
  if (department) {
    employeeFilter.department = department;
  }

  const employees = await Employee.find(employeeFilter);
  const report = [];

  for (const employee of employees) {
    const attendanceRecords = await Attendance.find({
      employee: employee._id,
      date: { $gte: startDate, $lte: endDate }
    });

    const presentDays = attendanceRecords.filter(record => record.status === 'present').length;
    const absentDays = attendanceRecords.filter(record => record.status === 'absent').length;
    const lateDays = attendanceRecords.filter(record => record.status === 'late').length;
    const leaveDays = attendanceRecords.filter(record => record.status === 'on_leave').length;

    report.push({
      employeeId: employee._id,
      employeeName: employee.fullName,
      department: employee.department,
      presentDays,
      absentDays,
      lateDays,
      leaveDays,
      totalWorkingDays: new Date(year, month, 0).getDate()
    });
  }

  res.json(report);
});

module.exports = {
  checkIn,
  checkOut,
  manualAttendance,
  getEmployeeAttendance,
  getMonthlyAttendanceReport
};