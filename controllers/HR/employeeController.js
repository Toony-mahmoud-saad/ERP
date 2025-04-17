const Employee = require('../../models/HR/Employee');
const asyncHandler = require('express-async-handler');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc    الحصول على جميع الموظفين
// @route   GET /api/employees
// @access  Private/Admin-HR
const getAllEmployees = asyncHandler(async (req, res) => {
  const employees = await Employee.find({}).sort({ createdAt: -1 });
  res.json(employees);
});

// @desc    إنشاء موظف جديد
// @route   POST /api/employees
// @access  Private/Admin-HR
const createEmployee = asyncHandler(async (req, res) => {
  let {
    fullName,
    jobTitle,
    department,
    salary,
    idNumber,
    email,
    password,
    phone,
    address,
    emergencyContact
  } = req.body;
  let hashedPassword = await bcrypt.hash(password,10);
  password = hashedPassword;

  const employeeExists = await Employee.findOne({ idNumber });

  if (employeeExists) {
    res.status(400);
    throw new Error('الموظف موجود بالفعل');
  }

  const employee = await Employee.create({
    fullName,
    jobTitle,
    department,
    salary,
    idNumber,
    email,
    password,
    phone,
    address,
    emergencyContact
  });

  if (employee) {
    res.status(201).json(employee);
  } else {
    res.status(400);
    throw new Error('بيانات الموظف غير صالحة');
  }
});


// login for employees 
const loginEmployee = asyncHandler(
  async (req, res)=> {
    try {
      let employee = await Employee.findOne({email: req.body.email});
      if (!employee) res.status(400).json({message: "email or password not correct"});
      let isMatch = await bcrypt.compare(req.body.password, employee.password);
      if(!isMatch) res.status(400).json({message: "email or password not correct"});
      let token = jwt.sign({_id: employee._id, role: "employee"}, process.env.SECRET_KEY);
      res.status(200).json({message: "Login successfully", token: token});
    } catch (error) {
      res.status(400).json({message: error.message});
    }
  }
)




// @desc    الحصول على موظف بواسطة ID
// @route   GET /api/employees/:id
// @access  Private
const getEmployeeById = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    // التحقق من الصلاحيات (الإداري أو HR أو الموظف نفسه)
    if (req.user.role === 'admin' || req.user.role === 'hr' || req.user.employeeId.toString() === req.params.id) {
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
// @access  Private/Admin-HR
const updateEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);

  if (employee) {
    employee.fullName = req.body.fullName || employee.fullName;
    employee.jobTitle = req.body.jobTitle || employee.jobTitle;
    employee.department = req.body.department || employee.department;
    employee.salary = req.body.salary || employee.salary;
    employee.email = req.body.email || employee.email;
    employee.password = req.body.password || employee.password;
    employee.phone = req.body.phone || employee.phone;
    employee.address = req.body.address || employee.address;
    employee.emergencyContact = req.body.emergencyContact || employee.emergencyContact;
    employee.status = req.body.status || employee.status;

    let hashedPassword = await bcrypt.hash(employee.password, 10);
    employee.password = hashedPassword;

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
  let {id} = req.params
  const employee = await Employee.findById(id);

  if (employee) {
    await Employee.findByIdAndDelete(id);
    res.json({ message: 'تم حذف الموظف بنجاح' });
  } else {
    res.status(404);
    throw new Error('الموظف غير موجود');
  }
});

module.exports = {
  getAllEmployees,
  loginEmployee,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
};