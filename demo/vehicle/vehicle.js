const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * Search vehicle by driver_license_number or tax_id_number
 * Input: vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME
 * Ouput: Vehicle Record
 */
router.post('/search_vehicle', async (req, res) => {
    const { vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME } = req.body;
  
    // if USERNAME is null, then anonymous search
    // else can use vin to search
    let sql;
    if (!USERNAME) {
        if (operand == '>') {
            sql = `SELECT
                        v.vin as vin,
                        v.vehicle_type as vehicle_type,
                        v.model_year as model_year,
                        v.manufacturer as manufacturer,
                        v.model_name as model_name,
                        v.description as description,
                        GROUP_CONCAT(vc.color) as color,
                        v.invoice_price*1.25 as list_price
                    FROM
                        VehicleColor as vc
                        GROUP BY vc.vin
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                    WHERE
                        v.vehicle_type = '${vehicle_type}' 
                        AND vc.color = '${color}' 
                        AND v.manufacturer = '${manufacturer_name}' 
                        AND v.model_year = '${model_year}' 
                        AND v.invoice_price*1.25 > '${list_price}' 
                        AND v.description LIKE "%'${key_word}'%" 
                            AND NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        } 
        else {
            sql = `SELECT
                        v.vin as vin,
                        v.vehicle_type as vehicle_type,
                        v.model_year as model_year,
                        v.manufacturer as manufacturer,
                        v.model_name as model_name,
                        v.description as description,
                        GROUP_CONCAT(vc.color) as color,
                        v.invoice_price*1.25 as list_price
                    FROM
                        VehicleColor as vc
                        GROUP BY vc.vin
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                    WHERE
                        v.vehicle_type = '${vehicle_type}' 
                        AND vc.color = '${color}' 
                        AND v.manufacturer = '${manufacturer_name}' 
                        AND v.model_year = '${model_year}' 
                        AND v.invoice_price*1.25 < '${list_price}' 
                        AND v.description LIKE "%'${key_word}'%" 
                            AND NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        }

        try {
            const pool = await database('TEST').pool();
            let result = await pool.queryAsync(sql);
        
            if (result.length == 0) {
              res.send({'msg': "Sorry, it looks like we don’t have that in stock!"});
        }
        
            res.send(result);
            } 
        catch (err) {
            console.log(err);
            res.status(500).send({ error: err });
        }
    }
    else{
        if (operand == '>') {
            sql = `SELECT
                        v.vin as vin,
                        v.vehicle_type as vehicle_type,
                        v.model_year as model_year,
                        v.manufacturer as manufacturer,
                        v.model_name as model_name,
                        v.description as description,
                        GROUP_CONCAT(vc.color) as color,
                        v.invoice_price*1.25 as list_price
                    FROM
                        VehicleColor as vc
                        GROUP BY vc.vin
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                    WHERE
                        v.vin = '${vin}'
                        v.vehicle_type = '${vehicle_type}' 
                        AND vc.color = '${color}' 
                        AND v.manufacturer = '${manufacturer_name}' 
                        AND v.model_year = '${model_year}' 
                        AND v.invoice_price*1.25 > '${list_price}' 
                        AND v.description LIKE "%'${key_word}'%" 
                            AND NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        } 
        else {
            sql = `SELECT
                        v.vin as vin,
                        v.vehicle_type as vehicle_type,
                        v.model_year as model_year,
                        v.manufacturer as manufacturer,
                        v.model_name as model_name,
                        v.description as description,
                        GROUP_CONCAT(vc.color) as color,
                        v.invoice_price*1.25 as list_price
                    FROM
                        VehicleColor as vc
                        GROUP BY vc.vin
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                    WHERE
                        v.vin = '${vin}'
                        v.vehicle_type = '${vehicle_type}' 
                        AND vc.color = '${color}' 
                        AND v.manufacturer = '${manufacturer_name}' 
                        AND v.model_year = '${model_year}' 
                        AND v.invoice_price*1.25 < '${list_price}' 
                        AND v.description LIKE "%'${key_word}'%" 
                            AND NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        }

        try {
            const pool = await database('TEST').pool();
            let result = await pool.queryAsync(sql);
        
            if (result.length == 0) {
              res.send({'msg': "Sorry, it looks like we don’t have that in stock!"});
        }
        
            res.send(result);
            } 
        catch (err) {
            console.log(err);
            res.status(500).send({ error: err });
        }
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