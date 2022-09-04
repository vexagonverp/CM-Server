# **CM-Server**

## **Setting up required environment for Arduino**
1. Download and install the driver for the hardware [here](https://www.wch.cn/download/CH341SER_ZIP.html).
2. Import board manager [here](http://arduino.esp8266.com/stable/package_esp8266com_index.json).
3. Download **esp8266** board  by **ESP8266 Community**.

Reference tutorial video to set up **Arduino** [here](https://www.youtube.com/watch?v=tj2fwh989D8).

## **CM-Arduino**
Require Arduino IDE. [Download Arduino IDE](https://support.arduino.cc/hc/en-us/categories/360002212660-Software-and-Downloads).\
[Link to Robodyn R3 Schematic](https://robotdyn.com/pub/media/0G-00005215==UNO+WiFi-R3-AT328-ESP8266-CH340G/DOCS/Schematic==0G-00005215==UNO+WiFi-R3-AT328-ESP8266-CH340G.pdf)\
Use the hardware switch configuration **3, 4** for the **ATMega** and **5, 6** for the **ESP8266**
* **1, 2 ON, everything else OFF :** it puts in comms the ATMega with the 8266 onboard chip. You need this setup to run your program and connect to wifi/internet/blynk. Since this board has only one hardware serial, ATMega and 8266 will be using it. You cannot use the Serial Monitor via USB. You can use a I2C Lcd Display as a debug monitor.
* **3, 4 ON, everything else OFF :** it puts in comms the ATMega chip with the USB-Serial CH340. Use this to upload your sketches to the ATMega Chip.
* **5, 6 ON, everything else OFF :** it puts in comms the 8266 chip with the USB-Serial CH340. Use this to manually send AT commands to the 8266 chip (ex. via Arduino Serial Monitor)
* **5, 6, 7 ON, everything else OFF :** use this setup to upload the firmware in the 8266 chip
* **8 is an unconnected :** unused pin.

## **Install node 16**
1. First, ensure that you are using an administrative shell - you can also install as a non-admin, check out ```Non-Administrative``` Installation.
2. Install with powershell.exe With PowerShell, you must ensure ```Get-ExecutionPolicy``` is not Restricted. We suggest using Bypass to bypass the policy to get things installed or ```AllSigned``` for quite a bit more security.

* Run ```Get-ExecutionPolicy```. If it returns Restricted, then run ```Set-ExecutionPolicy AllSigned``` or ```Set-ExecutionPolicy Bypass -Scope Process```.

3. Run the following command for choco install:

```
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```
4. Paste the copied text into your shell and press Enter.
5. Wait a few seconds for the command to complete.
6. If you don't see any errors, you are ready to use Chocolatey! Type choco or choco -? now.
7. Run the following command for **Node 16.17.0** :
```
choco install nodejs-lts
```
* or :
```
choco install nodejs --version=16.17.0
```

Reference tutorial video to set up **Node 16.17.0** [here](https://www.youtube.com/watch?v=KuYh1iMh0B0).

## **CM-Frontend**
Require **Node 16.17.0**\
Notable libraries :
* React
* AntDesign
* Socket io client

Move to the folder containing the Front-end code :
```
cd .\CM-Frontend\
```
To install dependencies use :
```
npm install
```
To run the front-end on local host use :
```
npm start
```

## **CM-Backend**
Require **Node 16.17.0**\
Notable libraries :
* Express
* Arima
* Socket io
* Mongo db

Move to the folder containing the Back-end code :
```
cd .\CM-Backend\
```
To install dependencies use :
```
npm install
```
To run the back-end on local host use :
```
node index.js
```
To run the back-end on local host with hot reload use :
```
nodemon index.js
```