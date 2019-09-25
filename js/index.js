// JavaScript source code
// Based on an example:
//https://github.com/don/cordova-plugin-ble-central


// ASCII only
function bytesToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}

// ASCII only
function stringToBytes(string) {
    var array = new Uint8Array(string.length);
    for (var i = 0, l = string.length; i < l; i++) {
        array[i] = string.charCodeAt(i);
    }
    return array.buffer;
}

// this is ble hm-10 UART service
/*var blue= {
    serviceUUID: "0000FFE0-0000-1000-8000-00805F9B34FB",
    characteristicUUID: "0000FFE1-0000-1000-8000-00805F9B34FB"
};*/

//the bluefruit UART Service
var blue = {
    serviceUUID: '6e400001-b5a3-f393-e0a9-e50e24dcca9e',
    txCharacteristic: '6e400002-b5a3-f393-e0a9-e50e24dcca9e', // transmit is from the phone's perspective
    rxCharacteristic: '6e400003-b5a3-f393-e0a9-e50e24dcca9e'  // receive is from the phone's perspective
}

var ConnDeviceId;
var deviceList = [];
var attempt = 3; //variable to count number of attempts.

function onLoad() {
    document.addEventListener('deviceready', onDeviceReady, false);
    bleDeviceList.addEventListener('touchstart', conn, false); // assume not scrolling
}

function onDeviceReady() { //Når enheden er klar kører funktionen refreshDeviceList
    refreshDeviceList();
}


function refreshDeviceList() {
    //deviceList =[];
    document.getElementById("bleDeviceList").innerHTML = ''; // empties the list
    if (cordova.platformId === 'android') { // Android filtering is broken
        ble.scan([], 5, onDiscoverDevice, onError);
    } else {
        //alert("Disconnected");
        ble.scan([blue.serviceUUID], 5, onDiscoverDevice, onError);
    }
}


function onDiscoverDevice(device) {
    //Make a list in html and show devises
    if (device.name.includes("LAMPE") == true){ //Hvis navnet indeholder "lampe" bliver den vist på listen
        var listItem = document.createElement('li'), //den laver et List item
            html = device.name + "," + device.id;;     //Det Listitem bliver navnkaldt efter navnet på bluetooth enheden
    listItem.innerHTML = html;
    document.getElementById("bleDeviceList").appendChild(listItem); //Den sætter listitem ind under den ul der er navnkaldt "bleDeviceList" og slutter Listitem
    }
}


function conn() {
    var deviceTouch = event.srcElement.innerHTML;
    document.getElementById("debugDiv").innerHTML = ""; // empty debugDiv
    var deviceTouchArr = deviceTouch.split(",");
    ConnDeviceId = deviceTouchArr[1];
    document.getElementById("debugDiv").innerHTML += "<br>" + deviceTouchArr[0] + "<br>" + deviceTouchArr[1]; //for debug:
    ble.connect(ConnDeviceId, onConnect, onConnError);
}

//succes
function onConnect() {
    document.getElementById("statusDiv").innerHTML = " Status: Connected";
    document.getElementById("bleId").innerHTML = ConnDeviceId;
    ble.startNotification(ConnDeviceId, blue.serviceUUID, blue.rxCharacteristic, onData, onError);
}

//failure
function onConnError() {
    alert("Problem connecting");
    document.getElementById("statusDiv").innerHTML = " Status: Disonnected";
}

function onData(data) { // data received from Arduino
    document.getElementById("receiveDiv").innerHTML = "Received: " + bytesToString(data) + "<br/>";
}

function time(txt) { //Den tager hvad der er skrevet i timeInput og sætter det ind i funktionen
    var seconds = Math.floor(txt * 60);  //Den beregner minutter til sekunder
    var ticks = Math.floor(seconds * 20); //Beregner sekunder til ticks. I dette tilfælde er der 20 ticks på 1 sekund
    timeOutput.value = ticks //Sætter ticks til at stå under inputtet med id'et timeOutput
    sendData() //Kører funktionen sendData
}


function sendData() { //Sender data til arduinoen
    var data = stringToBytes(timeOutput.value); //Konverterer mængden i inputtet timeOutput fra en string til bytes ved hjælp af funktionen stringtobytes
    ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, data, onSend, onError);
    //kører en writewithoutresponse (device_ID, Service_uuid, characteristic_uuid, data, success, failure)
    
}

function sendData_2() {
    var data = stringToBytes(timeInput.value);
    ble.writeWithoutResponse(ConnDeviceId, blue.serviceUUID, blue.txCharacteristic, data, onSend, onError);
}


function onSend() {
    document.getElementById("sendDiv").innerHTML = "Sent: " + messageInput.value + "<br/>";
}

function disconnect() {
    ble.disconnect(deviceId, onDisconnect, onError);
}

function onDisconnect() { //Hvis mobilen bliver disconnected fra bluetooth enheden ændre den statusen til at vise disconnected
    document.getElementById("statusDiv").innerHTML = "Status: Disconnected";
}
function onError(reason) { //På en error viser den en meddellelse
    alert("ERROR: " + reason);
}




//validate function that executes on click of login button.
function validate() {
    var password = document.getElementById("password").value; //laver en variabel password som den tager fra password inputtet

    //hvis variablen er det samme som det givende password, i dette tilfælde 123
    if (password == "123") {

        window.location = "timer.html"; //redirect til en anden side
        return false;
    }

    //hvis det indtastede password ikke er rigtigt
    else {
        attempt--; //fjerne den 1 attempt
        alert("You have left " + attempt + " attempt;");
        //slukker password input og knap efter 3 attempts er blevet brugt.
        if (attempt == 0) {
            document.getElementById("password").disabled = true;
            document.getElementById("submit").disabled = true;
            return false;
        }
    }
}



