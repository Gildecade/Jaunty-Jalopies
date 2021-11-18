const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * look up customer by driver_license_number or tax_id_number
 * Input: driver_license_number OR tax_id_number
 * Ouput: Customer Record
 */
router.post('/lookup', async (req, res) => {
  const { driver_license_number, tax_id_number } = req.body;
  
  // if driver_license_number is not null, then select from individual table
  // otherwise select from business table
  let sql;
  if (driver_license_number) {
    sql = `SELECT customer_id 
            FROM Individual 
            WHERE driver_license_number = '${driver_license_number}'`;
  } else {
    sql = `SELECT customer_id 
            FROM Business 
            WHERE tax_id_number = '${tax_id_number}'`;
  }
  
  try {
    const pool = await database('TEST').pool();
    let customerId = await pool.queryAsync(sql);

    if (customerId.length == 0) {
      res.send(null);
      return;
    }

    sql = `SELECT id, city, postal_code, state, street_address, phone_number, email 
            FROM Customer 
            WHERE id = ${customerId[0].customer_id}`;
    const result = await pool.queryAsync(sql);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});


/**
 * add customer
 * Input: isIndividual -> bool, isBusiness -> bool, (indicating which category the user is adding)
 *     if isIndividual is true, then first_name, last_name, driver_license_number, customer_id is required
 *     if isBusiness is true, then pirmary_contact_name, pirmary_contact_title, tax_id_number, business_name, customer_id is required
 * Output: 200 ok if no error, otherwise return 500 http code.
 */
router.post('/add', async (req, res) => {
  const { isIndividual, isBusiness } = req.body;
  const { city, postal_code, state, street_address, phone_number, email } = req.body; // common attributes

  // step 1: insert a record in customer table with basic information
  let sql = `INSERT INTO
            Customer(city, postal_code, state, street_address, phone_number, email)
            VALUES('${city}', '${postal_code}', '${state}', '${street_address}', '${phone_number}', '${email}');`;
  
  try {
    const pool = await database('TEST').pool();
    const customerRecord = await pool.queryAsync(sql);
    const { insertId } = customerRecord;  // get the customer_id of newly inserted record

    // step 2: insert into Individual or Business table based on which category user selected in frontend
    if (isIndividual) {
      const { first_name, last_name, driver_license_number } = req.body;
      sql = `INSERT INTO
            Individual(first_name, last_name, driver_license_number, customer_id)
            VALUES('${first_name}', '${last_name}', '${driver_license_number}', ${insertId});`;
    } else if (isBusiness) {
      const { pirmary_contact_name, pirmary_contact_title, tax_id_number, business_name } = req.body;
      sql = `INSERT INTO
            Business(pirmary_contact_name, pirmary_contact_title, tax_id_number, business_name, customer_id)
            VALUES('${pirmary_contact_name}', '${pirmary_contact_title}', '${tax_id_number}', '${business_name}', ${insertId});`;
    }
    const result = await pool.queryAsync(sql);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});

module.exports = router;