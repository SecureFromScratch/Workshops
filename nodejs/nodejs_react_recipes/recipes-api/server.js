import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
import getLocalIp from './getLocalIp.js'
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
import recipeRoutes from './routes/recipeRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
//import couponRoutes from './routes/couponRoutes.js';
import tagRoutes from './routes/tagRoutes.js'
import internalRoutes from './routes/internalRoutes.js';
import seedDefaultRecipes from './storage/dbSeeder.js';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger-output.json' assert { type: 'json' };
import { MongoMemoryServer } from 'mongodb-memory-server';

// This will create an new instance of "MongoMemoryServer" and automatically start it
const mongod = await MongoMemoryServer.create();
const mongodbUri = mongod.getUri();

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static('assets'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))

// MongoDB connection
console.log("MondoDB @ " + mongodbUri);
mongoose.connect(mongodbUri /*'mongodb://localhost:27017/recipes'*/, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Check and seed default recipes
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', async () => {
  console.log('Connected to MongoDB');
  await seedDefaultRecipes();
});

// Routes
const router = express.Router();
recipeRoutes(router);
sessionRoutes(router);
//couponRoutes(router);
tagRoutes(router);
internalRoutes(router);
app.use(router);

// Start the server
const PORT = process.env.PORT || 5000;
const localIp = getLocalIp();
http.createServer(app).listen(PORT, localIp, () => {
  console.log(`Server running on http://${localIp}:${PORT}`);
});
http.createServer(app).listen(PORT, "localhost", () => {
  console.log(`Local server running on http://localhost:${PORT}`);
});
