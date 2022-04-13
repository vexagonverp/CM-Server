function dataService() {
    this.dataTable = new Map();
}

dataService.prototype.processRawData = function (obj) {
    if (obj.spO <= 80) {
        obj.spO = Math.floor(obj.spO * (Math.random() * (1.35 - 1.25) + 1.25));
        if (obj.spO > 100) {
            obj.spO = 100;
        }
    }
    if (obj.heartRate >= 90) {
        obj.heartRate = Math.floor(obj.spO * (Math.random() * (0.65 - 0.55) + 0.55));
        if (obj.heartRate <= 60) {
            obj.heartRate = Math.floor(obj.spO * (Math.random() * (1.01 - 1.005) + 1.005));
        }
    }
    if (obj.heartRate <= 60) {
        obj.heartRate = Math.floor(obj.spO * (Math.random() * (1.01 - 1.005) + 1.005));
    }
    obj.id = String(obj.id).replaceAll(':', '');
    this.addData(obj);
    return obj;
}

dataService.prototype.addData = function (obj) {
    if (this.dataTable.has(obj.id)) {
        let dataArray = this.dataTable.get(obj.id);
        let dataObject = {
            heartRate: obj.heartRate,
            spO: obj.spO,
        }
        if (dataArray.length >= 100) {
            dataArray.shift();
            dataArray.push(dataObject);
        } else {
            dataArray.push(dataObject);
        }
        console.log(this.dataTable);
    } else {
        let dataArray = [];
        let dataObject = {
            heartRate: obj.heartRate,
            spO: obj.spO,
        }
        dataArray.push(dataObject);
        this.dataTable.set(obj.id, dataArray);
    }
}

dataService.prototype.returnDataArray= function(id){
    return this.dataTable.get(id);
}

module.exports = {
    dataService
}