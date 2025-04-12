//! Libraries
require("dotenv").config();
const express = require("express");

//! Files import
const DataBaseConnect = require("./config/db");

//! Code to run the App
const app = express();
app.use(express.json());

//! Connect to Mongo Data Base
DataBaseConnect();





app.listen(process.env.PORT, ()=> console.log("Hi from App on Port ",process.env.PORT));
