# aws-iot-non-cert-bridge
Bridge AWS IoT Cert-authenticated MQTT server to a non-cert authenticated MQTT server

I am using this for connecting the ESP8266 chip to AWS IoT. Currently the Arduino ESP8266 SDK (https://github.com/esp8266/Arduino)
does not support certificate-signed MQTT connections (see https://github.com/esp8266/Arduino/issues/43). This project bridges a
username+password authenticated MQTT connection (where the ESP8266 can publish) to AWS IoT MQTT connection, specifically:

things/<thing-id> to AWS IoT shadow update for <thing-id>
and
AWS IoT shadow delta messages to things/<thing-id>/delta

To update docker image:
 docker build --no-cache=true -t d3kod/aws-iot-non-cert-bridge .
 docker push d3kod/aws-iot-non-cert-bridge
