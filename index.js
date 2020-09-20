const express = require('express');
const app = express();
const commands = require('./commands');
const geo = require('./geo');
const auth = require('./auth');
app.use(express.json({ limit: "50mb" }));

require('dotenv').config();
const KEY = process.env.KEY;

app.use('/commands', commands);
app.use('/geo', geo);
app.use('/auth', auth);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));