import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import bodyParser from 'body-parser';

import router  from './osm/routes/transitRoute.js';


// Load environment variables from .env file
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// middleware - means to process something before reaching the final request handler
// Enable CORS for all routes
app.use(cors(
  {origin: 'exp://192.168.5.153:8081' }
));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
// Sample route
app.get('/', (req, res) => {
  res.send('Hello World! Server is running.');
});

// Transit routes
app.use('/transit', router); // for checking the transit routes

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});