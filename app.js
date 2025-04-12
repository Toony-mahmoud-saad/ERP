//! Libraries
require("dotenv").config();
const express = require("express");

//! Files import
const DataBaseConnect = require("./config/db");
const admin = require("./addAdmin");
const userRoute = require("./routes/user.route")

//! Code to run the App
const app = express();
app.use(express.json());

//! Connect to Mongo Data Base
DataBaseConnect();

//! add the admin
admin();

//! Routers
app.use("/",userRoute)

//! if router url not exist
app.use((req , res)=> res.status(400).json({Uri: req.originalUrl + " not found"}));

app.listen(process.env.PORT, ()=> console.log("Hi from App on Port ",process.env.PORT));
