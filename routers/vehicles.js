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
    if(req.manager.super){
        db.Vehicle.findAll().then((res) => {
            resp.json(res);
        })    
    }
    else{
        db.Vehicle.findAll({
            where:
                {
                    fleetId: req.manager.fleetId,
                    deletedAt: null
                }
        }).then((res) => {
            resp.json(res);
        });
    }
});
vehiclesRouter.get('/read', (req, resp, next) => {
    if (!req.query.id) { resp.json(ErrorObj); return; }
    const id = req.query.id;

    if(req.manager.super){
    db.Vehicle.findAll(
        {
            where: {
                id: id,
                deletedAt: null
            },
        }).then((res) => {
            if (!res.length) resp.json(ErrorObj);
            else resp.json(res);
        });
    }
    else{
        db.Vehicle.findAll(
            {
                where: {
                    id: id,
                    fleetId: req.manager.fleetId,
                    deletedAt: null
                },
            }).then((res) => {
                if (!res.length) resp.json(ErrorObj);
                else {
                    resp.json(res);
                }
            });
        }
});
vehiclesRouter.post('/update', (req, resp, next) => {
    if(!req.manager.super){
        req.body.fleetId = req.manager.fleetId;
    }    
    req = req.body;
    console.log(req.fleetId);
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
    if(!req.manager.super){
        req.body.fleetId = req.manager.fleetId;
    }    
    req = req.body;
    console.log(req.fleetId);
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
    if(!req.manager.super){
        req.body.fleetId = req.manager.fleetId;
    }    
    req = req.body;
    console.log(req.fleetId);
    req = req.body;
    if (!req.name && !req.fleetId) { resp.json(ErrorObj); return; }
    const vehicle = new Vehicle(req.name, req.fleetId);
    db.Vehicle.create(vehicle);
    resp.json(vehicle);
});

vehiclesRouter.get('/milage', async (req, resp, next) => {
    if (!req.query.id) { resp.json(ErrorObj); return; }    
    if(req.manager.super){
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
    }
    else{
        let result = await db.Vehicle.findAll({
            where:{
                id: req.query.id,
                fleetId: req.manager.fleetId
            }
        })
        if(result.length){
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
        }    
        else{
            resp.json({code: 403, message: 'Error 403'});
        }    
    }
});

module.exports = vehiclesRouter;