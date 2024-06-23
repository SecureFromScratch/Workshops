const { MongoClient, ServerApiVersion } = require('mongodb');
const mongoose = require('mongoose');

const CONNECTION_STRING = 'mongodb+srv://cluster0.4el6tu0.mongodb.net/?authSource=%24external&authMechanism=MONGODB-X509&retryWrites=true&w=majority&appName=Cluster0';

const DB_NAME = "secure_animals";
const ANIMALS_COLLECTION = "animals";
const SAYINGS_COLLECTION = "english";

const credentials = 'X509-cert-7418278991288180999.pem'

async function generate_mongodb_client() {
    const client = new MongoClient(CONNECTION_STRING, {
        tlsCertificateKeyFile: credentials,
        serverApi: ServerApiVersion.v1
    });
    await client.connect();
    return client;
}

async function connect_to_mongoose() {
    mongoose.connect(CONNECTION_STRING, {
        tls: true,
        // location of a local .pem file that contains both the client's certificate and key
        tlsCertificateKeyFile: credentials,
        //#authMechanism: 'MONGODB-X509',
        //authSource: '$external',
    })
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('MongoDB connection error:', err));
}

async function wrap_with_mongodb_boilerplate(res, actionFunc) {
    let client = undefined;
    try {
        client = await generate_mongodb_client();
        const db = client.db(DB_NAME);
        await actionFunc(db);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error');
    } finally {
        await client?.close();
    }
}

function expose_mongodb_collections(app) {
    app.get('/api/mongo/animals', async (req, res) => {
        await wrap_with_mongodb_boilerplate(res, async (db)=> {
            const collection = db.collection(ANIMALS_COLLECTION);
            const animals = await collection.find({}).toArray();
            res.json({ animals: animals });
        });
    });
    app.get('/api/mongo/english', async (req, res) => {
        await wrap_with_mongodb_boilerplate(res, async (db)=> {
            const collection = db.collection(SAYINGS_COLLECTION);
            const sayings = await collection.find({}).toArray();
            res.json({ english: sayings });
        });
    });
}

module.exports = { generate_mongodb_client, wrap_with_mongodb_boilerplate, expose_mongodb_collections, ANIMALS_COLLECTION, SAYINGS_COLLECTION, connect_to_mongoose };
