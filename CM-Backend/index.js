const express = require('express');
var bodyParser = require('body-parser');
const { processRawData } = require('./src/service/data.service');
const app = express();
const port = 3000;

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.post('/', (req, res) => {
    const obj = processRawData(JSON.parse(JSON.stringify(req.body, null, 2)));
    console.log(obj);
});

var server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});