const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.replace("Bearer ", '') // come with token

    if(!token) res.status(403).send("Invalid Token"); // if not exist token

    const decodedToken = jwt.verify(token,process.env.SECRET_KEY) // decode token to json

    req.user = decodedToken; // put json data in req.user, "user" can change put will use it in controller

    next(); // mean finish middle ware and success

  } catch (error) {
    console.log(error);
    res.status(400).send("Invalid Token");
  }
}



