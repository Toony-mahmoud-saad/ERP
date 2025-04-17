const express = require('express');
const router = express.Router();
const employeeController = require('../../controllers/HR/employeeController');
const authorize = require('../../middlewar/authorize');


router.post("/login", employeeController.loginEmployee)

router.route('/')
  .get(authorize, employeeController.getAllEmployees)
  .post(authorize, employeeController.createEmployee);

router.route('/:id')
  .get(authorize, employeeController.getEmployeeById)
  .put(authorize, employeeController.updateEmployee)
  .delete(authorize, employeeController.deleteEmployee);



module.exports = router;