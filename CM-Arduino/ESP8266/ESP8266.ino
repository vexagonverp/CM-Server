// Simple sketch on the ESP8266 to read data sent from ATmega328
//Dip switch 1,2 are set "On" to connect the ATmega and ESP serial TX/RX
// If you want to read the ESP in the serial monitor whilst ATmega and ESP connected then set dip switch 1,2,5,6 to "On"; at this setting any Serial.println will be sent back to the Atmega and confuse the JSON parsing so comment them all out that you do not want sent
// ArduinoJson must be version 5
// Every Serial.println message from ESP gets sent back to the Arduino, this is why all println are commented out soonly data is sent

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>        // Include the Wi-Fi library
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>
#include <ESP8266WebServer.h>
#include <EEPROM.h>
ESP8266WebServer    server(80);
struct settings {
  char ssid[30];
  char password[30];
  char server[30];
} user_wifi = {};

const char* serverName = "http://192.168.1.4:3000/";
void setup() {
  //Serial.begin(115200); // got errors at this rate
  Serial.begin(57600);
  //Serial.begin(9600);
  delay(10);
  EEPROM.begin(sizeof(struct settings) );
  EEPROM.get( 0, user_wifi );

  WiFi.mode(WIFI_STA);
  WiFi.begin(user_wifi.ssid, user_wifi.password);

  byte tries = 0;
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    if (tries++ > 10) {
      WiFi.mode(WIFI_AP);
      WiFi.softAP("Setup Portal", "password");
      break;
    }
  }
  if (WiFi.status() != WL_CONNECTED) {
    server.on("/",  handlePortal);
    server.begin();
  } else {
    Serial.println("Connection established!");
    Serial.print("IP address:\t");
    Serial.println(WiFi.localIP());         // Send the IP address of the ESP8266 to the computer
  }
}
void loop() {
  server.handleClient();
  StaticJsonDocument<256> doc;
  bool StringReady;
  String json;
  DeserializationError error;
  //ACCEPT DATA FROM THE ARDUINO
  while (Serial.available()) {
    json = Serial.readString();
    Serial.println(json);
    // Deserialize the JSON document
    error = deserializeJson(doc, json);
    if (error) {
      return;
    } else {
      doc["id"] = WiFi.macAddress();
      if (WiFi.status() == WL_CONNECTED) {
        json = ""; //Clear the string
        serializeJson(doc, json);
        WiFiClient client;
        HTTPClient http;
        http.begin(client, user_wifi.server);
        http.addHeader("Content-Type", "application/json");
        int httpResponseCode = http.POST(json);
        if (httpResponseCode != 200) {
          Serial.println("Starting API server");
          WiFi.mode(WIFI_AP);
          WiFi.softAP("Setup Portal", "password");
          server.on("/",  handlePortalApi);
          server.begin();
          break;
        }
        // Free resources
        http.end();
      }
    }
  }

}
void handlePortal() {

  if (server.method() == HTTP_POST) {

    strncpy(user_wifi.ssid,     server.arg("ssid").c_str(),     sizeof(user_wifi.ssid) );
    strncpy(user_wifi.password, server.arg("password").c_str(), sizeof(user_wifi.password) );
    user_wifi.ssid[server.arg("ssid").length()] = user_wifi.password[server.arg("password").length()] = '\0';
    EEPROM.put(0, user_wifi);
    EEPROM.commit();

    server.send(200,   "text/html",  "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Wifi Setup</title><style>*,::after,::before{box-sizing:border-box;}body{margin:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans','Liberation Sans';font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#f5f5f5;}.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);border:1px solid #ced4da;}button{border:1px solid transparent;color:#fff;background-color:#007bff;border-color:#007bff;padding:.5rem 1rem;font-size:1.25rem;line-height:1.5;border-radius:.3rem;width:100%}.form-signin{width:100%;max-width:400px;padding:15px;margin:auto;}h1,p{text-align: center}</style> </head> <body><main class='form-signin'> <h1>Wifi Setup</h1> <br/> <p>Your settings have been saved successfully!<br />Please restart the device.</p></main></body></html>" );
  } else {

    server.send(200,   "text/html", "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Wifi Setup</title> <style>*,::after,::before{box-sizing:border-box;}body{margin:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans','Liberation Sans';font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#f5f5f5;}.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);border:1px solid #ced4da;}button{cursor: pointer;border:1px solid transparent;color:#fff;background-color:#007bff;border-color:#007bff;padding:.5rem 1rem;font-size:1.25rem;line-height:1.5;border-radius:.3rem;width:100%}.form-signin{width:100%;max-width:400px;padding:15px;margin:auto;}h1{text-align: center}</style> </head> <body><main class='form-signin'> <form action='/' method='post'> <h1 class=''>Wifi Setup</h1><br/><div class='form-floating'><label>SSID</label><input type='text' class='form-control' name='ssid'> </div><div class='form-floating'><br/><label>Password</label><input type='password' class='form-control' name='password'></div><br/><br/><button type='submit'>Save</button><p style='text-align: right'><a href='https://github.com/vexagonverp/CM-Server' style='color: #32C5FF'>CM-Server</a></p></form></main> </body></html>" );
  }
}
void handlePortalApi() {

  if (server.method() == HTTP_POST) {

    strncpy(user_wifi.server,     server.arg("server").c_str(),     sizeof(user_wifi.server) );
    user_wifi.server[server.arg("server").length()] = '\0';
    EEPROM.put(0, user_wifi);
    EEPROM.commit();

    server.send(200,   "text/html",  "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Wifi Setup</title><style>*,::after,::before{box-sizing:border-box;}body{margin:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans','Liberation Sans';font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#f5f5f5;}.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);border:1px solid #ced4da;}button{border:1px solid transparent;color:#fff;background-color:#007bff;border-color:#007bff;padding:.5rem 1rem;font-size:1.25rem;line-height:1.5;border-radius:.3rem;width:100%}.form-signin{width:100%;max-width:400px;padding:15px;margin:auto;}h1,p{text-align: center}</style> </head> <body><main class='form-signin'> <h1>Wifi Setup</h1> <br/> <p>Your settings have been saved successfully!<br />Please restart the device.</p></main></body></html>" );
  } else {

    server.send(200,   "text/html", "<!doctype html><html lang='en'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width, initial-scale=1'><title>Wifi Setup</title> <style>*,::after,::before{box-sizing:border-box;}body{margin:0;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,'Noto Sans','Liberation Sans';font-size:1rem;font-weight:400;line-height:1.5;color:#212529;background-color:#f5f5f5;}.form-control{display:block;width:100%;height:calc(1.5em + .75rem + 2px);border:1px solid #ced4da;}button{cursor: pointer;border:1px solid transparent;color:#fff;background-color:#007bff;border-color:#007bff;padding:.5rem 1rem;font-size:1.25rem;line-height:1.5;border-radius:.3rem;width:100%}.form-signin{width:100%;max-width:400px;padding:15px;margin:auto;}h1{text-align: center}</style> </head> <body><main class='form-signin'> <form action='/' method='post'> <h1 class=''>Api Setup</h1><br/><div class='form-floating'><label>Api</label><input type='text' class='form-control' name='server'> </div><div class='form-floating'><br/><br/><button type='submit'>Save</button><p style='text-align: right'><a href='https://github.com/vexagonverp/CM-Server' style='color: #32C5FF'>CM-Server</a></p></form></main> </body></html>" );
  }
}
