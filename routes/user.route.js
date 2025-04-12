const expres= require("express");
const router = expres.Router()
const controller = require("../controllers/user.controller");
const authorize = require("../middlewar/authorize");

//TODO: Rigister will be for admins only 
router.post("/register", authorize, controller.register);

//todo: Login for admins, accontant, HR, Inventory_keeper, employee
router.post("/login", controller.login);



module.exports = router;