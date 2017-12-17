let express = require('express');
let router = express.Router();
const fs = require('fs');
const Sequelize = require('sequelize');
const config = require('../config.json');
let db = require('../data')(Sequelize, config);

router.get('/readall', async (req, res) => {
    res.contentType('application/json');
    if (req.manager.super) {
        const items = await db.fleets.findAll({ raw: true });
        res.json(items);
    }
    else {
        res.redirect(403, 'index');
    }
});

module.exports = router;