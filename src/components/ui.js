import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"

const INTERACTION_TIMEOUT = 10
const MAX_FILE_SIZE_IN_BYTES = 2000000

const Background = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  background: white;
`
const ContentContainer = styled.div`
  position: absolute;
  margin-left: 5vw;
  display: flex;
  flex-direction: column;
`



const Title = styled.div`
  margin-top: 5vh;
  font-size: 5vh;
  font-family: Arial;
`

const SearchInputField = styled.input`
  width: 30vh;
  height: 4vh;
  font-size: 3vh;
  border-radius: 2vh;
`

const SearchInputButton = styled.button`
  margin-top: 2vh;
  width: 20vh;
  height: 5vh;
  font-size: 2.5vh;
  border-radius: 2vh;
`
const Button = styled.button`
  margin-top: 2vh;
  width: 20vh;
  height: 5vh;
  font-size: 2.5vh;
  border-radius: 2vh;
`
const Description = styled.div`
  margin-top: 10vh;
  margin-bottom: 0.2vh;
  font-size: 3vh;
  font-family: Arial;
  font-weight: 600;
`

const Subtext = styled.div`
  margin-bottom: 1vh;
  font-size: 1.9vh;
  font-family: Arial;
`



const UploadElement = styled.input`
  visibility: hidden;
`

const UploadButton = styled.button`
  width: 20vh;
  height: 5vh;
  font-size: 2.5vh;
  border-radius: 2vh;
`

const ToggleElement = styled.input`
  width: 5vh;
  height: 5vh;
`

const TogglePanal = styled.div`
  display: flex;
`

export default ({ mqttClient }) => {
  const searchInputFieldRef = useRef()
  const uploadButtonRef = useRef()

  const [searchTimer, setSearchTimer] = useState(0)
  const [uploadTimer, setUploadTimer] = useState(0)

  useEffect(() => {
    const timeout = searchTimer > 0 && setTimeout(() => setSearchTimer(searchTimer - 1), 1000);
    return () => clearTimeout(timeout);
  }, [searchTimer]);

  useEffect(() => {
    const timeout = uploadTimer > 0 && setTimeout(() => setUploadTimer(uploadTimer - 1), 1000);
    return () => clearTimeout(timeout);
  }, [uploadTimer]);


  useEffect(() => {

   
    uploadButtonRef.current.addEventListener("change", (event) => {
      const files = event.target.files
      const fileReader = new FileReader()
      fileReader.readAsDataURL(files[0])
      const fileSize = files[0].size

      if (fileSize > MAX_FILE_SIZE_IN_BYTES) {
        alert("Image file to big!")
        throw("Image file to big!")
      }
      setUploadTimer(INTERACTION_TIMEOUT)

      fileReader.onload = () => {
          const base64Data = fileReader.result
          const string = base64Data.toString()
          console.log("publish", base64Data)

          mqttClient.publish(`${ process.env.APP_TOPIC}/addCustomImage`, string,  {qos: 1})
          searchInputFieldRef.current.default="Leave now!"
      }
    })
  }, [])


  return(
    <>
    <Background />
    <ContentContainer>
      <Title>Bubble Creator</Title>
      <Subtext>Create bubbles from...</Subtext>

      <Description>Topics in my head...</Description>
      <SearchInputField
        disabled={ searchTimer > 0 }
        placeholder="topic1, topic2, ..."
        ref={ searchInputFieldRef }/>
      <SearchInputButton
        disabled={ searchTimer > 0 }
        onClick={ () => {
          mqttClient.publish(`${ process.env.APP_TOPIC}/addTopics`,
          searchInputFieldRef.current.value.toString(),)
          setSearchTimer(INTERACTION_TIMEOUT)
        } }>
      {searchTimer > 0 ? searchTimer : "🦆 Find Images"}
      </SearchInputButton>
      <Description>Single Image</Description>
      <Subtext>Max. {MAX_FILE_SIZE_IN_BYTES/1000000}MB</Subtext>
      <UploadButton
        disabled={ uploadTimer > 0 }
        onClick={ () => uploadButtonRef.current.click() }>
      {uploadTimer > 0 ? uploadTimer : "Choose Image"}
      </UploadButton>
      <UploadElement
        ref={ uploadButtonRef }
        accept="image/png, image/jpeg"
        type="file"
        id="file-input"/>
      <Description>Admin Panel</Description>
      <TogglePanal>
        <div>
        <ToggleElement
          type="checkbox"
          onClick={() => mqttClient.publish(`${ process.env.APP_TOPIC}/toggleDiscoMode`, null)}/>
          <Subtext>Disco</Subtext>
        </div>
          <div>
          <ToggleElement
          type="checkbox"
          onClick={() => mqttClient.publish(`${ process.env.APP_TOPIC}/toggleNSFWMode`, null)}/>
          <Subtext>NSTFW</Subtext>
        </div>
      </TogglePanal>
        <Button onClick={() => mqttClient.publish(`${ process.env.APP_TOPIC}/clear`, null)}>Clear Bubbles</Button>
    </ContentContainer>

    </>
  )
}
