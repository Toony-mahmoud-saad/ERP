const express = require('express');
const router = express.Router();
const leaveController = require('../../controllers/HR/leaveController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .get(authorize, leaveController.getAllLeaves)
  .post(leaveController.createLeaveRequest);

router.route('/employee/:id')
  .get(leaveController.getEmployeeLeaves);

router.route('/:id')
  .put(leaveController.updateLeaveRequest)
  .delete(leaveController.deleteLeaveRequest);

router.put('/:id/approve', authorize, leaveController.approveLeaveRequest);

module.exports = router;