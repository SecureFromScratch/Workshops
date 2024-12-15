import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Recipes API',
    version: '1.0.0',
    description: "A simple API to manage recipes\nNOTE: Always signed-in as 'Avi'"
  },
  host: "localhost:5000",
  basePath: "/",
  /*"components": {
    "securitySchemes": {
      "cookieAuth": {
        "type": "apiKey",
        "in": "cookie",
        "name": "sessionId"
      }
    } 
  }*/
};

const outputFile = './swagger-output.json';
const endpointsFiles = [
  //'./routes/sessionRoutes.js',
  './routes/recipeRoutes.js',
  './routes/tagRoutes.js',
  './routes/internalRoutes.js',
];

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
  import('./server.js') // Your project's root file
});
