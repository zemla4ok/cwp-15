const express = require('express');
const vehiclesRouter = express.Router();
const bodyParser = require('body-parser');
const db = require('../db/db');
vehiclesRouter.use(bodyParser.json());

const ErrorObj = { code: 404, message: 'Error!!!' };
class Vehicle {
    constructor(name, fleetId) {
        this.name = name;
        this.fleetId = fleetId;
    }
}

vehiclesRouter.get('/readall', (req, resp, next) => {
    if (!req.query.id) { resp.json(ErrorObj); return; }
    const id = req.query.id;
    db.Vehicle.findAll({
        attributes: ['name'],
        where:
            {
                fleetId: id,
                deletedAt: null
            }
    }).then((res) => {
        resp.json(res);
    });
});
vehiclesRouter.get('/read', (req, resp, next) => {
    if (!req.query.id) { resp.json(ErrorObj); return; }
    const id = req.query.id;
    db.Vehicle.findAll(
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
vehiclesRouter.post('/update', (req, resp, next) => {
    req = req.body;
    if (!req.id) { resp.json(ErrorObj); return; }
    const id = req.id;
    const vehicle = new Vehicle(req.name, req.fleetId);
    vehicle.id = id;
    db.Vehicle.update({ name: req.name, fleetId: req.fleetId },
        {
            where: {
                id: id,
                deletedAt: null
            }
        }
    );
    resp.json(vehicle);
});
vehiclesRouter.post('/delete', (req, resp, next) => {
    req = req.body;
    if (!req.id) { resp.json(ErrorObj); return; }
    const id = req.id;
    db.Vehicle.destroy(
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

vehiclesRouter.post('/create', (req, resp, next) => {
    req = req.body;
    if (!req.name && !req.fleetId) { resp.json(ErrorObj); return; }
    const vehicle = new Vehicle(req.name, req.fleetId);
    db.Vehicle.create(vehicle);
    resp.json(vehicle);
});

vehiclesRouter.get('/milage', async (req, resp, next) => {
    if (!req.query.id) { resp.json(ErrorObj); return; }
    const id = req.query.id;
    let vehicle = await db.Vehicle.findById(id);
    if (vehicle) {
        let coords = [];
        let motions = await db.Motion.findAll({
            where: {
                vehicleId: id
            }
        });
        motions.forEach((motion) => {
            coords.push(motion.latLng)
        });
        if (coords.length < 2)
            resp.json(0);
        else {
            let distance = require('geolib').getPathLength(coords);
            resp.json(distance);
        }
    }
    else resp.json(ErrorObj);
});

module.exports = vehiclesRouter;