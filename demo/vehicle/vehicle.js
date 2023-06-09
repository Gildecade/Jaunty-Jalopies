const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * Search vehicle
 * Input: vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME
 * Ouput: Vehicle Record
 */
 router.post('/search', async (req, res) => {
    const { vin, vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME } = req.body;
  
    // if USERNAME is null, then anonymous search
    // else can use vin to search
    let sql_head = `SELECT
                v.vin as vin
            FROM
                VehicleColor as vc    
                JOIN Vehicle as v
                ON v.vin = vc.vin `;

    let sql_vin = (USERNAME && vin) ? `AND v.vin = '${vin}' ` : "";
    let sql_vehicle_type = vehicle_type ? `AND v.vehicle_type = '${vehicle_type}' `: "";
    let sql_color = color ? `AND vc.color = '${color}' `: "";
    let sql_manufacturer_name = manufacturer_name ? `AND v.manufacturer = '${manufacturer_name}' `: "";
    let sql_model_year = model_year ? `AND v.model_year = ${model_year} `: "";
    let sql_list_price = (list_price && operand) ? `AND v.invoice_price*1.25 ${operand} ${list_price} `: "";
    let sql_key_word = key_word ? `AND (v.description LIKE "%${key_word}%" 
    OR v.manufacturer LIKE "%${key_word}%" 
    OR v.model_year LIKE "%${key_word}%" 
    OR v.model_name LIKE "%${key_word}%") `: "";

    let sql_tail =     `AND v.vin NOT IN 
                    ( SELECT vin 
                    FROM Sale s )
                ORDER BY vin ASC`;

    let sql = sql_head + sql_vin + sql_vehicle_type + sql_color + sql_manufacturer_name 
    + sql_model_year + sql_list_price + sql_key_word + sql_tail;            
      
    
    try {
        const pool = await database('DEMO').pool();
        let result = await pool.queryAsync(sql);
    
        // if no vehicle exists
        if (result.length == 0) {
            res.send({'msg': "Sorry, it looks like we don’t have that in stock!"});
            return;
        }

        const vin_list = result.map(f => `"${f.vin}"`);

        let sql2 = `SELECT
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
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                        AND
                        v.vin IN (${vin_list})
                    GROUP BY vc.vin
                    ORDER BY vin ASC`;
        result = await pool.queryAsync(sql2);
        res.send(result);
        return;
    } 
    catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
        return;
    }
});


/**
 * Search vehicle by manager
 * Input: vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME
 * Ouput: Vehicle Record
 */
 router.post('/search_manager', async (req, res) => {
  const { vin, vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME, filter } = req.body;

  // if USERNAME is null, then anonymous search
  // else can use vin to search
  let sql_head = `SELECT
              v.vin as vin
          FROM
              VehicleColor as vc    
              JOIN Vehicle as v
              ON v.vin = vc.vin `;

  let sql_vin = (USERNAME && vin) ? `AND v.vin = '${vin}' ` : "";
  let sql_vehicle_type = vehicle_type ? `AND v.vehicle_type = '${vehicle_type}' `: "";
  let sql_color = color ? `AND vc.color = '${color}' `: "";
  let sql_manufacturer_name = manufacturer_name ? `AND v.manufacturer = '${manufacturer_name}' `: "";
  let sql_model_year = model_year ? `AND v.model_year = ${model_year} `: "";
  let sql_list_price = (list_price && operand) ? `AND v.invoice_price*1.25 ${operand} ${list_price} `: "";
  let sql_key_word = key_word ? `AND (v.description LIKE "%${key_word}%" 
  OR v.manufacturer LIKE "%${key_word}%" 
  OR v.model_year LIKE "%${key_word}%" 
  OR v.model_name LIKE "%${key_word}%") `: "";

  let sql_tail = ``;
  if (filter == "unsold")
  {
    sql_tail = `AND v.vin NOT IN 
    ( SELECT vin 
    FROM Sale s )
    ORDER BY vin ASC`;
  }
  else if (filter == "sold")
  {
    sql_tail = `AND v.vin IN 
    ( SELECT vin 
    FROM Sale s )
    ORDER BY vin ASC`;
  }
  let sql = sql_head + sql_vin + sql_vehicle_type + sql_color + sql_manufacturer_name 
  + sql_model_year + sql_list_price + sql_key_word + sql_tail;            
    
  
  try {
      const pool = await database('DEMO').pool();
      let result = await pool.queryAsync(sql);
  
      // if no vehicle exists
      if (result.length == 0) {
          res.send({'msg': "Sorry, it looks like we don’t have that in stock!"});
          return;
      }

      const vin_list = result.map(f => `"${f.vin}"`);

      let sql2 = `SELECT
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
                      JOIN Vehicle as v
                      ON v.vin = vc.vin 
                      AND
                      v.vin IN (${vin_list})
                  GROUP BY vc.vin
                  ORDER BY vin ASC`;
      result = await pool.queryAsync(sql2);
      res.send(result);
      return;
  } 
  catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
      return;
  }
});


/**
 * add vehicle
 * Input: vin
 *     if vehicle not exists, then description, current_date, model_year, invoice_price, manufacturer_name, color, vehicle_type
 *     if vehicle type == 'Car', then number_of_doors
 *     if vehicle type == 'Convertible', then roof_type, back_seat_count
 *     if vehicle type == 'Truck', then cargo_capacity, number_of_rear_axles
 *     if vehicle type == 'Van/Minivan', then has_drivers_side_door
 *     if vehicle type == 'SUV', then number_of_cup_holders, drivetrain_type
 * Output: 200 ok if no error, otherwise return 500 http code.
 */
 router.post('/add', async (req, res) => {
    const { vin } = req.body;

    // step 1: search vin in vehicle table to check if exists
    let sql = `SELECT vin 
                FROM Vehicle
                WHERE vin = '${vin}'`;
  
    try {
        const pool = await database('DEMO').pool();
        const vehicleRecord = await pool.queryAsync(sql);
        
        // if vechile exsits, cannot be added
        if (vehicleRecord.length != 0) {
            res.send({'msg': "Already exists"});
            return;
        }

        // step 2: insert into Vehicle table and know which vehicle type
        const { description, current_date, model_year, model_name, invoice_price, manufacturer_name, color, vehicle_type, USERNAME } = req.body;
        sql = `INSERT INTO Vehicle 
                    ( vin, description, added_Date, model_year, model_name, invoice_price, manufacturer, vehicle_type, inventory_clerk_username )
                VALUES
                    ( '${vin}', '${description}', '${current_date}', ${model_year}, '${model_name}', ${invoice_price}, '${manufacturer_name}', '${vehicle_type}', '${USERNAME}' );\n`;

        const vehicleInsert = await pool.queryAsync(sql);  
           
        let color_list = color;
        sql = `INSERT INTO VehicleColor( vin, color )
        VALUES
        `;
        // insert all color to VehicleColor table
        for (let i = 0; i < color_list.length; ++i) {
            // last line no comma
            if (i == color_list.length - 1) {
                sql += `( '${vin}', '${color_list[i]}' );`;
            }
            else {
                sql += `( '${vin}', '${color_list[i]}' ),`;
            }
        }
        const colorInsert = await pool.queryAsync(sql);
        
        // insert separate information
        switch (vehicle_type) {
            case "car":
                const { number_of_doors } = req.body;
                sql = `INSERT INTO Car
                        VALUES ('${vin}', ${number_of_doors});`;
                break;
            case "convertible":
                const { roof_type, back_seat_count } = req.body;
                sql = `INSERT INTO Convertible
                        VALUES ('${vin}', '${roof_type}', ${back_seat_count});`;
                break;
            case "truck":
                const { cargo_capacity, cargo_cover_type, number_of_rear_axles } = req.body;
                sql = cargo_cover_type? `INSERT INTO Truck
                VALUES ('${vin}', ${cargo_capacity}, '${cargo_cover_type}', ${number_of_rear_axles});`: 
                `INSERT INTO Truck(vin, cargo_capacity, number_of_rear_axles)
                VALUES ('${vin}', ${cargo_capacity}, ${number_of_rear_axles});`;
                break;
            case "suv":
                const { number_of_cupholders, drivetrain_type } = req.body;
                sql = `INSERT INTO Suv
                        VALUES ('${vin}', ${number_of_cupholders}, '${drivetrain_type}');`;
                break;
            default:
                const { has_drivers_side_back_door } = req.body;
                sql = `INSERT INTO VanMinivan
                        VALUES ('${vin}', ${has_drivers_side_back_door});`;
                break;
        }
        
        let add_result = await pool.queryAsync(sql);
        res.send(add_result);
        return;
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
        return;
    }
});

/**
 * view details of a vehicle
 * Input: vin, usertype
 * Ouput: 
 *    if usertype == null (Anonymous): 
 *      show VIN, vehicle_type, vehicle type attributes, Model Year, Model Name, Manufacturer, color(s), list price, description;
 *    if usertype == 'Inventory Clerks':
 *      show all above, and invoice_price;
 *    if usertype == 'Salespeople':
 *      same as 'Inventory Clerks'
 *    if usertype == 'Service Writer':
 *      same as 'Inventory Clerks'
 *    if usertype == 'Manager':
 *      all information: inventory_clerk_name, invoice_price, added_date,
 *      if vehicle is sold, also need to fetch data from Sales table
 *      if vehicle has any repair, also need to fetch data from Repair table
 *    if usertype == 'Owner':
 *      same as 'Manager'
 */
//  router.post('/view', async (req, res) => {
//     const { vin, vehicle_type, usertype } = req.body;
  
//     let type;
//     if (vehicle_type == 'car') type = 'Car';
//     else if (vehicle_type == 'convertible') type = 'Convertible';
//     else if (vehicle_type == 'suv') type = 'Suv';
//     else if (vehicle_type == 'truck') type = 'Truck';
//     else if (vehicle_type == 'vanMinivan') type = 'VanMinivan';
//     else {
//       res.status(400).send({msg: 'Bad parameter'});
//       return;
//     }
//     let sql = `SELECT * FROM ${type} WHERE vin = '${vin}'`;
    
//     try {
//       const pool = await database('DEMO').pool();
//       const vehicleTypeData = await pool.queryAsync(sql);
  
//       if (!usertype || usertype == 'Inventory Clerks' || usertype == 'Salespeople' || usertype == 'Service Writer') {
//         res.send({ vehicleTypeData });
//       } else {  // if usertype is Manager or Owner, we still need to find information about Sales and Repair
//         sql = `SELECT * FROM Sale WHERE vin = '${vin}'`;
//         const saleData = await pool.queryAsync(sql);
  
//         sql = `SELECT * FROM Repair WHERE vin = '${vin}'`;
//         const repairData = await pool.queryAsync(sql);
  
//         res.send({ vehicleTypeData, saleData, repairData });
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).send({error: err});
//     }
//   });

  
/**
 * Get Vehicle by vin
 */
router.post('/id', async (req, res) => {
  const { vin, vehicle_type } = req.body;
    
  let type;
  if (vehicle_type == 'car') type = 'Car';
  else if (vehicle_type == 'convertible') type = 'Convertible';
  else if (vehicle_type == 'suv') type = 'Suv';
  else if (vehicle_type == 'truck') type = 'Truck';
  else if (vehicle_type == 'vanMinivan') type = 'VanMinivan';


  let sql = `SELECT * FROM Vehicle WHERE vin = '${vin}'`;
  try {
    const pool = await database('DEMO').pool();
    const vehicle = await pool.queryAsync(sql);

    sql = `SELECT * FROM ${type} WHERE vin = '${vin}'`;
    const typeInfo = await pool.queryAsync(sql);

    res.send({ vehicle, typeInfo });
  } catch(err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});

/**
 * Get sale information by vin
 */
 router.post('/sale', async (req, res) => {
  const { vin } = req.body;

  const sql = `SELECT * FROM Sale WHERE vin = '${vin}'`;
  try {
    const pool = await database('DEMO').pool();
    const sale = await pool.queryAsync(sql);
    res.send(sale);
  } catch(err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});


/**
 * Get Repair information by vin
 */
 router.post('/repair', async (req, res) => {
  const { vin } = req.body;

  const sql = `SELECT * FROM Repair WHERE vin = '${vin}'`;
  try {
    const pool = await database('DEMO').pool();
    const repair = await pool.queryAsync(sql);
    res.send(repair);
  } catch(err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});


/**
 * view all colors in DB
 * Input: NULL
 * Ouput: 
 *    all colors
 */
 router.post('/get_colors', async (req, res) => {
    let sql = `SELECT * FROM Color`;
    
    try {
        const pool = await database('DEMO').pool();
        const color_result = await pool.queryAsync(sql);
        res.send(color_result);
    } catch (err) {
      console.log(err);
      res.status(500).send({error: err});
    }
  });
  
/**
 * view all manufacturers in DB
 * Input: NULL
 * Ouput: 
 *    all manufacturers
 */
 router.post('/get_manufacturers', async (req, res) => {
    let sql = `SELECT * FROM Manufacturer`;
    
    try {
        const pool = await database('DEMO').pool();
        const manufacturer_result = await pool.queryAsync(sql);
        res.send(manufacturer_result);
    } catch (err) {
      console.log(err);
      res.status(500).send({error: err});
    }
  });
  
/**
 * Insert manufacturer into DB
 * Input: manufacturer
 * Ouput: 
 *    200 ok if no error, otherwise return 500 http code.
 */
 router.post('/add_manufacturer', async (req, res) => {
    const { manufacturer } = req.body;
    let sql = `Insert INTO Manufacturer
    VALUES ('${manufacturer}')`;
    
    try {
        const pool = await database('DEMO').pool();
        const add_manufacturer_result = await pool.queryAsync(sql);
        res.send(add_manufacturer_result);
    } catch (err) {
      console.log(err);
      res.status(500).send({error: err});
    }
  });


  /**
 * Sell vehicles and insert sale records into DB
 * Input: manufacturer
 * Ouput: 
 *    200 ok if no error, otherwise return 500 http code.
 */
 router.post('/sell', async (req, res) => {
  const { vin } = req.body;
  let sql = `Select vin 
  From Sale
  WHERE vin = '${vin}'`;
  
  try {
      const pool = await database('DEMO').pool();
      const vin_result = await pool.queryAsync(sql);

      if (vin_result.length != 0) {
        res.send({'msg': "Sorry, it has already been sold!"});
        return;
      }
      const { USERNAME, customer_id, current_date, sold_price } = req.body;
      sql = `INSERT INTO Sale (vin, salespeople_username, customer_id, purchase_date, sold_price)
      VALUES ('${vin}', '${USERNAME}', ${customer_id}, '${current_date}', ${sold_price})`;
      const sale_result = await pool.queryAsync(sql);
      res.send(sale_result);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});

/**
 * get vehicle invoice_price to initialize sell vehicle
 * Input: vin
 * Ouput: invoice_price
 */
 router.post('/get_price', async (req, res) => {

  const { vin } = req.body;
  let sql = `SELECT invoice_price, added_date 
  From Vehicle
  WHERE vin = '${vin}'`;
  
  try {
      const pool = await database('DEMO').pool();
      const price_result = await pool.queryAsync(sql);
      res.send(price_result);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});

/**
 * view all customers ID in DB
 * Input: NULL
 * Ouput: 
 *    all customers ID
 */
 router.post('/get_customers', async (req, res) => {
  let sql = `SELECT id FROM Customer`;
  
  try {
      const pool = await database('DEMO').pool();
      const customer_result = await pool.queryAsync(sql);
      res.send(customer_result);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});

/**
 * view the number of all vehicles
 * Input: NULL
 * Ouput: 
 *    sum of vehicles
 */
 router.post('/get_vehicle_number', async (req, res) => {
  let sql = `SELECT
                count(1)
              AS vehicle_sum
              FROM
                Vehicle as v
              WHERE
                v.vin NOT IN (
                  SELECT
                    vin
                  FROM
                    Sale s
                )`;
  
  try {
      const pool = await database('DEMO').pool();
      const vehicle_number = await pool.queryAsync(sql);
      res.send(vehicle_number);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});

module.exports = router;