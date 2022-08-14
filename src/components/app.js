import React from "react"
import Canvas from "./canvas"
import UserInterface from "./ui"

export default ({ mqttClient, config }) => {
  if (isMoblieDevice()) {
    history.pushState({}, "user interface", "/ui");
  }
  
  const route = window.location.pathname

  return(
    <>
    { route === "/ui" &&
        <UserInterface
          mqttClient={ mqttClient } />
    }
    { route === "/" &&
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