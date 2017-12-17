const express = require('express');
const fleetsRouter = express.Router();
const bodyParser = require('body-parser');
const db = require('../db/db');
fleetsRouter.use(bodyParser.json());

class Fleet {
    constructor(name) {
        this.name = name;
    }
}
const ErrorObj = { code: 404, message: 'Error!!!' };

fleetsRouter.get('/readall', (req, resp, next) => {
    resp.statusCode = 200;
    db.Fleet.findAll().then((res) => {
        resp.json(res.map(i => i.name));
    });
});
fleetsRouter.get('/read', (req, resp, next) => {
    if (!req.query.id) { resp.json(ErrorObj); return; }
    const id = req.query.id;
    db.Fleet.findAll(
        {
            attributes: ['name'],
            where: {
                id: id,
                deletedAt: null
            },
        }).then((res) => {
            if (!res.length) resp.json(ErrorObj);
            else resp.json(res);
        });
});
fleetsRouter.post('/update', (req, resp, next) => {
    req = req.body;
    if (!req.id) { resp.json(ErrorObj); return; }
    const id = req.id;
    const fleet = new Fleet(req.name);
    fleet.id = id;
    db.Fleet.update({ name: req.name },
        {
            where: {
                id: id,
                deletedAt: null 
            }
        }
    );
    resp.json(fleet);
});
fleetsRouter.post('/delete', (req, resp, next) => {
    req = req.body;
    if (!req.id) { resp.json(ErrorObj); return; }
    const id = req.id;
    db.Fleet.destroy(
        {
            where:
                {
                    id: id,
                    deletedAt: null            
                }
        }
    ).catch((e) => {
        resp.json(ErrorObj);
    });
    resp.json(req.id);
});

fleetsRouter.post('/create', (req, resp, next) => {
    req = req.body;
    if (!req.name) { resp.json(ErrorObj); return; }
    const fleet = new Fleet(req.name);
    db.Fleet.create(fleet);
    resp.json(fleet);
});

module.exports = fleetsRouter;