const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcrypt');

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Connection error:', err));

//! User model
const User = require('./models/user.schema');

// Admin data
let adminData = {
  name: 'admin',
  email: 'admin@erp.com',
  phoneNumber: "1234567890",
  password: 'Admin@123', // This will be hashed
  role: 'admin'
};

// Function to create admin user
const createAdmin = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminData.email });
    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin);
      process.exit(0);
    }

    // Create new admin
    const admin = new User(adminData);
    hashedPassword = await bcrypt.hash(admin.password,10);
    admin.password = hashedPassword;
    await admin.save();

    console.log('Admin user created successfully:', {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    });

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin user:', error);
    process.exit(1);
  }
};

// Run the script
createAdmin();


//! how run  

// node addAdmin.js








