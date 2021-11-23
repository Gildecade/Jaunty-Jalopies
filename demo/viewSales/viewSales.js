const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * Input: null
 * Output: report has the following structure: 
 *    { 
 *      Blue: {past30Days: 1, pastYear: 2, allTime: 3},
 *      Yellow: {past30Days: 1, pastYear: 5, allTime: 7},
 *      Green: {past30Days: 3, pastYear: 4, allTime: 5},
 *      Brown: {past30Days: 2, pastYear: 3, allTime: 6},
 *      ................
 *      Multiple: {past30Days: 8, pastYear: 12, allTime: 15}
 *    }
 */
router.post("/byColor", async(req, res) => {
  let sql = `SELECT s.vin as vin, v.color as color, s.purchase_date as purchase_date
              FROM Sale s 
              LEFT OUTER JOIN VehicleColor v
              ON s.vin = v.vin;`;
  try {
    // step 1: get all sold vehicle IDs, their color and purchase_date
    const pool = await database('TEST').pool();
    const soldVins = await pool.queryAsync(sql);

    // get the count of each vins, which are vehicles that have more than one color
    const vinCount = {};
    for (const vin of soldVins) vinCount[vin.vin] ? vinCount[vin.vin] + 1 : 1;

    // step 2: get all colors
    sql = `SELECT color from Color`;
    const colors = await pool.queryAsync(sql);
    const report = {};  // construct result
    for (const color of colors) {
      report[color.color] = { past30Days: 0, pastYear: 0, allTime: 0 };
    }
    report['multiple'] = { past30Days: 0, pastYear: 0, allTime: 0 };

    // step 3: count the number of sold vehicles in term of color and purchase_date
    const currentTimestamp = new Date().getTime();
    for (const vin of soldVins) {
      const timestamp = new Date(vin.purchase_date).getTime();
      const color = vinCount[vin.vin] > 1 ? 'multiple' : vin.color;
      if (!report[color]) continue;

      report[color]["allTime"] += 1;
      if (timestamp >= currentTimestamp - 60 * 60 * 24 * 1000 * 365) {  // within last year
        report[color]["pastYear"] += 1;
      }
      if (timestamp >= currentTimestamp - 60 * 60 * 24 * 1000 * 30) { // within last 30 days
        report[color]["past30Days"] += 1;
      }
    }
    res.send(report);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  } 
});


/**
 * Input: null
 * Output: report has the following structure:
 * {
      car: { past30Days: 0, pastYear: 0, allTime: 0 }, 
      convertible: { past30Days: 0, pastYear: 0, allTime: 0 }, 
      trunk: { past30Days: 0, pastYear: 0, allTime: 0 },
      vanMinivan: { past30Days: 0, pastYear: 0, allTime: 0 },
      suv: { past30Days: 0, pastYear: 0, allTime: 0 }
    }
 */
router.post("/byType", async(req, res) => {
  let sql = `SELECT s.vin as vin, v.vehicle_type as vehicle_type, s.purchase_date as purchase_date
              FROM Sale s 
              LEFT OUTER JOIN Vehicle v
              ON s.vin = v.vin;`;
  try {
    // step 1: get all sold vehicle IDs, their type and purchase_date
    const pool = await database('TEST').pool();
    const soldVins = await pool.queryAsync(sql);

    // step 2: construct report as the following structure
    const report = {
      car: { past30Days: 0, pastYear: 0, allTime: 0 }, 
      convertible: { past30Days: 0, pastYear: 0, allTime: 0 }, 
      truck: { past30Days: 0, pastYear: 0, allTime: 0 },
      vanMinivan: { past30Days: 0, pastYear: 0, allTime: 0 },
      suv: { past30Days: 0, pastYear: 0, allTime: 0 }
    }

    // step 3: count the number of sold vehicles in term of color and purchase_date
    const currentTimestamp = new Date().getTime();
    for (const vin of soldVins) {
      const timestamp = new Date(vin.purchase_date).getTime();
      const type = vin.vehicle_type;
      if (!report[type]) continue;

      report[type]["allTime"] += 1;
      if (timestamp >= currentTimestamp - 60 * 60 * 24 * 1000 * 365) {  // within last year
        report[type]["pastYear"] += 1;
      }
      if (timestamp >= currentTimestamp - 60 * 60 * 24 * 1000 * 30) { // within last 30 days
        report[type]["past30Days"] += 1;
      }
    }
    res.send(report);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  } 
});


/**
 * Input: null
 * Output: report has the following structure:
 * 
 */
router.post("/byManufacturer", async(req, res) => {
  let sql = `SELECT s.vin as vin, v.Manufacturer as manufacturer, s.purchase_date as purchase_date
              FROM Sale s 
              LEFT OUTER JOIN Vehicle v
              ON s.vin = v.vin;`;

  try {
    // step 1: get all sold vehicle IDs, their manufacturer and purchase_date
    const pool = await database('TEST').pool();
    const soldVins = await pool.queryAsync(sql);

    // step 2: construct report based on manufacturer category
    const report = {};
    const currentTimestamp = new Date().getTime();
    for (const vin of soldVins) {
      const timestamp = new Date(vin.purchase_date).getTime();
      const manufacturer = vin.manufacturer;

      report[manufacturer] = { past30Days: 0, pastYear: 0, allTime: 0 };
      report[manufacturer]["allTime"] += 1;
      if (timestamp >= currentTimestamp - 60 * 60 * 24 * 1000 * 365) {  // within last year
        report[manufacturer]["pastYear"] += 1;
      }
      if (timestamp >= currentTimestamp - 60 * 60 * 24 * 1000 * 30) { // within last 30 days
        report[manufacturer]["past30Days"] += 1;
      }
    }
    res.send(report);
  } catch (err) {
    console.log(err);
    res.status(500).send({error: err});
  }
});


module.exports = router;