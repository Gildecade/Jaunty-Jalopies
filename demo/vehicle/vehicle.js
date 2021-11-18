const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * Search vehicle by driver_license_number or tax_id_number
 * Input: vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME
 * Ouput: Vehicle Record
 */
router.post('/search', async (req, res) => {
    const { vehicle_type, color, manufacturer_name, model_year, list_price, operand, key_word, USERNAME } = req.body;
  
    // if USERNAME is null, then anonymous search
    // else can use vin to search
    let sql;
    if (!USERNAME) {
        if (operand == '>') {
            sql = `SELECT
                        v.vin as vin
                    FROM
                        VehicleColor as vc    
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                    WHERE
                        v.vehicle_type = '${vehicle_type}' 
                        AND vc.color = '${color}' 
                        AND v.manufacturer = '${manufacturer_name}' 
                        AND v.model_year = '${model_year}' 
                        AND v.invoice_price*1.25 > '${list_price}' 
                        AND v.description LIKE "%'${key_word}'%" 
                            AND v.vin NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        } 
        else {
            sql = `SELECT
                        v.vin as vin
                    FROM
                        VehicleColor as vc
                        JOIN Vehicle as v
                        ON v.vin = vc.vin 
                    WHERE
                        v.vehicle_type = '${vehicle_type}' 
                        AND vc.color = '${color}' 
                        AND v.manufacturer = '${manufacturer_name}' 
                        AND v.model_year = '${model_year}' 
                        AND v.invoice_price*1.25 < '${list_price}' 
                        AND v.description LIKE "%'${key_word}'%" 
                            AND v.vin NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        }
    }
    else{
        if (operand == '>') {
            sql = `SELECT
                        v.vin as vin
                    FROM
                        VehicleColor as vc    
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
                            AND v.vin NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        } 
        else {
            sql = `SELECT
                        v.vin as vin
                    FROM
                        VehicleColor as vc    
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
                            AND v.vin NOT IN 
                        ( SELECT vin 
                        FROM Sale s )
                    ORDER BY vin ASC`;
        }
    }
    
    try {
        const pool = await database('TEST').pool();
        let result = await pool.queryAsync(sql);
    
        // if no vehicle exists
        if (result.length == 0) {
            res.send({'msg': "Sorry, it looks like we don’t have that in stock!"});
        }

        var vin_list = new Array();
        for (var i = 0; i <= result.length(); ++i) {
            vin_list[i] = result[i].vin;
        }

        let sql = `SELECT
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
                        v.vin IN '${vin_list}'
                    GROUP BY vc.vin
                    ORDER BY vin ASC`;
        let result = await pool.queryAsync(sql);
        res.send(result);
    } 
    catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
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
            return
        }

        // step 2: insert into Individual or Business table based on which category user selected in frontend
        const { description, current_date, model_year, invoice_price, manufacturer_name, color, vehicle_type } = req.body;
        sql = `INSERT INTO Vehicle 
                    ( vin, description, added_Date, model_year, invoice_price, manufacturer, vehicle_type )
                VALUES
                    ( '${vin}', '${description}', '${current_date}', '${model_year}', '${invoice_price}', '${manufacturer_name}', '${vehicle_type}' )`;
        const result = await pool.queryAsync(sql);

        // insert all color to VehicleColor table
        color.forEach(element => {
            sql = `INSERT INTO VehicleColor
                VALUES ( '${VIN}', '${element}' )`;
            colorResult = await pool.queryAsync(sql);
        });
        
        // insert separate information
        switch (vehicle_type) {
            case "Car":
                const { number_of_doors } = req.body;
                sql = `INSERT INTO Car
                        VALUES ('${vin}', '${number_of_doors}')`;
                break;
            case "Convertible":
                const { roof_type, back_seat_count } = req.body;
                sql = `INSERT INTO Convertible
                        VALUES ('${vin}', '${roof_type}', '${back_seat_count}')`;
                break;
            case "Truck":
                const { cargo_capacity, number_of_rear_axles } = req.body;
                sql = `INSERT INTO Truck
                        VALUES ('${vin}', '${cargo_capacity}', '${number_of_rear_axles}')`;
                break;
            case "SUV":
                const { number_of_cupholders, drivetrain_type } = req.body;
                sql = `INSERT INTO SUV
                        VALUES ('${vin}', '${number_of_cupholders}', '${drivetrain_type}')`;
                break;
            default:
                const { has_drivers_side_back_door } = req.body;
                sql = `INSERT INTO VanMiniVan
                        VALUES ('${vin}', '${has_drivers_side_back_door}')`;
                break;
        }
        
        let add_result = await pool.queryAsync(sql);
        res.send(add_result);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
    }
});



/**
 * view vehicle details
 * Input: vin, vehicle_type from Search Vehicle Task
 *     depending on USERNAME and vehicle_type, display different information, use two switch clause
 * Output: 200 ok if no error, otherwise return 500 http code.
 */
 router.post('/view', async (req, res) => {
    const { vin, vehicle_type, USERNAME } = req.body;

    // display different information to different user
    switch (USERNAME) {
        case 'Inventory Clerk':
            switch (vehicle_type) {
                case 'car':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.number_of_doors as number_of_doors,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin
                                WHERE
                                    v.vin = '${vin}'`;
                    break;
                case 'convertible':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.roof_type as roof_type,
                                    c.back_seat_count as back_seat_count,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Convertible as c ON v.vin = c.vin                
                                WHERE vin = '${vin}'`;
                    break;
                case 'truck':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.cargo_capacity as cargo_capacity,
                                    c.cargo_cover_type as cargo_cover_type,
                                    c.number_of_rear_axles as number_of_rear_axles,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Truck as c ON v.vin = c.vin                
                                WHERE vin = '${vin}'`;
                    break;
                case 'vanMinivan':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.has_drivers_side_back_door as has_drivers_side_back_door,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN VanMinivan as c ON v.vin = c.vin                
                                WHERE vin = '${vin}'`;
                    break;
                default:  // SUV
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.drivetrain_type as drivetrain_type,
                                    c.number_of _cupholders as number_of _cupholders,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                
                                WHERE vin = '${vin}'`
                    break;
            }
            break;
        case 'Manager':
            switch (vehicle_type) {
                case 'car':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.number_of_doors as number_of_doors,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.inventory_clerk_username as inventory_clerk_username,
                                    v.invoice_price as invoice_price,
                                    v.added_date as added_date
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                               
                                WHERE vin = '${vin}'`
                    break;
                case 'covertible':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.roof_type as roof_type,
                                    c.back_seat_count as back_seat_count,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.inventory_clerk_username as inventory_clerk_username,
                                    v.invoice_price as invoice_price,
                                    v.added_date as added_date
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Convertible as c ON v.vin = c.vin                                                             
                                WHERE vin = '${vin}'`
                    break;
                case 'truck':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.cargo_capacity as cargo_capacity,
                                    c.cargo_cover_type as cargo_cover_type,
                                    c.number_of_rear_axles as number_of_rear_axles,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.inventory_clerk_username as inventory_clerk_username,
                                    v.invoice_price as invoice_price,
                                    v.added_date as added_date
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Truck as c ON v.vin = c.vin                                                               
                                WHERE vin = '${vin}'`
                    break;
                case 'vanMinivan':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.has_drivers_side_back_door as has_drivers_side_back_door,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.inventory_clerk_username as inventory_clerk_username,
                                    v.invoice_price as invoice_price,
                                    v.added_date as added_date
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN VanMinivan as c ON v.vin = c.vin                                               
                                WHERE vin = '${vin}'`
                    break;
                default:  // SUV
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.drivetrain_type as drivetrain_type,
                                    c.number_of _cupholders as number_of _cupholders,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.inventory_clerk_username as inventory_clerk_username,
                                    v.invoice_price as invoice_price,
                                    v.added_date as added_date
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                                               
                                WHERE vin = '${vin}'`
                    break;
            }
        case 'Owner':
            switch (vehicle_type) {
                case 'car':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.number_of_doors as number_of_doors,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                               
                                WHERE vin = '${vin}'`
                    break;
                case 'covertible':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.roof_type as roof_type,
                                    c.back_seat_count as back_seat_count,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Convertible as c ON v.vin = c.vin                                                                             
                                WHERE vin = '${vin}'`
                    break;
                case 'truck':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.cargo_capacity as cargo_capacity,
                                    c.cargo_cover_type as cargo_cover_type,
                                    c.number_of_rear_axles as number_of_rear_axles,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Truck as c ON v.vin = c.vin                                                                               
                                WHERE vin = '${vin}'`
                    break;
                case 'vanMinivan':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.has_drivers_side_back_door as has_drivers_side_back_door,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN VanMinivan as c ON v.vin = c.vin                                                               
                                WHERE vin = '${vin}'`
                    break;
                default:  // SUV
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.drivetrain_type as drivetrain_type,
                                    c.number_of _cupholders as number_of _cupholders,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description,
                                    v.invoice_price as invoice_price
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                                                               
                                WHERE vin = '${vin}'`
                    break;
            }
        default:  // Anonymous user and Salesperson
            switch (vehicle_type) {
                case 'car':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.number_of_doors as number_of_doors,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                             
                                WHERE vin = '${vin}'`
                    break;
                case 'convertible':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.roof_type as roof_type,
                                    c.back_seat_count as back_seat_count,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25 as list_price,
                                    v.description as description
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Convertible as c ON v.vin = c.vin                                                             
                                WHERE vin = '${vin}'`
                    break;
                case 'truck':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.cargo_capacity as cargo_capacity,
                                    c.cargo_cover_type as cargo_cover_type,
                                    c.number_of_rear_axles as number_of_rear_axles,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25  as list_price,
                                    v.description as description
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Truck as c ON v.vin = c.vin                                                            
                                WHERE vin = '${vin}'`
                    break;
                case 'vanMinivan':
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.has_drivers_side_back_door as has_drivers_side_back_door,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    vc.color as color,
                                    v.invoice_price*1.25  as list_price,
                                    v.description as description
                                FROM
                                    Vehicle as v
                                    JOIN VehicleColor as vc ON v.vin = vc.vin
                                    JOIN VanMinivan as c ON v.vin = c.vin                                                    
                                WHERE vin = '${vin}'`
                    break;
                default:  // SUV
                    let sql = `SELECT
                                    v.vin as vin,
                                    v.vehicle_type as vehicle_type,
                                    c.drivetrain_type as drivetrain_type,
                                    c.number_of _cupholders as number_of _cupholders,
                                    v.model_year as model_year,
                                    v.model_name as model_name,
                                    v.manufacturer as manufacturer,
                                    GROUP_CONCAT(vc.color) as color,
                                    v.invoice_price*1.25  as list_price,
                                    v.description as description
                                FROM
                                    VehicleColor as vc
                                    GROUP BY vc.vin
                                    JOIN Vehicle as v
                                    ON v.vin = vc.vin 
                                    JOIN Car as c ON v.vin = c.vin                                                             
                                WHERE vin = '${vin}'`
                    break;
            }
            break;
    }
  
    try {
        const pool = await database('TEST').pool();
        const vehicleDetail = await pool.queryAsync(sql);
        
        // if no such vehicle, display error
        if (vehicleDetail.length == 0) {
            res.send({'msg': "Not exist"});
            return
        }

        res.send(vehicleDetail);
    }
    catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
    }

    // special sale record display for manager and owner
    if (USERNAME == 'Manager' || 'Owner') {
        sql = `SELECT vin 
                FROM Sale
                WHERE vin = '${vin}'`;

        try {
            const pool = await database('TEST').pool();
            const vin = await pool.queryAsync(sql);
            
            // if exists, vehicle is sold, display sale information
            if (vin.length != 0) {
                // assume it's individual customer first
                sql = `SELECT 
                            c.city as city,
                            c.postal_code as postal_code,
                            c.state as state,
                            c.street_address as street_address,
                            c.phone_number as phone_number,
                            c.email as email,
                            CONCAT(i.first_name, “”, i.last_name) as customer_name,
                            v.invoice_price as invoice_price,
                            s.sold_price as sold_price,
                            s.purchase_date as purchase_date,
                            CONCAT(u.first_name, “ ”, u.last_name) as salesperson_name
                        FROM
                            Sale s
                        JOIN Vehicle v ON s.vin = v.vin
                        JOIN Customer c ON s.customer_id = c.id
                        JOIN Individual i ON s.customer_id = i.customer_id
                        JOIN User u ON u.username = s.salespeople_username
                        WHERE s.vin = '${vin}'`;
                // check if it's individual customer
                const sale_info = await pool.queryAsync(sql);

                // if it's business customer
                if(sale_info.length == 0) {
                    sql = `SELECT 
                                c.city as city,
                                c.postal_code as postal_code,
                                c.state as state,
                                c.street_address as street_address,
                                c.phone_number as phone_number,
                                c.email as email,
                                b.business_name as business_name,
                                b.primary_contact_title as primary_contact_title,
                                b.primary_contact_name as primary_contact_name,
                                v.invoice_price as invoice_price,
                                s.sold_price as sold_price,
                                s.purchase_date as purchase_date,
                                CONCAT(u.first_name, “ ”, u.last_name) as salesperson_name
                            FROM
                                Sale s
                            JOIN Vehicle v ON s.vin = v.vin
                            JOIN Customer c ON s.customer_id = c.id
                            JOIN Business b ON s.customer_id = b.customer_id
                            JOIN User u ON u.username = s.salespeople_username
                            WHERE s.vin = '${vin}'`;
                    sale_info = await pool.queryAsync(sql);
                }
                res.send(sale_info);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send({ error: err });
        }
    }

    // special repair record display for manager and owner
    if (USERNAME == 'Manager' || 'Owner') {
        sql = `SELECT vin 
                FROM Repair
                WHERE vin = '${vin}'`;

        try {
            const pool = await database('TEST').pool();
            const vin = await pool.queryAsync(sql);
            
            // if exists, vehicle has been repaired, display repair information
            if (vin.length != 0) {
                // assume it's individual customer first
                sql = `SELECT 
                            CONCAT(i.first_name, “ ”, i.last_name) as customer_name,
                            CONCAT(u.first_name, “ ”, u.last_name) as service_writer_name,
                            r.start_date as start_date,
                            r.complete_date as end_date,
                            r.labor_charge as labor charges,
                            r.parts_cost as parts_cost,
                            (r.parts_cost + r.parts_cost) as total cost
                        FROM
                            Repair r
                        JOIN Customer c ON c.id = r.customer_id
                        JOIN Individual i ON c.id = i.customer_id
                        JOIN User u ON u.username = r.service_writer_username                
                        WHERE r.vin = '${vin}'`;
                // check if it's individual customer
                const repair_info = await pool.queryAsync(sql);

                // if it's business customer
                if(repair_info.length == 0) {
                    sql = `SELECT 
                                b.business_name as customer_name,
                                CONCAT(u.first_name, “ ”, u.last_name) as service_writer_name,
                                r.start_date as start_date,
                                r.complete_date as end_date,
                                r.labor_charge as labor charges,
                                r.parts_cost as parts_cost,
                                (r.parts_cost + r.parts_cost) as total cost
                            FROM
                                Repair r
                            JOIN Customer c ON c.id = r.customer_id
                            JOIN Business b ON c.id = b.customer_id
                            JOIN User u ON u.username = r.service_writer_username                    
                            WHERE r.vin = '${vin}'`;
                    repair_info = await pool.queryAsync(sql);
                }
                res.send(repair_info);
            }
        }
        catch (err) {
            console.log(err);
            res.status(500).send({ error: err });
        }
    }
});

module.exports = router;