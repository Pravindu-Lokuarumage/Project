import paho.mqtt.client as mqtt         # Import the MQTT library
import time                 # The time library is useful for delays
from gpiozero import LED
import RPi.GPIO as GPIO
import struct
import smbus
GPIO.setmode(GPIO.BOARD)
bus = smbus.SMBus(1)
address = 0x8

time.sleep(2)

def dayTime(message):
    ourClient.publish("webProject", message+"?", 0)
def water():
    print("watering")
    bus.write_byte(address, 0x1)
def light():
    print("lights on")
    bus.write_byte(address, 0x3)
def waterStop():
    print("water stopped")
    bus.write_byte(address, 0x0)
def lightStop():
    print("lights off")
    bus.write_byte(address, 0x2)
def on_disconnect(client, userdata, rc):
    print("disconnect")
def on_connect(client, userdata, flags, rc):
    print("connected to server")
    ourClient.subscribe("RPiProject")            # Subscribe to the topic 
    ourClient.subscribe("RPiProjectAction")
# Our "on message" event
def messageFunction (client, userdata, message):
    topic = str(message.topic)
    message = str(message.payload.decode("utf-8"))
    print(topic + " " + message) #logs messages recieved by the raspberry pi  
    if (topic == "RPiProjectAction"):
        if (message == "Water?ok"):
            water()
        if (message == "Light?ok"):
            light()
        if (message == "Water?stop"):
            waterStop()
        if (message == "Light?stop"):
            lightStop()
    if (topic == "RPiProject"):
        dayTime(message)
ourClient = mqtt.Client("makerio_mqtt_2130")     # Create a MQTT client object
ourClient.connect("test.mosquitto.org", 1883)   # Connect to the test MQTT broker


ourClient.on_connect = on_connect
ourClient.on_disconnect = on_disconnect
ourClient.on_message = messageFunction      # Attach the messageFunction to subscription
ourClient.loop_start()              # Start the MQTT client
 
 
# Main program loop
while(1):
    time.sleep(1)   
