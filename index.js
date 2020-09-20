const express = require('express');
const app = express();
const commands = require('./commands');
const geo = require('./geo');
app.use(express.json({ limit: "50mb" }));


app.use('/commands', commands);
app.use('/geo', geo);


const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));