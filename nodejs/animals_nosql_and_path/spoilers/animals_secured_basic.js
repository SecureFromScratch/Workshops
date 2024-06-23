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

        if (!['blue', 'yellow', 'pink'].includes(color)) {
            res.status(404).send('Image not found');
            return;
        }

        const animalsCollection = db.collection(ANIMALS_COLLECTION);
        if ((typeof(imgName) !== 'string') || !animalsCollection.findOne({ imgName: imgName })) {
            res.status(404).send('Image not found');
            return;
        }

        const sandbox = new Sandbox('public');
        const imagePath = sandbox.join('public', color, imgName);
            
        console.log(`myanimal returns: ${imagePath}`);
        res.sendFile(imagePath, err => {
            if (err) {
                res.status(404).send('Image not found');
            }
        });
    });
});

// (POST) Fetch animal saying. Parameters: { color: <color>, animal: <animalName> }
app.post('/api/animalsays', async (req, res) => {
    await wrap_with_mongodb_boilerplate(res, async (db) => {
        console.log(`animalsays received: ${JSON.stringify(req.body)}`);

        const collection = db.collection(SAYINGS_COLLECTION);

        const color = String(req.body.color);
        const animal = String(req.body.animal);
        const query = { color, animal };

        const found = await collection.find(query, { projection: { _id: 0, text: 1 } }).toArray();

        console.debug('found variable contains:');
        console.debug(found);

        // Assign to 'toSend' from the entries in 'found'
        // Check if 'found' array is not empty, then use its content
        let toSend;
        if (found.length > 0) {
            toSend = found
        } else {
            // If no entries found, you can either send back a default response or an empty array
            // Keeping your original default response for consistency
            toSend = [{ text: "I'm speechless!" }, { text: "Nothing to say, yet..." }];
        }

        console.log(`animalsays returns: ${JSON.stringify(toSend)}`);
        res.send(toSend);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});

// Uncomment the line below to initialize the animal data in MongoDB
// setupAnimalData().catch(console.dir);
