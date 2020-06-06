#include <Wire.h>
const int LightSystem = 12;
const int WaterSystem = 13; 
 
void setup() {
  // Join I2C bus as slave with address 8
  Wire.begin(0x8);
  
  // Call receiveEvent when data received                
  Wire.onReceive(receiveEvent);
  // Setup pins
  pinMode(LightSystem, OUTPUT);
  digitalWrite(LightSystem, LOW);
  pinMode(WaterSystem, OUTPUT);
  digitalWrite(WaterSystem, LOW);
}
 
// Function that executes whenever data is received from master
void receiveEvent(int howMany) {
  while (Wire.available()) { // loop through all but the last
    char c = Wire.read(); // receive byte as a 
    if (c == 0)
      digitalWrite(WaterSystem, LOW); //to turn off water system 
    if (c == 1)
      digitalWrite(WaterSystem, HIGH); // to turn on water system code can be implemented in this if statement
    if (c == 2)
      digitalWrite(LightSystem, LOW);
    if (c == 3)
      digitalWrite(LightSystem, HIGH);
  }
}
void loop() {
  delay(100);
}
