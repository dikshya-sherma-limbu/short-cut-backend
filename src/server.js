const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser'); // use for parsing application/json

// Load environment variables from .env file
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

// middleware - means to process something before reaching the final request handler
app.use(cors());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// Sample route
app.get('/', (req, res) => {
  res.send('Hello World! Server is running.');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});