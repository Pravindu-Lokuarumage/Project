// Called after form input is processed
function startConnect() {
    // Generate a random client ID
    clientID = "clientID-" + parseInt(Math.random() * 100);

    // Fetch the hostname/IP address and port number from the form
    host = "test.mosquitto.org";
    port = "8080";

    // Initialize new Paho client connection
    client = new Paho.MQTT.Client(host, Number(port), clientID);

    // Set callback handlers
    client.onConnectionLost = onConnectionLost;
    client.onMessageArrived = onMessageArrived;

    // Connect the client, if successful, call onConnect function
    client.connect({ 
        onSuccess: onConnect,
    });
}

// Called when the client connects
function onConnect() {

    // Subscribe to the topics
    client.subscribe("webProject");


    realtimeclock();
}

// Called when the client loses its connection
function onConnectionLost(responseObject) {
    document.getElementById("messages").innerHTML += '<span>ERROR: Connection lost</span><br/>';
    if (responseObject.errorCode !== 0) {
        document.getElementById("messages").innerHTML += '<span>ERROR: ' + + responseObject.errorMessage + '</span><br/>';
    }
}

// Called when a message arrives
function onMessageArrived(message) {
    console.log("onMessageArrived: " + message.payloadString);
    document.getElementById("messages").innerHTML += '<span>Topic: ' + message.destinationName + ' | ' + message.payloadString + '</span><br/>'; //logs messages recived by the webpage
    if (message.payloadString == "Water?") {
        timeOfDay(message.payloadString)
    }
    if (message.payloadString == "Light?") {
        timeOfDay(message.payloadString)
    }
    if (message.payloadString == "Waterstop") {
        waterStop()
    }
    if (message.payloadString == "Lightstop") {
        lightStop()
    }
}

// Called when the disconnection button is pressed
function startDisconnect() {
    client.disconnect();
    document.getElementById("messages").innerHTML += '<span>Disconnected</span><br/>';
}
// Sends message to stop watering system if not manually started
function waterStop(){
    var text = document.getElementById("water").textContent;
    if (text == "Water"){
        message = new Paho.MQTT.Message("Water?stop")
        message.destinationName = "RPiProjectAction"
        client.send(message)
    }
}
// Sends message to stop Lighting system if not manually started
function lightStop(){
    text = document.getElementById("light").textContent;
    if (text == "Light"){
        message = new Paho.MQTT.Message("Light?stop")
        message.destinationName = "RPiProjectAction"
        client.send(message)
    }
}
// manual override for water system turn on and off
function Water(){
    text = document.getElementById("water").textContent;
    if (text == "Water"){
        document.getElementById("water").textContent = "Stop Watering"
        message = new Paho.MQTT.Message("Water?ok")
        message.destinationName = "RPiProjectAction"
        client.send(message)
    }
    else{
        document.getElementById("water").textContent = "Water"
        message = new Paho.MQTT.Message("Water?stop")
        message.destinationName = "RPiProjectAction"
        client.send(message)
    }
}
// manual override for light system turn on and off
function Light(){
    text = document.getElementById("light").textContent;
    if (text == "Light"){
        document.getElementById("light").textContent = "Switch off Lights"
        message = new Paho.MQTT.Message("Light?ok")
        message.destinationName = "RPiProjectAction"
        client.send(message)
    }
    else{
        document.getElementById("light").textContent = "Light"
        message = new Paho.MQTT.Message("Light?stop")
        message.destinationName = "RPiProjectAction"
        client.send(message)
    }
}
// implementing realtime clock
function realtimeclock(){
    var rtClock = new Date();

    var hours = rtClock.getHours();
    var minutes = rtClock.getMinutes();
    var seconds = rtClock.getSeconds();

    
    var amPm = (hours<12) ? "AM" : "PM";

    hours = (hours > 12)? hours -12 : hours;
    hours = ("0" + hours).slice(-2);
    minutes = ("0" + minutes).slice(-2);
    seconds = ("0" + seconds).slice(-2);

    document.getElementById('clock').innerHTML = 
        hours + " : " + minutes +" : " + seconds + " " + amPm;
    var t = setTimeout(realtimeclock, 500);
}
// checking the time of the day to inform to raspberry pi
function timeOfDay(message){
    var rtClock = new Date();

    var hours = rtClock.getHours();
    if (hours<17 && hours>6) {
        message = new Paho.MQTT.Message(message + "ok")
    }
    if (hours>=17 && hours<6) {
        message = new Paho.MQTT.Message(message + "stop")
    }
    
    message.destinationName = "RPiProjectAction"
    client.send(message)
}