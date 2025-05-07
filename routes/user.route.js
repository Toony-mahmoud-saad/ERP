const expres= require("express");
const router = expres.Router()
const controller = require("../controllers/user.controller");
const authorize = require("../middlewar/authorize");

//todo: Rigister will be for admins only 
router.post("/register", authorize, controller.register);

//todo: Login for admins, accontant, HR, Inventory_keeper, employee
router.post("/login", controller.login);

//todo: read all users for admins
router.get("/getAllUsers", authorize, controller.getAllUsers);

//todo: read user by id for admins
router.get("/getUser/:id", authorize, controller.getUser);


//todo: Update by id for all
router.put("/updateProfile/:id", controller.updateProfile);

//todo: Delete by id for all
router.delete("/deleteUser/:id", controller.deleteUser);



module.exports = router;