const express = require('express');
const path = require('path');
const { wrap_with_mongodb_boilerplate, expose_mongodb_collections, ANIMALS_COLLECTION, SAYINGS_COLLECTION } = require('./mongodb_helpers');

const app = express();
const PORT = 5001;

app.use(express.json());
app.use(express.static('public'));

// (GET) request handler to fetch animals from MongoDB. No query arguments.
app.get('/api/animals', async (req, res) => {
    await wrap_with_mongodb_boilerplate(res, async (db) => {
        const collection = db.collection(ANIMALS_COLLECTION);
        const animals = await collection.find({}, { projection: { _id: 0 } }).toArray();
        console.log(`animals returns: ${JSON.stringify(animals)}`);
        res.json(animals);
    });
});

// (GET) Fetch animal image. Query parameters are: color=<color>&imgName=<imgNameWithExtension>
app.get('/api/myanimal', async (req, res) => {
    await wrap_with_mongodb_boilerplate(res, async (db) => {
        const { color, imgName } = req.query;

        // TODO: Build path to image according to parameters in req.query, which client sends as:
        //       { color: <color>, imgName: <imgNameWithExtension> }
        const imagePath = 'public/blue/lion.webp';

        console.log(`myanimal returns: ${imagePath}`);
        res.sendFile(path.resolve(imagePath), err => {
            if (err) {
                res.status(404).send('Image not found');
            }
        });
    });
});

// (POST) Fetch animal saying. req.body structure: { color: <color>, animal: <animalName> }
app.post('/api/animalsays', async (req, res) => {
    await wrap_with_mongodb_boilerplate(res, async (db) => {
        console.log(`animalsays received: ${JSON.stringify(req.body)}`);

        const collection = db.collection(SAYINGS_COLLECTION);

        // TODO: Query according to actual req.body which the client sends as
        //       { color: <color>, animal: <animalName> }
        const query = { color: 'blue', animal: 'lion' };

        const found = await collection.find(query).toArray();

        console.debug('found variable contains:');
        console.debug(found);

        // TODO: assign to 'toSend' from the entries in 'found'
        const toSend = [{ text: "I'm speechless!" }, { text: "Nothing to say, yet..." }];
        console.log(`animalsays returns: ${JSON.stringify(toSend)}`);
        res.send(toSend);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
expose_mongodb_collections(app);
