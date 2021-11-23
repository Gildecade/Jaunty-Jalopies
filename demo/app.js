const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// api modules
app.use("/", require("./authentication/login"));
app.use("/customer", require("./customer/customer"));
app.use("/viewSales", require("./viewSales/viewSales"));
app.use("/vehicle", require("./vehicle/vehicle"));
app.use("/repair", require("./repair/repair"));
app.use("/viewReport", require("./viewReport/viewReport"));
// ... add more here



// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
})
