const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;


// View Repair
router.post('/view', async (req, res) => {
    const { vin } = req.body;
    let sql;
    // Check whether it is warehoused
    sql = `SELECT vin 
            FROM Vehicle 
            WHERE vin = '${vin}'`; 
    try {
      const pool = await database('TEST').pool();
      let vehicle_vin = await pool.queryAsync(sql);
      if (vehicle_vin.length == 0) {
        res.send({'msg': 'No corresponding vehicle'});
        return
      }
      // Check whether it is sold
      sql = `SELECT vin 
              FROM Sale 
              WHERE vin = '${vin}'`; 
      let sale_vin = await pool.queryAsync(sql);
      if (sale_vin.length == 0) {
        res.send({'msg': 'The vehicle has not been sold'});
        return
      }
      sql = `SELECT r.vin, r.start_date, r.complete_date, r.odometer, r.labor_charge, r.description, r.service_writer_username, r.customer_id, 
              v.model_year, v.vehicle_type, v.manufacturer, vc.color
              FROM Repair r 
              LEFT JOIN Vehicle v
              ON r.vin = v.vin
              LEFT JOIN VehicleColor vc
              ON r.vin = vc.vin
              WHERE r.vin = '${vin}'`; 
      const result = await pool.queryAsync(sql);
      res.send({
        'msg': "success",
        'res': result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }
  });


  // Add repair
  router.post('/add', async (req, res) => {
    const { vin, odometer, description, customer_id, USERNAME } = req.body;
    const { start_date } = new Date().toLocaleDateString().replace(/\//g,"-");
  
    if (!customer_id) {
      res.send({'msg': "No customer selected or data verification failed"});
      return
    }
    
    let sql = `INSERT INTO
              Repair(vin, start_date, odometer, description, service_writer_username, customer_id)
              VALUES('${vin}', '${start_date}', '${odometer}', '${description}', '${USERNAME}', '${customer_id}');`;
    
    try {
      const pool = await database('TEST').pool();
      const result = await pool.queryAsync(sql);
      res.send({
        'msg': 'success',
        'res': result,
      });
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
      const pool = await database('TEST').pool();
      const old_labor_charge = await pool.queryAsync(sql);
      sql = `UPDATE Repair
                SET labor_charge = '${labor_charge}'
                WHERE vin = '${vin}' and start_date = '${start_date}';`;
      const result;
      if (USER_TYPE == 'Service writer') {
        if (old_labor_charge > labor_charge) {
          res.send({'msg': 'Labor charges cannot lower than before'});
          return
        }
        result = await pool.queryAsync(sql);
      } else if (USER_TYPE == 'Owner') {
        result = await pool.queryAsync(sql);
      }
      res.send({
        'msg': 'success',
        'res': result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }
  });


  // Complete repair
  router.post('/complete', async (req, res) => {
    const { vin, start_date } = req.body;
    const { complete_date } = new Date().toLocaleDateString().replace(/\//g,"-");
    
    let sql = `UPDATE Repair 
                SET complete_date = '${complete_date}'
                WHERE vin = '${vin}' and start_date = '${start_date}';`;
    
    try {
      const pool = await database('TEST').pool();
      const result = await pool.queryAsync(sql);
      res.send({
        'msg': 'success',
        'res': result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }
  });


  // Add parts
  router.post('/parts', async (req, res) => {
    const { vin, start_date, part_number, quantity, vendor_name, price } = req.body;
    
    let sql = `INSERT INTO 
                Part (vin, start_date, part_number, vendor_name, price, quantity)
                VALUES('${vin}', '${start_date}', '${part_number}', '${quantity}', '${vendor_name}', '${price}');`;
    
    try {
      const pool = await database('TEST').pool();
      const result = await pool.queryAsync(sql);
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }

    try {
      sql = `UPDATE Repair
              SET labor_charge = labor_charge + '${price}'
              WHERE vin = '${vin}' and start_date = '${start_date}';`
      const pool = await database('TEST').pool();
      const result = await pool.queryAsync(sql);
      res.send({
        'msg': 'success',
        'res': result,
      });
    } catch (err) {
      console.log(err);
      res.status(500).send({ error: err });
    }
  });
  
  module.exports = router;