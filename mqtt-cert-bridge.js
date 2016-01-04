var argv = require('minimist')(process.argv.slice(2));
var mqtt    = require('mqtt');
var awsIot = require('aws-iot-device-sdk');

if (!argv['u']) {
    console.log("Please specify username using -u");
    return;
}

if (!argv['p']) {
    console.log("Please specify password using -p");
    return;
}


var mqttClient  = mqtt.connect('mqtt://m20.cloudmqtt.com:13356', { username:argv['u'] , password:argv['p'] })
var thingIdRegex = /^things\/([^\/]*)$/;

mqttClient.on('connect', function () {
    console.log("MqttClient connected");
    mqttClient.subscribe('things/+');
    status("Connected");
});

mqttClient.on('message', function (topic, message) {
    console.log('received message '+' on '+topic+': '+message);
    thingId = topic.match(thingIdRegex);
    if (thingId) {
        thingId = thingId[1];
        console.log("Updating status of " + thingId);
        setTimeout( function() {
            thingShadows.update(thingId, JSON.parse(message));
        }, 2000 );
    }
});

mqttClient.on("error", function(error) {
    status("Error: " + error);
});

var config = {
    keyPath: 'da66766bd6-private.pem.key',
    certPath: 'da66766bd6-certificate.pem.crt',
    caPath: 'root-CA.pem',
    clientId: 'DhtTest',
    region: 'eu-west-1'
};

var thingShadows = awsIot.thingShadow(config);

var clientTokenUpdate;

thingShadows.on('connect', function() {
    console.log("ThingShadows connected");
    thingShadows.register( 'DhtTest' );
    thingShadows.register( 'ESP-320361' );
});

thingShadows.on('status', 
        function(thingName, stat, clientToken, stateObject) {
            console.log('received '+stat+' on '+thingName+': '+
                    JSON.stringify(stateObject));
        });

thingShadows.on('delta', 
        function(thingName, stateObject) {
            console.log('received delta '+' on '+thingName+': '+JSON.stringify(stateObject));
            mqttClient.publish("things/" + thingName + "/delta", JSON.stringify(stateObject));
        });

thingShadows.on('timeout',
        function(thingName, clientToken) {
            console.log('received timeout: '+clientToken);
        });

function status(message) {
    mqttClient.publish('bridge-status', message, retained=true);
}


