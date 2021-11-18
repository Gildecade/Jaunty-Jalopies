const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * login 
 * Input: username and password
 * Ouput: usertype or null(failed)
 */
router.post('/', async (req, res) => {
    // Check if user record matches
    const{username, password} = req.body;
    let sql = ` SELECT username
                FROM User 
                WHERE username = '${username}' and password = '${password}'`;
    try {
        const pool = await database('TEST').pool();
        let username = await pool.queryAsync(sql);
        if (username.length == 0) {
          res.send(null);
          return;
        }
        // Find user type
        sql = ` SELECT username
                FROM Owner
                WHERE username = '${username[0].username}'`;
        let exist = await pool.queryAsync(sql);
        if(exist.length != 0){
            res.send("Owner");
            return;
        }
        sql = ` SELECT username
                FROM InventoryClerk
                WHERE username = '${username[0].username}'`;
        exist = await pool.queryAsync(sql);
        if(exist.length != 0){
            res.send("Inventory Clerk");
            return;
        }

        sql = ` SELECT username
                FROM Salespeople
                WHERE username = '${username[0].username}'`;
        exist = await pool.queryAsync(sql);
        if(exist.length != 0){
                res.send("Salespeople");
                return;
        }

        sql = ` SELECT username
                FROM ServiceWriter
                WHERE username = '${username[0].username}'`;
        let exist4 = await pool.queryAsync(sql);
        if(exist4.length != 0){
                res.send("Service Writer");
                return;
        }

        sql = ` SELECT username
                FROM Manager
                WHERE username = '${username[0].username}'`;
        exist = await pool.queryAsync(sql);
        if(exist.length != 0){
                res.send("Manager");
                return;
        }
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});

module.exports = router;