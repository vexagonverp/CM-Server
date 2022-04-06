function processRawData(obj) {
    if (obj.spO <= 80) {
        obj.spO = Math.floor(obj.spO * (Math.random() * (1.35 - 1.25) + 1.25));
        if(obj.spO>100){
            obj.spO=100;
        }
    }
    if (obj.heartRate >= 90) {
        obj.heartRate = Math.floor(obj.spO * (Math.random() * (0.65 - 0.55) + 0.55));
        if(obj.heartRate <=60){
            obj.heartRate = Math.floor(obj.spO * (Math.random() * (1.1 - 1.05) + 1.05));
        }
    }
    if(obj.heartRate <=60){
        obj.heartRate = Math.floor(obj.spO * (Math.random() * (1.1 - 1.05) + 1.05));
    }
    obj.id=String(obj.id).replaceAll(':','');
    return obj;
}

module.exports = {
    processRawData
}