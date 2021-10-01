const { MongoClient, ObjectId } = require('mongodb');
const express = require('express');

const mongoConnString = process.env.ALD_CONN_STRING;
const mongoClient = new MongoClient(mongoConnString);

const expressApp = express();
const expressPort = 3000;

expressApp.get('/profiles', async (req, res, next) => {
    try {
        await mongoClient.connect();

        const db = mongoClient.db('audit-log-demo');
        const col = db.collection('user-profile');

        const profileList = await col.find({}).toArray();

        res.send({
            data: profileList
        });
    } catch (err) {
        next(err);
    }
    finally {
        await mongoClient.close();
    }
});

expressApp.get('/profile/:id', async (req, res, next) => {
    try {
        await mongoClient.connect();

        const db = mongoClient.db('audit-log-demo');
        const col = db.collection('user-profile');

        const profile = await col.findOne({ _id: ObjectId(req.params.id) });

        res.send({
            data: profile
        });
    } catch (err) {
        next(err);
    }
    finally {
        await mongoClient.close();
    }
});

expressApp.listen(expressPort, () => {
    console.log(`Example app listening at http://localhost:${expressPort}`)
});