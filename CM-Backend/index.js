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
    let intervalId;
    console.log('User connected: ' + socket.id);
    socket.on('message', (data) => {
        const obj = JSON.parse(JSON.stringify(data, null, 2));
        let dataArray = dataServiceInstance.returnDataArray(obj.id);
        if (intervalId) {
            clearInterval(intervalId);
        }
        if (dataArray) {
            intervalId = setInterval(function () {
                let dataObject = dataArray[dataArray.length - 1];
                try {
                    const [predHeart, errorHeart, predSpo, errorSpo] = dataServiceInstance.predictArima(obj.id, obj.minute);
                    dataObject.predHeart = Math.round(predHeart[0]);
                    dataObject.errorHeart = errorHeart[0].toFixed(2);
                    dataObject.predSpo = Math.round(predSpo[0]);
                    dataObject.errorSpo = errorSpo[0].toFixed(2);
                } catch (err) {

                } finally {
                    io.to(socket.id).emit('message', dataObject);
                }
            }, 5000);
        }
    });
    socket.on('disconnect', () => {
        console.log('User disconnected: ' + socket.id);
        if (intervalId) {
            clearInterval(intervalId);
        }
    });
});

server.listen(3000, () => {
    console.log(`Listening on port ${port}`);
});  