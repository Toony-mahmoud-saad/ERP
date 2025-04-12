const userDB = require("../models/user.schema");
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")

exports.register = async (req , res) => {
  try {
    if(user.req.role === "admin"){
      const newUser = new userDB(req.body);
      const hashedPssword = await bcrypt.hash(newUser.password, 10);
      newUser.password = hashedPssword;
      if (newUser.role === "admin") {
        res.status(400).json({message: "How !, You can't add admin 😷"})
      } else {
        await newUser.save();
        res.status(200).json({message: "user Created ✅", Data: newUser});
      }
    }else{
      res.status(400).json({message: "this for admins only"})
    }
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({message: error.message});
  }
}


exports.login = async (req , res) => {
  try {
    const user = await userDB.findOne({email: req.email});
    if(!user) res.status(400).json({message: "email or password not correct"});
    const isMatch = bcrypt.compare(password, user.password);
    if(!isMatch) res.status(400).json({message: "email or password not correct"});
    const token = jwt.sign({_id: user._id, name: user.name, role: user.role },process.env.SECRET_KEY);
    res.status(200).json({message: "login successfully", token: token})
  } catch (error) {
    console.log("Exist error 💢 : ", error);
    res.status(400).json({message: error.message});
  }
}

