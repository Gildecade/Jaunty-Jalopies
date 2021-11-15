const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

/**
 * login 
 * Input: username and password
 * Ouput: usertype or null(failed)
 */
router.post('/login', async (req, res) => {
    // Check if user record matches
    const{username, password} = req.body;
    let sql = ` SELECT username
                FROM User 
                WHERE username = '${username}' and password = '${password}'`;
    try {
        const pool = await database('TEST').pool();
        let username = await pool.queryAsync(sql);
        if (username == null) {
          res.send(null);
        }
        // Find user type
        sql = ` SELECT username
                FROM Owner
                WHERE username = '${username}''`;
        exist = await pool.queryAsync(sql);
        if(exist !=null){
            res.send("Owner");
        }

        sql = ` SELECT username
                FROM InventoryClerk
                WHERE username = '${username}''`;
        exist = await pool.queryAsync(sql);
        if(exist !=null){
            res.send("Inventory Clerk");
        }

        sql = ` SELECT username
                FROM Salespeople
                WHERE username = '${username}''`;
        exist = await pool.queryAsync(sql);
        if(exist !=null){
            res.send("Salespeople");
        }

        sql = ` SELECT username
                FROM ServiceWriter
                WHERE username = '${username}''`;
        exist = await pool.queryAsync(sql);
        if(exist !=null){
        res.send("Service Writer");
        }

        sql = ` SELECT username
                FROM Manager
                WHERE username = '${username}''`;
        exist = await pool.queryAsync(sql);
        if(exist !=null){
        res.send("Manager");
        }
      } catch (err) {
        console.log(err);
        res.status(500).send({ error: err });
      }
});