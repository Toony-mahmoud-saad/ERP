const mongoose = require("mongoose");

const connectToDB = ()=>{
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGO_URI);
    console.log("Connect to MongoDB ✅");
  } catch (error) {
    console.log("Connection to DataBase didn't completed ❌\n because :",error);
  }
}

module.exports = connectToDB;