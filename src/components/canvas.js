import "regenerator-runtime"
import * as PIXI from 'pixi.js'
import React, { useRef, useEffect } from "react"
import * as settings from "./settings"

import { image_search } from "duckduckgo-images-api"

const MAX_TEXTURES = 50
const MAX_IMAGES_PER_SEARCH = 5

const textures = []
let texturePositionCounter = 0
let discoMode = false
let NSTFWMode = false


let maxImageWidth = 100
let maxImageHeight = 100

let textureCycleCounter = 0

export default () => {

    const pixiAppRef = useRef()
    const circleContainers = []

    useEffect(() => {
        const pixiApp = new PIXI.Application({
            width: window.innerWidth,
            height: window.innerHeight,
            backgroundColor: 0x000000,
            antialias: true
        })

        pixiAppRef.current.appendChild(pixiApp.view)

        main(pixiApp, circleContainers, textureCycleCounter)

        const pixiTicker = pixiApp.ticker.add((delta) => {
            for (let i = 0; i < circleContainers.length; i++) {
                moveWavy(circleContainers[i], delta)
                moveUpwards(circleContainers[i], delta)
            }
        })

        return () => {
            pixiAppRef.current.removeChild(pixiApp.view)
            pixiTicker.stop()
        }
    }, [])

    return (
        <div ref={ pixiAppRef }  />
    )
}

function main(pixiApp, circleContainers, textureCounter) {
    createTextures()
    createCircles(pixiApp, circleContainers, textureCounter)   
}

async function createTextures() {
    const urlParamsTopics = new URLSearchParams(window.location.search).get("topics");

    if (urlParamsTopics) {
        const topics = urlParamsTopics.split(",")
        for (const topic of topics) {
             await searchNewTextures(topic) 
        }
    }
}


async function searchNewTextures(topic) {
    const useModerateSearch = !NSTFWMode
    image_search({ query: topic, moderate: !NSTFWMode, iterations:1 })
        .then(results=> {
            for (let i = 0; i < MAX_IMAGES_PER_SEARCH; i++) {
                const imageUrl = results[i].image
                if (imageUrl.endsWith(".jpg") || imageUrl.endsWith(".png") || imageUrl.endsWith(".gif")) {
                    loadTexture(imageUrl)
                }
            }
        })
}

function loadTexture(url) {
    const texture = PIXI.Texture.from(url)

    texture.baseTexture.on('error', () => {
        console.error("Error on:", url)
    })
    
    texture.baseTexture.on('loaded', () => {
        textures[texturePositionCounter] = texture

        texturePositionCounter = texturePositionCounter < MAX_TEXTURES ?
            texturePositionCounter + 1 : 0
    })
}

function createCircles(pixiApp, circleContainers) {
    for (let i = 0; i < 50; i++) {
        const container = new PIXI.Container()
        const texture = textures[randomRange(0, textures.length - 1)]
       
        maxImageWidth = randomRange(100,400)
        maxImageHeight = randomRange(100,400)

        const sprite = new PIXI.Sprite(texture)
        sprite.blendMode = PIXI.BLEND_MODES[settings.blendModes[randomRange(0, settings.blendModes.length)]]

        container.updateCircle = () => updateCircle(sprite, container)
        container.addChild(sprite)

        setContainerProps(container)
        adjustScaleToTexture(container)

        container.startPosition = randomRange(-10, pixiApp.renderer.width - 100)
        container.position.x = container.startPosition
        container.position.y = pixiApp.renderer.height + 100

        circleContainers.push(container)
        pixiApp.stage.addChild(container) 

        drawMask(container, sprite)
    }  
}

function updateCircle(sprite, container) {
    sprite.blendMode = PIXI.BLEND_MODES[settings.blendModes[randomRange(0, settings.blendModes.length)]]

    sprite.tint = discoMode ?
        PIXI.utils.rgb2hex(settings.colors[randomRange(0, settings.colors.length)]) :
        0xFFFFFF
    
    if (textures.length > 0) {
        textureCycleCounter < textures.length - 1 ? textureCycleCounter++ : textureCycleCounter = 0
        const texture = textures[textureCycleCounter]
        maxImageWidth = randomRange(100,400)
        maxImageHeight = randomRange(100,400)
        sprite.texture = texture

        container.removeChild(container.children[1])
        container.scale.x = 1
        container.scale.y = 1

        adjustScaleToTexture(container)
        drawMask(container, sprite)
    }
}

function setContainerProps(container) {
    container.speed = randomRange(1,4)
    container.yOffset = randomRange(5,40)

    const directionRND = randomRange(0,50)
    container.isMoveingRight = directionRND > 25 ? true : false
}

function adjustScaleToTexture(container) {
    if (container.width > maxImageWidth || container.height > maxImageHeight) {
        container.scale.x -= 0.01
        container.scale.y -= 0.01
        adjustScaleToTexture(container)
    }
}

function drawMask(container, sprite) {
    const maskShape = new PIXI.Graphics()
    const radius = sprite.width < sprite.height ? sprite.width/2 : sprite.height/2
    maskShape.beginFill(0xFF3300);
    maskShape.drawCircle(sprite.width/2, sprite.height/2, radius)
    maskShape.endFill();

    container.mask = maskShape
    container.addChild(maskShape)
}

function moveWavy(container, delta) {
    if (container.isMoveingRight) {
        if (container.x < container.startPosition + container.yOffset) {
            container.x += container.speed * delta
        } else {
            container.isMoveingRight = false
        }
    }

    if (!container.isMoveingRight) {
        if (container.x > container.startPosition - container.yOffset) {
            container.x -= container.speed * delta
        } else {
            container.isMoveingRight = true
        }
    }
}

function moveUpwards(container, delta) {
    if (container.getBounds().y > container.height * -1) {
        container.y -= container.speed * delta
    } else {
        container.position.y = window.innerHeight
        container.updateCircle()
        setContainerProps(container)
    }
}

function randomRange(min, max) {
    return Math.floor(Math.random() * (max - 1 - min + 1) + min)
}

export function parseTopics(topicString) {
    const topics = topicString.split(",")
    for (const topic of topics) {
        searchNewTextures(topic) 
    }
}

export function parseImage(ImageData) {
    loadTexture(ImageData)
}

export function toggleNSFWMode() {
    NSTFWMode = !NSTFWMode
    console.log("NSFW mode: ", NSTFWMode)
}

export function toggleDiscoMode() {
    discoMode = !discoMode
    console.log("NSFW mode: ", discoMode)

}