const Employee = require('../../models/HR/Employee');
const asyncHandler = require('express-async-handler');

// @desc    الحصول على جميع الموظفين
// @route   GET /api/employees
// @access  Private/Admin/HR
const getAllEmployees = asyncHandler(async (req, res) => {
  const { department, status } = req.query;
  let query = {};

  if (department) query.department = department;
  if (status) query.status = status;

  const employees = await Employee.find(query).sort({ fullName: 1 });
  res.json(employees);
});

// @desc    إنشاء موظف جديد
// @route   POST /api/employees
// @access  Private/Admin/HR
const createEmployee = asyncHandler(async (req, res) => {
  const {
    fullName,
    position,
    department,
    salary,
    idNumber,
    email,
    phone,
    address,
    emergencyContact,
    bankAccount,
    taxInfo
  } = req.body;

  const employeeExists = await Employee.findOne({ $or: [{ idNumber }, { email }] });

  if (employeeExists) {
    res.status(400);
    throw new Error('الموظف موجود بالفعل (رقم الهوية أو البريد الإلكتروني مستخدم)');
  }

  const employee = await Employee.create({
    fullName,
    position,
    department,
    salary,
    idNumber,
    email,
    phone,
    address,
    emergencyContact,
    bankAccount,
    taxInfo
  });

  res.status(201).json(employee);
});

// @desc    الحصول على موظف بواسطة ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    // التحقق من الصلاحيات (الإداري أو HR أو الموظف نفسه)
    if (req.user.role === 'admin' || req.user.role === 'hr' || req.user.employeeId?.toString() === req.params.id) {
      res.json(employee);
    } else {
      res.status(403);
      throw new Error('غير مصرح لك بالوصول إلى هذه البيانات');
    }
  } else {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }
});

// @desc    تحديث بيانات موظف
// @route   PUT /api/employees/:id
// @access  Private/Admin/HR
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    employee.fullName = req.body.fullName || employee.fullName;
    employee.position = req.body.position || employee.position;
    employee.department = req.body.department || employee.department;
    employee.salary = req.body.salary || employee.salary;
    employee.email = req.body.email || employee.email;
    employee.phone = req.body.phone || employee.phone;
    employee.address = req.body.address || employee.address;
    employee.emergencyContact = req.body.emergencyContact || employee.emergencyContact;
    employee.bankAccount = req.body.bankAccount || employee.bankAccount;
    employee.taxInfo = req.body.taxInfo || employee.taxInfo;
    employee.status = req.body.status || employee.status;
    employee.leaveBalance = req.body.leaveBalance || employee.leaveBalance;

    const updatedEmployee = await employee.save();
    res.json(updatedEmployee);
  } else {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }
});

// @desc    حذف موظف
// @route   DELETE /api/employees/:id
// @access  Private/Admin
const deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    await employee.remove();
    res.json({ message: 'تم حذف الموظف بنجاح' });
  } else {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }
});

// @desc    الحصول على تقرير الموظفين
// @route   GET /api/employees/reports/summary
// @access  Private/Admin/HR
const getEmployeesSummary = asyncHandler(async (req, res) => {
  const totalEmployees = await Employee.countDocuments();
  const activeEmployees = await Employee.countDocuments({ status: 'active' });
  const departments = await Employee.aggregate([
    { $group: { _id: '$department', count: { $sum: 1 } } }
  ]);
  const totalSalary = await Employee.aggregate([
    { $group: { _id: null, total: { $sum: '$salary' } } }
  ]);

  res.json({
    totalEmployees,
    activeEmployees,
    departments,
    totalMonthlySalary: totalSalary[0]?.total || 0
  });
});

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getEmployeesSummary
};