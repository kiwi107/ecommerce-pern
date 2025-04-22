const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

router.get('/getTables',adminController.getTables)

router.get('/getTableData/:table',adminController.getTableData)


module.exports = router;
