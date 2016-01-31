FROM node:latest
WORKDIR /app
RUN apt-get update && \
    apt-get --yes --force-yes install git && \
    git clone https://github.com/d3alek/aws-iot-non-cert-bridge && \
    cd aws-iot-non-cert-bridge && \
    npm install 
