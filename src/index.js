import React from "react"
import ReactDOM from "react-dom"
import mqtt from "mqtt"
import App from "./components/app"
import { parseTopics, parseImage, toggleDiscoMode, toggleNSFWMode } from "./components/canvas"

const client = mqtt.connect(
  process.env.MQTT_HOST,
  {
    port: process.env.MQTT_PORT,
    username: process.env.MQTT_USERNAME,
    password: process.env.MQTT_PASSWORD
  }
)

client.on('error', function (error) {
  console.log(error);
});

client.on('disconnect', function () {
  console.log("error");
});

client.on("connect", function () {
  console.log("Mqtt client connected")

  client.subscribe(`${ process.env.APP_TOPIC }/addTopics`)
  client.subscribe(`${ process.env.APP_TOPIC }/addCustomImage`)
  client.subscribe(`${ process.env.APP_TOPIC }/toggleNSFWMode`)
  client.subscribe(`${ process.env.APP_TOPIC }/toggleDiscoMode`)
  client.subscribe(`${ process.env.APP_TOPIC }/clear`)
})

client.on("message", (topic, payload) => {
  console.log("Incomming mqtt message")
  console.log("TOPIC:", topic, payload)
  if (topic.toString() == `${ process.env.APP_TOPIC}/addTopics`) {
    parseTopics(payload.toString())
  }
  if (topic.toString() == `${ process.env.APP_TOPIC}/addCustomImage`) {
    parseImage(payload.toString())
  }
  if (topic.toString() == `${ process.env.APP_TOPIC}/toggleDiscoMode`) {
    toggleDiscoMode(payload.toString())
  }
  if (topic.toString() == `${ process.env.APP_TOPIC}/toggleNSFWMode`) {
    toggleNSFWMode(payload.toString())
  }
  if (topic.toString() == `${ process.env.APP_TOPIC}/clear`) {
    if (window.location.pathname === "/") {
      window.location.reload()
    }
  }
})

ReactDOM.render(
  <App
    mqttClient={ client } />,
  document.getElementById('root')
);