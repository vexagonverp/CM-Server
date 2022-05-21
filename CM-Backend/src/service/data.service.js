const ARIMA = require('arima');
const MongoClient = require('mongodb').MongoClient;

const uri =
  'mongodb+srv://verp:E0kwBsQ6Ak8yNwZZ@cloudmongo.d1voy.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri);

function dataService() {
  this.dataTable = new Map();
  this.dataCacheSize = 100;
  this.dataDefaultTimeInterval = 10;
  this.dataTimeInterval = 10;
}

dataService.prototype.initDb = async function () {
  try {
    await client.connect();
    const obj = await client.db().admin().listDatabases();
    const arrDb = obj.databases.filter((el) => {
      return el.name == 'cm_database';
    });
    if (arrDb.length == 0) {
      await client.db('cm_database').createCollection('patient');
    }
    if (
      !client.db('cm_database').listCollections({ name: 'patient' }).hasNext()
    ) {
      await client.db('cm_database').createCollection('patient');
    }
  } catch (error) {
    console.error(error);
  }
};

dataService.prototype.closeDb = async function () {
  try {
    await client.close();
  } catch (error) {
    console.error(error);
  }
};

dataService.prototype.findPatientFromId = async function (id) {
  try {
    if (!client.topology.isConnected()) {
      await this.initDb();
    }
  } catch (error) {
    await this.initDb();
  }
  const query = { patientId: id };
  return await client.db('cm_database').collection('patient').findOne(query);
};

dataService.prototype.createPatientFromId = async function (id) {
  try {
    if (!client.topology.isConnected()) {
      await this.initDb();
    }
  } catch (error) {
    await this.initDb();
  }
  const query = {
    patientId: id,
    name: 'Unknown',
    age: 21,
    healthType: 'average',
    sex: 'male',
  };
  return await client.db('cm_database').collection('patient').insertOne(query);
};

dataService.prototype.processRawData = function (obj) {
  if (obj.spO <= 80) {
    obj.spO = Math.floor(obj.spO * (Math.random() * (1.4 - 1.35) + 1.35));
    if (obj.spO > 100) {
      obj.spO = 100;
    }
  }
  if (obj.heartRate >= 90) {
    obj.heartRate = Math.floor(
      obj.heartRate * (Math.random() * (0.65 - 0.55) + 0.55)
    );
    if (obj.heartRate <= 60) {
      obj.heartRate = Math.floor(
        obj.heartRate * (Math.random() * (1.25 - 1.15) + 1.15)
      );
    }
  }
  if (obj.heartRate <= 60) {
    obj.heartRate = Math.floor(
      obj.heartRate * (Math.random() * (1.25 - 1.15) + 1.15)
    );
  }
  obj.id = String(obj.id).replaceAll(':', '');
  this.addData(obj);
  return obj;
};

dataService.prototype.addData = async function (obj) {
  if (this.dataTable.has(obj.id)) {
    let dataArray = this.dataTable.get(obj.id);
    let dataObject = {
      heartRate: obj.heartRate,
      spO: obj.spO,
    };
    if (dataArray.length >= this.dataCacheSize) {
      dataArray.shift();
      dataArray.push(dataObject);
    } else {
      dataArray.push(dataObject);
    }
    console.log(this.dataTable);
  } else {
    await this.createPatientFromId(obj.id);
    let dataArray = [];
    let dataObject = {
      heartRate: obj.heartRate,
      spO: obj.spO,
    };
    dataArray.push(dataObject);
    this.dataTable.set(obj.id, dataArray);
  }
};

dataService.prototype.predictArima = function (id, minute) {
  const dataArray = this.dataTable.get(id);
  if (dataArray.length < 5) {
    return;
  }
  let heartArray;
  let spoArray;
  if (
    !minute ||
    Number(minute) > (this.dataCacheSize * this.dataTimeInterval) / 60
  ) {
    heartArray = dataArray
      .slice(-10)
      .filter((element) => element)
      .map((element) => element.heartRate);
    spoArray = dataArray
      .slice(-10)
      .filter((element) => element)
      .map((element) => element.spO);
  } else {
    if (Number(minute) <= 0) {
      minute = 1;
    }
    let minutePercentage =
      Number(minute) / ((this.dataCacheSize * this.dataTimeInterval) / 60);
    heartArray = [];
    spoArray = [];
    for (let i = 0; i < 1; i = i + minutePercentage) {
      heartArray.push(
        Number(dataArray[Math.floor(i * (dataArray.length - 1))].heartRate)
      );
      spoArray.push(
        Number(dataArray[Math.floor(i * (dataArray.length - 1))].spO)
      );
    }
  }
  const autoarimaHeart = new ARIMA({ auto: true, verbose: false }).fit(
    heartArray
  );
  const autoarimaSpo = new ARIMA({ auto: true, verbose: false }).fit(spoArray);
  //const [pred, errors] = autoarima.predict(1);
  return autoarimaHeart.predict(1).concat(autoarimaSpo.predict(1));
};

dataService.prototype.returnDataArray = function (id) {
  return this.dataTable.get(id);
};

dataService.prototype.returnDataKey = async function () {
  arrPatient = Array.from(this.dataTable.keys()).map((el) => {
    return { id: el };
  });
  for (const patient of arrPatient) {
    const patientInfo = await this.findPatientFromId(patient.id);
    patient.name = patientInfo.name;
    patient.sex = patientInfo.sex;
    patient.age = patientInfo.age;
    patient.healthType = patientInfo.healthType;
  }
  return arrPatient;
};

module.exports = {
  dataService,
};
