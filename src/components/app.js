import React from "react"
import Canvas from "./canvas"
import UserInterface from "./ui"

export default ({ mqttClient }) => {
  return(
    <>
    { isMoblieDevice() &&
        <UserInterface
          mqttClient={ mqttClient } />
    }
    { !isMoblieDevice() &&
        <Canvas />
    }
    </>
  )
}

function isMoblieDevice() {
  const mobileUserAgents = [
      /Android/i,
      /webOS/i,
      /iPhone/i,
      /iPad/i,
      /iPod/i,
      /BlackBerry/i,
      /Windows Phone/i
  ]
  
  return mobileUserAgents.some((userAgent) => {
      return navigator.userAgent.match(userAgent)
  })
}