const express = require('express');
const router = express.Router();
const attendanceController = require('../../controllers/HR/attendanceController');
const authorize = require('../../middlewar/authorize');

router.post('/checkin/:id', attendanceController.checkIn);
router.post('/checkout/:id', attendanceController.checkOut);
router.get('/employee/:id', authorize, attendanceController.getEmployeeAttendance);
router.get('/report', authorize, attendanceController.getMonthlyAttendanceReport);
router.put('/:id', authorize, attendanceController.updateAttendance);

module.exports = router;