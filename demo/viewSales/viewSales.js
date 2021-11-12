const express = require('express');

const router = express.Router();
const database = require('scf-nodejs-serverlessdb-sdk').database;

// TODO: view sales by color
router.post("/byColor", async(req, res) => {

});

// TODO: view sales by type
router.post("/byType", async(req, res) => {

});


// TODO: view sales by manufacturer
router.post("/byManufacturer", async(req, res) => {

});


module.exports = router;