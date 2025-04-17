const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("./models/user.schema"); // Adjust path as needed
const dotenv = require("dotenv");
dotenv.config();

const addAdmin = async () => {
  try {
    const adminData = {
      name: "admin",
      email: "admin@erp.com",
      password: "admin123",
      phoneNumber: "1234567890",
      role: "admin",
    };

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      // create token
      const token = jwt.sign(
      { _id: existingAdmin._id, name: existingAdmin.name, role: existingAdmin.role },
      process.env.SECRET_KEY
      );
      console.log("Admin already exists, and his token\n"+token);
      return;
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Create the admin user
    const admin = new User({
      ...adminData,
      password: hashedPassword,
    });

    await admin.save();

    // create token
    const token = jwt.sign(
      { _id: admin._id, name: admin.name, role: admin.role },
      process.env.SECRET_KEY
    );

    console.log("Admin user created successfully.");
    console.log("token: ", token);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
};

module.exports = addAdmin;
