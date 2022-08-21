import React, { useEffect, useRef, useState } from "react"
import styled from "styled-components"
import bubblePattern from "../../assets/bubbles.png"

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
  margin-top: 20px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
`
const Title = styled.div`
  font-size: 45px;
  font-family: Arial;
`

const IntroText = styled.div`
  font-size: 22px;
  font-family: Arial;
`

const OptionHeadline = styled.div`
  margin-top: 50px;
  margin-bottom: 2px;
  font-size: 20px;
  font-family: Arial;
  font-weight: 600;
`

const Infotext = styled.div`
  font-size: 16px;
  font-family: Arial;
`

const InputField = styled.input`
  width: 190px;
  height: 30px;
  font-size: 20px;
  border-radius: 15px;
`

const Button = styled.button`
  margin-top: 5px;
  width: 200px;
  height: 35px;
  font-size: 20px;
  border-radius: 15px;
`

const InputButton = styled(Button)``
const UploadButton = styled(Button)``
const ClearButton = styled(Button)``





const UploadElement = styled.input`
  visibility: hidden;
`



const ToggleElement = styled.input`
  width: 40px;
  height: 40px;
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
