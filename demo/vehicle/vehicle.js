const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * Search vehicle by driver_license_number or tax_id_number
 * Input: vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME
 * Ouput: Vehicle Record
 */
 router.post('/search', async (req, res) => {
    const { vin, vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME } = req.body;
  
    // if USERNAME is null, then anonymous search
    // else can use vin to search
    let sql;
    let sql_head;
    let sql_tail;
    let sql_vin;
    let sql_vehicle_type;
    let sql_color;
    let sql_manufacturer_name;
    let sql_model_year;
    let sql_list_price;
    let sql_key_word;
    
    sql_head = `SELECT
                v.vin as vin
            FROM
                VehicleColor as vc    
                JOIN Vehicle as v
                ON v.vin = vc.vin 
            WHERE
                1 = 1 `;

    sql_vin = (USERNAME && vin) ? v.vin = `AND v.vin = ${vin} ` : "";
    sql_vehicle_type = vehicle_type ? `AND v.vehicle_type = '${vehicle_type}' `: "";
    sql_color = color ? `AND vc.color = '${color}' `: "";
    sql_manufacturer_name = manufacturer_name ? `AND v.manufacturer = '${manufacturer_name}' `: "";
    sql_model_year = model_year ? `AND v.model_year = '${model_year}' `: "";
    sql_list_price = (list_price && operand) ? `AND v.invoice_price*1.25 ${operand} '${list_price}' `: "";
    sql_key_word = key_word ? `AND v.description LIKE "%'${key_word}'%" `: "";

    sql_tail =     `AND v.vin NOT IN 
                    ( SELECT vin 
                    FROM Sale s )
                ORDER BY vin ASC`;

    sql = sql_head + sql_vin + sql_vehicle_type + sql_color + sql_manufacturer_name 
    + sql_model_year + sql_list_price + sql_key_word + sql_tail;            
      
    
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);
    
        // if no vehicle exists
        if (result.length == 0) {
            res.send({'msg': "Sorry, it looks like we don’t have that in stock!"});
            return;
        }

        const vin_list = result.map(f => f.vin);

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
                    WHERE
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
        const pool = await database('TEST').pool();
        const vehicleRecord = await pool.queryAsync(sql);
        
        // if vechile exsits, cannot be added
        if (vehicleRecord.length != 0) {
            res.send({'msg': "Already exists"});
            return;
        }

        // step 2: insert into Vehicle table and know which vehicle type
        const { description, current_date, model_year, invoice_price, manufacturer_name, color, vehicle_type, USERNAME } = req.body;
        sql = `INSERT INTO Vehicle 
                    ( vin, description, added_Date, model_year, invoice_price, manufacturer, vehicle_type, inventory_clerk_username )
                VALUES
                    ( '${vin}', '${description}', '${current_date}', '${model_year}', '${invoice_price}', '${manufacturer_name}', '${vehicle_type}', '${USERNAME}' );\n`;

        const vehicleInsert = await pool.queryAsync(sql);  
           
        let color_list = color.split(", ");
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
                        VALUES (${vin}, '${number_of_doors}');`;
                break;
            case "convertible":
                const { roof_type, back_seat_count } = req.body;
                sql = `INSERT INTO Convertible
                        VALUES ('${vin}', '${roof_type}', '${back_seat_count}');`;
                break;
            case "truck":
                const { cargo_capacity, number_of_rear_axles } = req.body;
                sql = `INSERT INTO Truck
                        VALUES ('${vin}', '${cargo_capacity}', '${number_of_rear_axles}');`;
                break;
            case "SUV":
                const { number_of_cupholders, drivetrain_type } = req.body;
                sql = `INSERT INTO SUV
                        VALUES ('${vin}', '${number_of_cupholders}', '${drivetrain_type}');`;
                break;
            default:
                const { has_drivers_side_back_door } = req.body;
                sql = `INSERT INTO VanMiniVan
                        VALUES ('${vin}', '${has_drivers_side_back_door}');`;
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


module.exports = router;