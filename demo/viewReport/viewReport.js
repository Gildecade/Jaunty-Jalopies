const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

// TODO: view gross customer income
router.post("/grossCustomerIncome", async(req, res) => {
    let sql = ` 
    SELECT
    t8.customer_id,
    concat(ifnull(t6.business_name,""), ifnull( t5.first_name,""), " ", ifnull(t5.last_name,"")) as customer_name,
    sum(income) as gross_income,
    min(date) as first_date,
    max(date) as recent_date
    FROM ((SELECT
    t2.id as customer_id,
    t1.purchase_date as date,
    t1.sold_price as income
    FROM Sale as t1
    LEFT JOIN Customer as t2
    ON t1.customer_id = t2.id) 
    union all
    (SELECT
    t4.id as customer_id,
    t3.start_date as date,
    t3.labor_charge+t3.parts_cost as income
    FROM Repair as t3
    LEFT JOIN Customer as t4
    ON t3.customer_id = t4.id
    )) t8
    LEFT JOIN Individual t5 
    ON t8.customer_id = t5.customer_id
    LEFT JOIN Business t6
    ON t8.customer_id = t6.customer_id
    GROUP BY customer_id
    ORDER BY gross_income DESC, recent_date DESC
    LIMIT 15;`;

    try {
        const pool = await database('TEST').pool();
        let gross_customer_income = await pool.queryAsync(sql);
        if(gross_customer_income.length==0){
            res.send(null);
            return;
        }
        const customer_id_list = gross_customer_income.map(f => f.customer_id);
        
        sql = 
        `SELECT customer_id,
        count(1) as number_of_repairs
        FROM Repair
        GROUP BY customer_id
        HAVING customer_id
        IN (${customer_id_list});`;
        let customer_repair = await pool.queryAsync(sql);
        let repair_dic = {};
        customer_repair.forEach(element => {
          repair_dic[element.customer_id] = element.number_of_repairs
        });

        sql = 
        `SELECT customer_id,
        count(1) as number_of_sales
        FROM Sale
        GROUP BY customer_id
        HAVING customer_id
        IN (${customer_id_list});`;
        let customer_sale = await pool.queryAsync(sql);
        let sale_dic = {};
        customer_sale.forEach(element => {
          sale_dic[element.customer_id] = element.number_of_sales
        });
        
        gross_customer_income.forEach(function(element){
          element.number_of_repairs=repair_dic[element.customer_id];
          element.number_of_sales=sale_dic[element.customer_id];
        });

        res.send(gross_customer_income);
        return;
        
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view gross customer income more details -- vehicle sale 
router.post("/grossCustomerIncome/sales", async(req, res) => {
    const {customer_id} = req.body;
    let sql = `SELECT t1.purchase_date as sale_date,
    t1.sold_price as sold_price, t1.vin as VIN,
    t2.model_year as year,
    t2.manufacturer as manufacturer,
    t2.model_name as model,
    concat(t3.first_name, " ", t3.last_name) as salesperson_name
    FROM Sale as t1
    INNER JOIN Vehicle t2
    ON t1.VIN = t2.VIN
    INNER JOIN User t3
    ON t1.salespeople_username = t3.username
    WHERE t1.customer_id = '${customer_id}'
    ORDER BY sale_date DESC, VIN ASC`;

    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);
        
        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view gross customer income more details -- vehicle repairs
router.post("/grossCustomerIncome/repairs", async(req, res) => {
    const {customer_id} = req.body;
    let sql = `SELECT t1.start_date as start_date,
    t1.complete_date as end_date,
    t1.vin as VIN,
    t1.odometer as odometer_reading,
    t1.parts_cost as parts_cost,
    t1.labor_charge as larbor_cost,
    t1.parts_cost + t1.labor_charge as total_cost,
    concat(t2.first_name, " ", t2.last_name) as service_writer_name
    FROM Repair t1
    INNER JOIN User t2
    ON t1.service_writer_username = t2.username
    WHERE t1.customer_id = '${customer_id}'
    ORDER BY start_date DESC, end_date, VIN ASC;`;

    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);
        
        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view repair report
router.post("/repairReport", async(req, res) => {
    let sql = `SELECT 
    t3.name as manufacturer,
    count(t1.labor_charge) as count_of_repairs,
    sum(t1.parts_cost) as sum_parts_cost,
    sum(t1.labor_charge) as sum_labor_cost,
    sum(t1.parts_cost)+sum(t1.labor_charge) as sum_repair_cost
    FROM Manufacturer t3 
    LEFT JOIN (Vehicle t2
    INNER JOIN Repair t1
    ON t2.vin = t1.vin)
    ON t3.name = t2.manufacturer
    GROUP BY t3.name
    ORDER BY t3.name ASC;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);
        
        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view repair report -- the repair stats of vehicle type of selected manufacturer
router.post("/repairReport/type", async(req, res) => {
    const {manufacturer} = req.body; 
    let sql = `SELECT t2.vehicle_type as vehicle_type,
    count(1) as number_of_repairs,
    sum(t1.parts_cost) as parts_cost,
    sum(t1.labor_charge) as labor_cost,
    sum(t1.parts_cost)+sum(t1.labor_charge) as total_cost
    FROM Repair t1
    INNER JOIN Vehicle t2
    ON t1.vin = t2.vin
    WHERE t2.manufacturer = '${manufacturer}'
    GROUP BY vehicle_type
    ORDER BY number_of_repairs DESC;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view repair report -- the repair stats of model of selected manufacturer
router.post("/repairReport/model", async(req, res) => {
    const {manufacturer} = req.body; 
    let sql = `SELECT t2.vehicle_type as vehicle_type,
    t2.model_name as model,
    count(1) as number_of_repairs,
    sum(t1.parts_cost) as parts_cost,
    sum(t1.labor_charge) as labor_cost,
    sum(t1.parts_cost)+sum(t1.labor_charge) as total_cost
    FROM Repair t1
    INNER JOIN Vehicle t2
    ON t1.vin = t2.vin
    WHERE t2.manufacturer = '${manufacturer}'
    GROUP BY vehicle_type, model
    ORDER BY number_of_repairs DESC;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view below cost sales
router.post("/belowCostSale", async(req, res) => {
    let sql = `SELECT t1.vin as VIN,
    t2.purchase_date as date,
    t1.invoice_price as invoice_price,
    t2.sold_price as sold_price,
    CONCAT(ROUND(t2.sold_price/t1.invoice_price*100,2),'%') as price_ratio,
    concat(ifnull(t6.business_name,""), ifnull( t5.first_name,""), " ", ifnull(t5.last_name,"")) as customer_name,
    concat(t3.first_name, " ", t3.last_name) as salesperson_name
    FROM Vehicle t1
    INNER JOIN Sale t2
    ON t1.vin = t2.vin and t1.invoice_price > t2.sold_price
    INNER JOIN User t3
    ON t2.salespeople_username = t3.username
    INNER JOIN Customer t4
    ON t2.customer_id = t4.id
    LEFT JOIN Individual t5
    ON t4.id = t5.customer_id
    LEFT JOIN Business t6
    ON t4.id = t6.customer_id
    ORDER BY date DESC, price_ratio DESC;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view average time in inventory
router.post("/averageTime", async(req, res) => {
    let sql = `SELECT t1.vehicle_type as vehicle_type,
    avg(datediff(t2.purchase_date, t1.added_date))+1 as average_time
    FROM Vehicle t1
    INNER JOIN Sale t2
    ON t1.vin = t2.vin
    GROUP BY vehicle_type;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view parts statistics
router.post("/partStatistics", async(req, res) => {
    let sql = `SELECT vendor_name, sum(quantity) as number_of_parts, sum(price*quantity) as total_spent
    FROM Part
    GROUP BY vendor_name;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});


// view monthly sales
router.post("/monthlySales", async(req, res) => {
    let sql = `SELECT year(t1.purchase_date) as year,
    month(t1.purchase_date) as month,
    count(1) as number_of_vehicles,
    sum(t1.sold_price) as total_sales_income,
    sum(t1.sold_price-t2.invoice_price) as total_net_income,
    CONCAT(ROUND(sum(t1.sold_price)/sum(t2.invoice_price)*100,2),'%') as price_ratio
    FROM Sale t1
    INNER JOIN Vehicle t2
    ON t1.vin = t2.vin
    GROUP BY year, month
    ORDER BY year DESC, month DESC;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

// view monthly sales of selected month
router.post("/monthlySales/details", async(req, res) => {
    const {year, month} =req.body;
    let sql = 
    `SELECT concat(t2.first_name, " ", t2.last_name) as name,
    count(1) as vehicles_sold,
    sum(t1.sold_price) as total_sales
    FROM Sale t1
    INNER JOIN User t2
    ON t1.salespeople_username = t2.username
    WHERE year(t1.purchase_date) = '${year}' and month(t1.purchase_date) = '${month}'
    GROUP BY t1.salespeople_username
    ORDER BY vehicles_sold DESC, total_sales DESC
    LIMIT 1;`;
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);

        res.send(result.length==0 ? null : result);
        return;
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

module.exports = router;