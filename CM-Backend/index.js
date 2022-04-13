const express = require('express');
const path = require('path');
var bodyParser = require('body-parser');
const { Server } = require("socket.io");
const { dataService } = require(path.join(process.cwd(), 'src', 'service', 'data.service'));
const app = express();
const port = 3000;
const http = require('http');
const server = http.createServer(app);
const io = new Server(server);
const dataServiceInstance = new dataService();

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.post('/', (req, res) => {
    const obj = dataServiceInstance.processRawData(JSON.parse(JSON.stringify(req.body, null, 2)));
    res.send(obj);
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

server.listen(3000, () => {
    console.log(`Listening on port ${port}`);
});  