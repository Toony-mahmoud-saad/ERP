const mongoose = require("mongoose");


const userSchema = mongoose.Schema({
  name: {type: String, required: true},

  email: {type: String, required: true, unique: true,
    match: [/.+@.+\..+/, "Please fill a valid email address"]},

  password: {type: String, required: true},

  phoneNumber: {
    type: String,
    required: true,
  },

  dateJoined: {
    type: Date,
    default: Date.now,
  },

  role: {type: String, enum: ["admin", "accountant", "hr", "inventory_keeper"], required: true}
})

module.exports = mongoose.model("userDB", userSchema);
