const express = require('express');
const app = express();
const commands = require('./apps/commands/commands');
const geo = require('./apps/geo/geo');
const textExtract = require('./apps/textExtract/textExtract')
const assets = require('./apps/assetCreation/asset')

app.use(express.json({ limit: "50mb" }));
app.use(express.static('public'));

app.use('/assetExercise', assets)
app.use('/commands', commands);
app.use('/imageAnalysis', textExtract);
app.use('/geo', geo);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`listening on port ${port}`));