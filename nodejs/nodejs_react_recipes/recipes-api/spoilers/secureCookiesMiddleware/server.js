import srcRootOfUnchanged from './srcRootOfUnchanged.js'

import express from 'express';
import http from 'http';
import mongoose from 'mongoose';
const { default: getLocalIp } = await import(srcRootOfUnchanged + 'getLocalIp.js')
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import cors from 'cors';
const { default: recipeRoutes } = await import(srcRootOfUnchanged + 'routes/recipeRoutes.js');
const { default: sessionRoutes } = await import(srcRootOfUnchanged + 'routes/sessionRoutes.js');
//import couponRoutes from './routes/couponRoutes.js';
const { default: tagRoutes } = await import(srcRootOfUnchanged + 'routes/tagRoutes.js');
const { default: internalRoutes } = await import(srcRootOfUnchanged + 'routes/internalRoutes.js');
const { default: seedDefaultRecipes } = await import(srcRootOfUnchanged + 'storage/dbSeeder.js');
import swaggerUi from 'swagger-ui-express';
const { default: swaggerFile } = await import(srcRootOfUnchanged + 'swagger-output.json', { assert: { type: 'json' }});
import cookieDefaultOptionsMiddleware from './middleware/cookieDefaultOptionsMiddleware.js';

const app = express();

// Middleware
app.use(cors());
app.use(cookieParser()); 
app.use(bodyParser.json());
app.use('/assets', express.static('assets'));
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerFile))
app.use(cookieDefaultOptionsMiddleware);

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/recipes', {
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
