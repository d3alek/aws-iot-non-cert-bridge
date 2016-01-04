var argv = require('minimist')(process.argv.slice(2));
var mqtt    = require('mqtt');
var awsIot = require('aws-iot-device-sdk');

if (!argv['s']) {
    console.log("Please specify server using -s");
    return;
}

if (!argv['p']) {
    console.log("Please specify port using -p");
    return;
}

if (!argv['u']) {
    console.log("Please specify username using -u");
    return;
}

if (!argv['d']) {
    console.log("Please specify password using -d");
    return;
}

if (!argv['k']) {
    console.log("Please specify certificate private key using -k");
    return;
}

if (!argv['c']) {
    console.log("Please specify certificate using -c");
    return;
}

if (!argv['r']) {
    console.log("Please specify root certificate using -r");
    return;
}


if (!argv['l']) {
    console.log("Please specify clientId using -l");
    return;
}

if (!argv['g']) {
    console.log("Please specify region using -g");
    return;
}

var mqttClient  = mqtt.connect('mqtt://'+argv['s']+':'+argv['p'], { username:argv['u'] , password:argv['d'] })
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
    keyPath: argv['k'],
    certPath: argv['c'],
    caPath: argv['r'],
    clientId: argv['l'],
    region: argv['g']
};

console.log(config);

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


