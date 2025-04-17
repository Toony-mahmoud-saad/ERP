const Leave = require('../../models/HR/Leave');
const Employee = require('../../models/HR/Employee');
const asyncHandler = require('express-async-handler');

// @desc    طلب إجازة جديدة
// @route   POST /api/leaves
// @access  Private
const createLeaveRequest = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, reason } = req.body;
  let {id} = req.params
  const employeeId = id;

  const employee = await Employee.findById(employeeId);
  if (!employee) {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }

  // حساب عدد أيام الإجازة
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

  // التحقق من رصيد الإجازة إذا كانت مدفوعة
  if (type === 'annual' && employee.leaveBalance < days) {
    res.status(400);
    throw new Error('لا يوجد رصيد كافٍ من الإجازات');
  }

  const leaveRequest = await Leave.create({
    employee: employeeId,
    startDate,
    endDate,
    type,
    reason,
    days,
    status: 'pending'
  });

  res.status(201).json(leaveRequest);
});

// @desc    الموافقة/رفض طلب الإجازة
// @route   PUT /api/leaves/:id/approve
// @access  Private/Admin-HR
const approveLeaveRequest = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const leaveRequest = await Leave.findById(req.params.id).populate('employee');
  if (!leaveRequest) {
    res.status(404);
    throw new Error('طلب الإجازة غير موجود');
  }

  if (leaveRequest.status !== 'pending') {
    res.status(400);
    throw new Error('تمت معالجة طلب الإجازة مسبقًا');
  }

  leaveRequest.status = status;
  leaveRequest.approvedBy = req.user._id;

  // إذا تمت الموافقة وكانت إجازة مدفوعة، نقوم بخصمها من رصيد الموظف
  if (status === 'approved' && leaveRequest.type === 'annual') {
    const employee = await Employee.findById(leaveRequest.employee);
    employee.leaveBalance -= leaveRequest.days;
    await employee.save();
  }

  await leaveRequest.save();
  res.json(leaveRequest);
});

// @desc    الحصول على طلبات الإجازة لموظف
// @route   GET /api/leaves/employee/:id
// @access  Private/Admin-HR أو الموظف نفسه
const getEmployeeLeaves = asyncHandler(async (req, res) => {
  const employeeId = req.params.id;

  // التحقق من الصلاحيات
  if (req.user.role !== 'admin' && req.user.role !== 'hr' && req.user.employeeId.toString() !== employeeId) {
    res.status(403);
    throw new Error('غير مصرح لك بالوصول إلى هذه البيانات');
  }

  const leaves = await Leave.find({ employee: employeeId }).sort({ startDate: -1 });
  res.json(leaves);
});

// @desc    الحصول على جميع طلبات الإجازة (للإداريين)
// @route   GET /api/leaves
// @access  Private/Admin-HR
const getAllLeaves = asyncHandler(async (req, res) => {
  const { status, type } = req.query;
  let filter = {};

  if (status) filter.status = status;
  if (type) filter.type = type;

  const leaves = await Leave.find(filter)
    .populate('employee', 'fullName department')
    .sort({ createdAt: -1 });
  
  res.json(leaves);
});

// @desc    تحديث طلب الإجازة
// @route   PUT /api/leaves/:id
// @access  Private/Admin-HR أو الموظف نفسه (إذا كان الطلب معلقًا)
const updateLeaveRequest = asyncHandler(async (req, res) => {
  const { startDate, endDate, type, reason } = req.body;

  const leaveRequest = await Leave.findById(req.params.id);
  if (!leaveRequest) {
    res.status(404);
    throw new Error('طلب الإجازة غير موجود');
  }

  // التحقق من الصلاحيات
  const isEmployeeOwner = req.user.employeeId && req.user.employeeId.toString() === leaveRequest.employee.toString();
  const isAdminOrHR = req.user.role === 'admin' || req.user.role === 'hr';

  if (!isAdminOrHR && (!isEmployeeOwner || leaveRequest.status !== 'pending')) {
    res.status(403);
    throw new Error('غير مصرح لك بتحديث هذا الطلب');
  }

  if (startDate) leaveRequest.startDate = startDate;
  if (endDate) leaveRequest.endDate = endDate;
  if (type) leaveRequest.type = type;
  if (reason) leaveRequest.reason = reason;

  // إعادة حساب الأيام إذا تم تغيير التواريخ
  if (startDate || endDate) {
    const start = new Date(leaveRequest.startDate);
    const end = new Date(leaveRequest.endDate);
    leaveRequest.days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  }

  await leaveRequest.save();
  res.json(leaveRequest);
});

// @desc    حذف طلب الإجازة
// @route   DELETE /api/leaves/:id
// @access  Private/Admin-HR أو الموظف نفسه (إذا كان الطلب معلقًا)
const deleteLeaveRequest = asyncHandler(async (req, res) => {
  try {
    let {id} = req.params;
    let leave = await Leave.findByIdAndDelete(id);
    res.json({ message: 'تم حذف طلب الإجازة بنجاح' });
  } catch (error) {
    res.status(400).json({message: error.message})
  }

});

module.exports = {
  createLeaveRequest,
  approveLeaveRequest,
  getEmployeeLeaves,
  getAllLeaves,
  updateLeaveRequest,
  deleteLeaveRequest
};