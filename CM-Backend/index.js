const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const { dataService} = require(path.join(process.cwd(),'src','service','data.service'));
const app = express();
const port = 3000;
const dataServiceInstance = new dataService();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.post('/', (req, res) => {
    const obj = dataServiceInstance.processRawData(JSON.parse(JSON.stringify(req.body, null, 2)));  
    res.send(obj);
});

var server = app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});  