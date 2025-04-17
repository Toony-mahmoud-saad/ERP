const Payroll = require('../../models/HR/Payroll');
const Employee = require('../../models/HR/Employee');
const Attendance = require('../../models/HR/Attendance');
const asyncHandler = require('express-async-handler');

// @desc    إنشاء كشف رواتب لموظف
// @route   POST /api/payroll
// @access  Private/Admin-HR
const createPayroll = asyncHandler(async (req, res) => {
  const { employeeId, month, year, allowances, deductions, tax, bonus, notes } = req.body;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }

  // التحقق من عدم وجود كشف رواتب مسبق لنفس الشهر
  const payrollExists = await Payroll.findOne({ employee: employeeId, month, year });
  if (payrollExists) {
    res.status(400);
    throw new Error('تم إنشاء كشف الرواتب لهذا الشهر بالفعل');
  }

  // حساب أيام الغياب
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const attendanceRecords = await Attendance.find({
    employee: employeeId,
    date: { $gte: startDate, $lte: endDate },
    status: 'absent'
  });

  const absentDays = attendanceRecords.length;

  // حساب الراتب الأساسي بعد خصم أيام الغياب
  const dailySalary = employee.salary / 30; // افتراضيًا 30 يوم في الشهر
  const salaryAfterAbsence = employee.salary - (absentDays * dailySalary);

  // حساب صافي الراتب
  const netSalary = salaryAfterAbsence + (allowances || 0) - (deductions || 0) - (tax || 0) + (bonus || 0);

  const payroll = await Payroll.create({
    employee: employeeId,
    month,
    year,
    basicSalary: employee.salary,
    allowances: allowances || 0,
    deductions: deductions || 0,
    tax: tax || 0,
    bonus: bonus || 0,
    absentDays,
    netSalary,
    notes,
    status: 'processed'
  });

  res.status(201).json(payroll);
});

// @desc    الحصول على كشوف الرواتب لموظف
// @route   GET /api/payroll/employee/:id
// @access  Private/Admin-HR أو الموظف نفسه
const getEmployeePayrolls = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  // التحقق من الصلاحيات
  if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.employeeId.toString() !== employeeId) {
    res.status(403);
    throw new Error('غير مصرح لك بالوصول إلى هذه البيانات');
  }

  const payrolls = await Payroll.find({ employee: employeeId }).sort({ year: -1, month: -1 });
  res.json(payrolls);
});

// @desc    الحصول على كشف رواتب محدد
// @route   GET /api/payroll/:id
// @access  Private/Admin-HR أو الموظف نفسه
const getPayrollById = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id).populate('employee', 'fullName jobTitle department');

  if (!payroll) {
    res.status(404);
    throw new Error('كشف الرواتب غير موجود');
  }

  // التحقق من الصلاحيات
  const isEmployeeOwner = req.user.employeeId && req.user.employeeId.toString() === payroll.employee._id.toString();
  const isAdminOrHR = req.user.role === 'admin' || req.user.role === 'hr';

  if (!isAdminOrHR && !isEmployeeOwner) {
    res.status(403);
    throw new Error('غير مصرح لك بالوصول إلى هذه البيانات');
  }

  res.json(payroll);
});

// @desc    تحديث حالة كشف الرواتب (تم الدفع)
// @route   PUT /api/payroll/:id/pay
// @access  Private/Admin-HR
const markPayrollAsPaid = asyncHandler(async (req, res) => {
  const payroll = await Payroll.findById(req.params.id);

  if (!payroll) {
    res.status(404);
    throw new Error('كشف الرواتب غير موجود');
  }

  payroll.status = 'paid';
  payroll.paymentDate = new Date();
  await payroll.save();

  res.json(payroll);
});

// @desc    تقرير الرواتب الشهرية
// @route   GET /api/payroll/report/monthly
// @access  Private/Admin-HR
const getMonthlyPayrollReport = asyncHandler(async (req, res) => {
  const { month, year, department } = req.query;

  if (!month || !year) {
    res.status(400);
    throw new Error('الرجاء إدخال الشهر والسنة');
  }

  let employeeFilter = {};
  if (department) {
    employeeFilter.department = department;
  }

  const employees = await Employee.find(employeeFilter);
  const report = {
    totalEmployees: 0,
    totalBasicSalary: 0,
    totalAllowances: 0,
    totalDeductions: 0,
    totalTax: 0,
    totalBonus: 0,
    totalNetSalary: 0,
    employees: []
  };

  for (const employee of employees) {
    const payroll = await Payroll.findOne({
      employee: employee._id,
      month,
      year
    });

    if (payroll) {
      report.totalEmployees++;
      report.totalBasicSalary += payroll.basicSalary;
      report.totalAllowances += payroll.allowances;
      report.totalDeductions += payroll.deductions;
      report.totalTax += payroll.tax;
      report.totalBonus += payroll.bonus;
      report.totalNetSalary += payroll.netSalary;

      report.employees.push({
        employeeId: employee._id,
        employeeName: employee.fullName,
        department: employee.department,
        basicSalary: payroll.basicSalary,
        allowances: payroll.allowances,
        deductions: payroll.deductions,
        tax: payroll.tax,
        bonus: payroll.bonus,
        netSalary: payroll.netSalary,
        status: payroll.status
      });
    }
  }

  res.json(report);
});

module.exports = {
  createPayroll,
  getEmployeePayrolls,
  getPayrollById,
  markPayrollAsPaid,
  getMonthlyPayrollReport
};