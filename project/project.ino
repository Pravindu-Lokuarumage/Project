// This #include statement was automatically added by the Particle IDE.
#include <Adafruit_DHT.h>
#define DHTPIN 2 
#define DHTTYPE DHT11

// initialising pins
DHT dht(DHTPIN, DHTTYPE);
int Moisture = A1;
int analogMoisture = 0;
int ldr = A0;

int light;
bool water = false;
bool lighting = false;
int moistureTheresholdmin = 300;
int moistureTheresholdmax = 1000;
bool moistureDangerLow = false;
bool moistureDangerHigh = false;
bool check = false;
// This #include statement was automatically added by the Particle IDE.
#include "MQTT.h"


// Create an MQTT client
MQTT client("test.mosquitto.org", 1883, callback);


// This is called when a message is received. However, we do not use this feature in
// this project so it will be left empty
void callback(char* topic, byte* payload, unsigned int length) 
{
}

// Setup the Photon
void setup() 
{
    dht.begin();
    // Connect to the server
    client.connect("photonDev^&256");  
    // Configure Pins
    pinMode(Moisture, INPUT);
    pinMode(ldr, INPUT);
    pinMode(D7, OUTPUT);
}

// Main loop
void loop() 
{
    // Only try to send messages if we are connected
    if (client.isConnected())
    {
        light = analogRead(ldr);
	    Particle.publish("light", String(light), PRIVATE);
	    delay(1000);
	    lighting = (light>50)? true : false;
	    if (light>50)
	    {
	        lighting = true;
	    }
	    else
	    {
	        lighting = false;
	    }
	    float t = dht.getTempCelcius();
	    Particle.publish("temp", String(t), PRIVATE);
	    delay(1000);
	    moistureTheresholdmin = (t>38)? 600 : 300; //increases the minimum threshold for soil moisture when temperature is high
	    if ( isnan(t) ) {
	    	Serial.println("Failed to read from DHT sensor!");
	    	return;
	    }
	    analogMoisture = analogRead(Moisture);
	    Particle.publish("moisture", String(analogMoisture), PRIVATE);
	    delay(1000);
	    water =  (analogMoisture < moistureTheresholdmin)? true : false;
	    if (analogMoisture < moistureTheresholdmin)
	    {
	        water = true;
	    }
	    else
	    {
	        water = false;
	    }
	    if (analogMoisture > moistureTheresholdmax){
	        water = false;
	    }
	    moistureDangerLow = (analogMoisture<100)? true : false;
	    moistureDangerHigh = (analogMoisture>1500)? true : false;
	    check = moistureDangerLow || moistureDangerHigh;
	    
	    // sending messages according to the sensor readings
        if(lighting)
        {
            client.publish("RPiProject", "Light");
            delay(1000);        
        }
        else
        {
            client.publish("webProject", "Lightstop");
            delay(1000);        
        }
        if (check) //overide for watering system
        {
            if (moistureDangerLow){
                client.publish("RPiProjectAction", "Water?ok");
            }
            if (moistureDangerHigh){
                client.publish("RPiProjectAction", "Water?stop");
            }
                
        }
        else
        {
            if(water) // watering system messages in normal conditions
            {
                client.publish("RPiProject", "Water");
                delay(1000);        
            }
            else
            {
                client.publish("webProject", "Waterstop");
                delay(1000);
            }
        }
        
        client.loop();
        delay(1000);
    }
}