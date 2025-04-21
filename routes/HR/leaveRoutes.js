const express = require('express');
const router = express.Router();
const leaveController = require('../../controllers/HR/leaveController');
const authorize = require('../../middlewar/authorize');

router.route('/')
  .post(authorize, leaveController.createLeaveRequest)
  .get(authorize, leaveController.getAllLeaves);

router.route('/:id')
  .put(authorize, leaveController.updateLeaveRequest)
  .delete(authorize, leaveController.deleteLeaveRequest);

router.put('/:id/approve', authorize, leaveController.approveLeaveRequest);
router.get('/employee/:id', authorize, leaveController.getEmployeeLeaves);

module.exports = router;