const userDB = require("../models/user.schema");
const employee = require("../models/HR/Employee")
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const newUser = new userDB(req.body);
      const hashedPssword = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPssword;
      if (newUser.role === "admin") {
        res.status(400).json({ message: "How !, You can't add admin 😷" });
      } else {
        await newUser.save();
        res.status(200).json({ message: "user Created ✅", Data: newUser });
      }
    } else {
      res.status(400).json({ message: "this for admins only" });
    }
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userDB.findOne({ email }) ||  await employee.findOne({ email });
    if (!user)
      res.status(400).json({ message: "email or password not correct" });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      res.status(400).json({ message: "email or password not correct" });
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.SECRET_KEY
    );
    res.status(200).json({ message: "login successfully", token: token });
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  // for admins
  try {
    if (req.user.role === "admin") {
      let users = await userDB.find();
      if (users == null) {
        res.status(200).json({ message: "No users until now" });
      } else {
        res.status(200).json({ Data: users });
      }
    } else {
      res.status(400).json({ message: "this for admins only" });
    }
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({ message: error.message });
  }
};

exports.getUser = async (req, res) => {
  // for admins
  try {
    if (req.user.role === "admin") {
      let { id } = req.params;
      let user = await userDB.findById(id);
      if (user == null || user == undefined) {
        res
          .status(200)
          .json({ Message: "No users with this id, please check the id" });
      } else {
        res.status(200).json({ user: user });
      }
    } else {
      res.status(400).json({ message: "this for admins only" });
    }
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({ message: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    let { id } = req.params;
    let user = await userDB.findById(id);
    if (user == null || user == undefined) {
      res
        .status(200)
        .json({ Message: "No users with this id, please check the id" });
    } else {
      let { name, email, password, phoneNumber } = req.body;
      let hashedPssword = await bcrypt.hash(password, 10);
      password = hashedPssword;
      let userUpdated = await userDB.findByIdAndUpdate(
        id,
        { name, email, password, phoneNumber },
        { new: true }
      );
      res
        .status(200)
        .json({ message: "user updated successfully", Data: userUpdated });
    }
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (req.user.role === "admin") {
      let { id } = req.params;
      let userDeleted = await userDB.findByIdAndDelete(id);
      if (userDeleted == null || userDeleted == undefined) {
        res
          .status(200)
          .json({ Message: "No users with this id, please check the id" });
      } else {
        res
          .status(200)
          .json({ message: "user deleted successfully", Data: userDeleted });
      }
    } else {
      res.status(400).json({ message: "this for admins only" });
    }
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({ message: error.message });
  }
};
