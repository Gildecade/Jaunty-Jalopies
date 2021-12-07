const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;


// View Repair
router.post('/view', async (req, res) => {
  const { vin, start_date, isEdit } = req.body;
  let sql;
  // Check whether it is warehoused
  sql = `SELECT vin 
            FROM Vehicle 
            WHERE vin = '${vin}'`;
  try {
    const pool = await database('DEMO').pool();
    let vehicle_vin = await pool.queryAsync(sql);
    if (vehicle_vin.length == 0) {
      res.send({ 'msg': 'No corresponding vehicle' });
      return
    }
    // Check whether it is sold
    sql = `SELECT vin 
              FROM Sale 
              WHERE vin = '${vin}'`;
    let sale_vin = await pool.queryAsync(sql);
    if (sale_vin.length == 0) {
      res.send({ 'msg': 'The vehicle has not been sold' });
      return
    }
    let pre_sql = `SELECT r.vin as vin, r.start_date as start_date, r.complete_date as complete_date, r.odometer as odometer, r.labor_charge as labor_charge, 
                    r.description as description, r.service_writer_username as service_writer_username, r.customer_id as customer_id, 
                    v.model_year as model_year, v.vehicle_type as vehicle_type, v.manufacturer as manufacturer, GROUP_CONCAT(vc.color SEPARATOR ',') as color
                    FROM Repair r 
                    LEFT JOIN Vehicle v
                    ON r.vin = v.vin
                    LEFT JOIN VehicleColor vc
                    ON r.vin = vc.vin
                    WHERE r.vin = '${vin}'`;
    sql = pre_sql + ` GROUP BY r.vin, r.start_date`;

    if (isEdit) {
      sql = pre_sql + `and r.start_date = '${start_date}' GROUP BY r.vin, r.start_date`;
    }
    let result = await pool.queryAsync(sql);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});


// Add repair
router.post('/add', async (req, res) => {
  const { vin, odometer, description, customer_id, USERNAME } = req.body;
  let date = new Date().toLocaleDaDEMOring().replace(/\//g, "-").toString();
  let date_arr = date.split('-');
  if (date_arr[0].length == 1) {
    date_arr[0] = '0' + date_arr[0];
  }
  if (date_arr[1].length == 1) {
    date_arr[1] = '0' + date_arr[1];
  }
  let start_date = date_arr[2] + '-' + date_arr[0] + '-' + date_arr[1];

  if (!customer_id) {
    res.send({ 'msg': "No customer selected or data verification failed" });
    return
  }

  let sql = `SELECT id
              FROM Customer
              WHERE id = '${customer_id}';`;

  try {
    const pool = await database('DEMO').pool();
    const customer_result = await pool.queryAsync(sql);
    if (customer_result.length === 0 || !customer_result[0].id) {
      res.send({ 'msg': 'Customer not found, please add customer first' });
      return
    }

    sql = `SELECT vin 
            FROM Vehicle 
            WHERE vin = '${vin}'`;
    const vin_result = await pool.queryAsync(sql);
    if (vin_result.length === 0 || !vin_result[0].vin) {
      res.send({ 'msg': 'No corresponding vehicle' });
      return
    }

    sql = `SELECT start_date, complete_date 
            FROM Repair 
            where vin = '${vin}'
            ORDER BY start_date DESC
            LIMIT 1`;
    const date_result = await pool.queryAsync(sql);
    if (date_result.length != 0 && date_result[0].start_date) {
      let res_start_date = JSON.stringify(date_result[0].start_date);
      date_arr = res_start_date.substring(1, res_start_date.length - 1).split('-');
      res_start_date = date_arr[0] + '-' + date_arr[1] + '-' + date_arr[2].split("T")[0];
      let res_complete_date = date_result[0].complete_date;
      if (!res_complete_date) {
        res.send({ 'msg': 'This vehicle has an ongoing repair, cannot add repair' });
        return
      }
      if (res_start_date == start_date) {
        res.send({ 'msg': 'This vehicle has a repair today, cannot add repair' });
        return
      }
    }

    sql = `INSERT INTO
            Repair(vin, start_date, odometer, description, service_writer_username, customer_id)
            VALUES('${vin}', '${start_date}', '${odometer}', '${description}', '${USERNAME}', '${customer_id}');`;

    const result = await pool.queryAsync(sql);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});


// Edit repair
router.post('/edit', async (req, res) => {
  const { vin, start_date, USER_TYPE, labor_charge } = req.body;
  let sql = `SELECT labor_charge as old_labor_charge 
                FROM Repair 
                WHERE vin = '${vin}' and start_date = '${start_date}';`;

  try {
    const pool = await database('DEMO').pool();
    const charge_res = await pool.queryAsync(sql);
    let old_labor_charge = 0;
    if (charge_res.length != 0) {
      old_labor_charge = charge_res[0].old_labor_charge;
    }
    sql = `UPDATE Repair
                SET labor_charge = '${labor_charge}'
                WHERE vin = '${vin}' and start_date = '${start_date}';`;
    let result;
    if (USER_TYPE == 'Service Writer') {
      if (old_labor_charge > labor_charge) {
        res.send({ 'msg': 'Labor charges cannot lower than before' });
        return
      }
      result = await pool.queryAsync(sql);
    } else if (USER_TYPE == 'Owner') {
      result = await pool.queryAsync(sql);
    }
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});


// Complete repair
router.post('/complete', async (req, res) => {
  const { vin, start_date } = req.body;
  let date = new Date().toLocaleDaDEMOring().replace(/\//g, "-").toString();
  let date_arr = date.split('-');
  let complete_date = date_arr[2] + '-' + date_arr[0] + '-' + date_arr[1];

  let sql = `SELECT complete_date
              FROM Repair
              WHERE vin = '${vin}' and start_date = '${start_date}';`

  try {
    const pool = await database('DEMO').pool();
    let result = await pool.queryAsync(sql);
    if (result.length != 0 && result[0].complete_date) {
      res.send({ 'msg': 'The repair has been completed' })
      return
    }

    sql = `UPDATE Repair 
            SET complete_date = '${complete_date}'
            WHERE vin = '${vin}' and start_date = '${start_date}';`;

    result = await pool.queryAsync(sql);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});


// Add parts
router.post('/parts', async (req, res) => {
  const { vin, start_date, part_number, quantity, vendor_name, price } = req.body;

  let sql = `SELECT vin 
              FROM Repair
              WHERE vin = '${vin}' and start_date = '${start_date}';`;

  try {
    const pool = await database('DEMO').pool();
    let result = await pool.queryAsync(sql);
    if (result.length == 0) {
      res.send({ 'msg': 'No corresponding repair to add parts' });
      return
    }

    sql = `SELECT part_number
            FROM Part
            WHERE part_number = '${part_number}' and vin = '${vin}' and start_date = '${start_date}';`;
    result = await pool.queryAsync(sql);
    if (result.length != 0 && result[0].part_number) {
      res.send({ 'msg': 'This part number has used, please change a number' });
      return
    }

    sql = `INSERT INTO 
          Part (vin, start_date, part_number, vendor_name, price, quantity)
          VALUES('${vin}', '${start_date}', '${part_number}', '${quantity}', '${vendor_name}', '${price}');`;
    result = await pool.queryAsync(sql);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }

  let total_price = price * quantity;

  try {
    sql = `UPDATE Repair
              SET parts_cost = parts_cost + '${total_price}'
              WHERE vin = '${vin}' and start_date = '${start_date}';`
    const pool = await database('DEMO').pool();
    const result = await pool.queryAsync(sql);
    res.send(result);
  } catch (err) {
    console.log(err);
    res.status(500).send({ error: err });
  }
});

module.exports = router;