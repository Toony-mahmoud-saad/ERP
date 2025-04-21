const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/HR/attendanceController');
const authorize = require('../../middlewar/authorize');

router.post('/checkin', authorize, attendanceController.checkIn);
router.post('/checkout', authorize, attendanceController.checkOut);
router.post('/manual', authorize, attendanceController.manualAttendance);
router.get('/employee/:id', authorize, attendanceController.getEmployeeAttendance);
router.get('/report/monthly', authorize, attendanceController.getMonthlyAttendanceReport);

module.exports = router;