const express = require('express');
const path = require('path');
const { wrap_with_mongodb_boilerplate, expose_mongodb_collections, ANIMALS_COLLECTION, SAYINGS_COLLECTION } = require('../mongodb_helpers');

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

        const validColorPattern = /^[a-zA-Z]+$/; // Adjust regex based on expected color format
        const validImgNamePattern = /^[a-zA-Z0-9-_]+\.(jpg|jpeg|png|webp)$/; // Adjust regex based on expected file name format

        if (!validColorPattern.test(color) || !validImgNamePattern.test(imgName)) {
            return res.status(400).send('Invalid input');
        }

        const imagePath = path.join('public', color, imgName);
        const resolvedPath = path.resolve(imagePath);

        // Check if the resolved path starts with the intended base directory to prevent directory traversal
        const baseDirectory = path.resolve('public');
        if (!resolvedPath.startsWith(baseDirectory)) {
            return res.status(403).send('Access denied');
        }
    
        console.log(`myanimal returns: ${imagePath}`);
        res.sendFile(resolvedPath, err => {
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

        // Use actual req.body values for the query
        const color = String(req.body.color);
        const animal = String(req.body.animal);
        const query = { color: color, animal: animal };

        const found = await collection.find(query).toArray();

        console.debug('found variable contains:');
        console.debug(found);

        // Assign to 'toSend' from the entries in 'found'
        // Check if 'found' array is not empty, then use its content
        let toSend;
        if (found.length > 0) {
            toSend = found; //found.map(entry => ({ text: entry.text })); // Assuming each entry has a 'text' field
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
