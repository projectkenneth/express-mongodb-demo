const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');

const expressApp = express();
const expressPort = 3000;

async function dbConnBeforeware(req, res, next) {
    const mongoConnString = process.env.ALD_CONN_STRING;
    const mongoClient = new MongoClient(mongoConnString);

    await mongoClient.connect();
    console.log("Database connection established!");

    req.dbClient = mongoClient;
    req.dbDatabaseRef = mongoClient.db('audit-log-demo');

    next();
}

async function dbConnAfterware(req, res, next) {
    await req.dbClient.close();

    console.log("Database connection closed!");

    next();
}

async function getAllProfilesHandler(req, res, next) {
    try {
        const col = req.dbDatabaseRef.collection('user-profile');

        const profileList = await col.find({}).toArray();

        res.send({
            data: profileList
        });

        next();
    } catch (err) {
        next(err);
    }
}

async function getProfileByIdHandler(req, res, next) {
    try {
        const col = req.dbDatabaseRef.collection('user-profile');

        const profile = await col.findOne({ _id: ObjectId(req.params.id) });

        // let's fake an error here
        throw new Error("Something went wrong!");
    } catch (err) {
        next(err);
    }
}

expressApp.get('/profiles', dbConnBeforeware, getAllProfilesHandler, dbConnAfterware);

expressApp.get('/profile/:id', dbConnBeforeware, getProfileByIdHandler, dbConnAfterware);

expressApp.use(async function (err, req, res, next) {
    if (req.dbClient) {
        await req.dbClient.close();
        console.log("Database connection closed!");
    }

    console.error(err.stack);
    res.status(500).send('Something broke!');
});

expressApp.listen(expressPort, () => {
    console.log(`Example app listening at http://localhost:${expressPort}`)
});