//! Libraries
require("dotenv").config();
const express = require("express");

//! Files import
const DataBaseConnect = require("./config/db");
const admin = require("./addAdmin");
const userRoute = require("./routes/user.route");

//! Code to run the App
const app = express();
app.use(express.json());

//! Connect to Mongo Data Base
DataBaseConnect();

//! add the admin
admin();

//! Routers authintecation
app.use("/", userRoute);

//! HR Routes
app.use("/api/employees", require("./routes/HR/employeeRoutes"));
app.use("/api/attendance", require("./routes/HR/attendanceRoutes"));
app.use("/api/leaves", require("./routes/HR/leaveRoutes"));
app.use("/api/payroll", require("./routes/HR/payrollRoutes"));

//! Inventory Routes
app.use("/api/products", require("./routes/Inventory/productRoutes"));
app.use("/api/transactions", require("./routes/Inventory/transactionRoutes"));
app.use("/api/alerts", require("./routes/Inventory/alertRoutes"));
app.use("/api/suppliers", require("./routes/Inventory/supplierRoutes"));

//! Accounting Routes
app.use("/api/invoices", require("./routes/Accounting/invoiceRoutes"));
app.use("/api/transactions", require("./routes/Accounting/transactionRoutes"));
app.use("/api/expenses", require("./routes/Accounting/expenseRoutes"));
app.use("/api/reports", require("./routes/Accounting/reportRoutes"));
app.use("/api/customers", require("./routes/Accounting/customerRoutes"));

//! if router url not exist
app.use((req, res) =>
  res.status(404).json({ Uri: req.originalUrl + " not found" })
);

//! معالجة الأخطاء
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "حدث خطأ في الخادم" });
});

//! تشغيل الخادم
app.listen(process.env.PORT, () =>
  console.log("Hi from App on Port ", process.env.PORT)
);
