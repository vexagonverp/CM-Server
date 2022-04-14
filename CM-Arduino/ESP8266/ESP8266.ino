// Simple sketch on the ESP8266 to read data sent from ATmega328
//Dip switch 1,2 are set "On" to connect the ATmega and ESP serial TX/RX
// If you want to read the ESP in the serial monitor whilst ATmega and ESP connected then set dip switch 1,2,5,6 to "On"; at this setting any Serial.println will be sent back to the Atmega and confuse the JSON parsing so comment them all out that you do not want sent
// ArduinoJson must be version 5
// Every Serial.println message from ESP gets sent back to the Arduino, this is why all println are commented out soonly data is sent

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>        // Include the Wi-Fi library
#include <ESP8266HTTPClient.h>
#include <WiFiClient.h>


const char* ssid     = "Verproti";         // The SSID (name) of the Wi-Fi network you want to connect to
const char* password = "Khongbiet123";     // The password of the Wi-Fi network
const char* serverName = "http://192.168.1.4:3000/";
void setup() {
  //Serial.begin(115200); // got errors at this rate
  Serial.begin(57600);
  //Serial.begin(9600);
  delay(10);
  Serial.println('\n');
  WiFi.begin(ssid, password);             // Connect to the network
  Serial.print("Connecting to ");
  Serial.print(ssid); Serial.println(" ...");
  int i = 0;
  while (WiFi.status() != WL_CONNECTED) { // Wait for the Wi-Fi to connect
    delay(1000);
    Serial.print(++i); Serial.print(' ');
  }
  Serial.println('\n');
  Serial.println("Connection established!");
  Serial.print("IP address:\t");
  Serial.println(WiFi.localIP());         // Send the IP address of the ESP8266 to the computer
}
void loop() {
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
        http.begin(client, serverName);
        http.addHeader("Content-Type", "application/json");
        int httpResponseCode = http.POST(json);

        // Free resources
        http.end();
      }
    }
  }

}
