const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();
const port = 8000;

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true, //allow cookies and auth headers to be sent
}));
app.use(cookieParser());
app.use(express.json());

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
