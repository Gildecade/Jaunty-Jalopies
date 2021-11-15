const express = require('express');

const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// api modules
app.use("/customer", require("./customer/customer"));
app.use("/viewSales", require("./viewSales/viewSales"));
app.use("/vehicle", require("./vehicle/vehicle"));
// ... add more here



// Error handler
app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).send('Internal Serverless Error')
})

app.listen(9000, () => {
  console.log(`Server start on http://localhost:9000`);
})
