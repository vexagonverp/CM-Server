const ARIMA = require('arima')

function dataService() {
    this.dataTable = new Map();
    this.dataCacheSize=100;
    this.dataTimeInterval=10;
}

dataService.prototype.processRawData = function (obj) {
    if (obj.spO <= 80) {
        obj.spO = Math.floor(obj.spO * (Math.random() * (1.40 - 1.35) + 1.35));
        if (obj.spO > 100) {
            obj.spO = 100;
        }
    }
    if (obj.heartRate >= 90) {
        obj.heartRate = Math.floor(obj.heartRate * (Math.random() * (0.65 - 0.55) + 0.55));
        if (obj.heartRate <= 60) {
            obj.heartRate = Math.floor(obj.heartRate * (Math.random() * (1.25 - 1.15) + 1.15));
        }
    }
    if (obj.heartRate <= 60) {
        obj.heartRate = Math.floor(obj.heartRate * (Math.random() * (1.25 - 1.15) + 1.15));
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
        if (dataArray.length >= this.dataCacheSize) {
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

dataService.prototype.predictArima = function(id,minute){
    const dataArray = this.dataTable.get(id);
    let heartArray;
    let spoArray;
    if(!minute && Number(minute)<this.dataCacheSize*this.dataTimeInterval){
        heartArray = dataArray.slice(-10).filter(element => element).map(element => element.heartRate);
        spoArray = dataArray.slice(-10).filter(element => element).map(element => element.spO);
    }else{
        let minutePercentage = Number(minute)/((this.dataCacheSize*this.dataTimeInterval)/60);
        heartArray=[];
        spoArray=[];
        for (let i = 0; i < 1; i=i+minutePercentage) {
            heartArray.push(Number(dataArray[Math.floor(i*(dataArray.length-1))].heartRate));
            spoArray.push(Number(dataArray[Math.floor(i*(dataArray.length-1))].spO));
        }
    }
    const autoarimaHeart = new ARIMA({ auto: true,verbose: false }).fit(heartArray);
    const autoarimaSpo = new ARIMA({ auto: true,verbose: false }).fit(spoArray);
    //const [pred, errors] = autoarima.predict(1);
    return autoarimaHeart.predict(1).concat(autoarimaSpo.predict(1));
}

dataService.prototype.returnDataArray= function(id){
    return this.dataTable.get(id);
}

module.exports = {
    dataService
}