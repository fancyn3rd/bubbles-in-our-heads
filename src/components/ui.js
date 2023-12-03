import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import bubblePattern from "../../assets/bubbles.png";

const INTERACTION_TIMEOUT = 10;
const MAX_FILE_SIZE_IN_BYTES = 1000000;

const Background = styled.div`
  position: absolute;
  width: 100vw;
  height: 100vh;
  opacity: 0.08;
  background: url(${bubblePattern});
`;
const ContentContainer = styled.div`
  position: absolute;
  margin-top: 20px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
`;
const Title = styled.div`
  font-size: 45px;
  font-family: Arial;
`;

const IntroText = styled.div`
  font-size: 22px;
  font-family: Arial;
`;

const OptionHeadline = styled.div`
  margin-top: 50px;
  margin-bottom: 2px;
  font-size: 20px;
  font-family: Arial;
  font-weight: 600;
`;

const Infotext = styled.div`
  font-size: 16px;
  font-family: Arial;
`;

const InputField = styled.input`
  width: 190px;
  height: 30px;
  font-size: 20px;
  border-radius: 15px;
`;

const Button = styled.button`
  margin-top: 5px;
  width: 200px;
  height: 35px;
  font-size: 20px;
  border-radius: 15px;
`;

const InputButton = styled(Button)``;
const UploadButton = styled(Button)``;
const ClearButton = styled(Button)``;

const UploadElement = styled.input`
  visibility: hidden;
`;
const ToggleElement = styled.input`
  width: 40px;
  height: 40px;
`;

const TogglePanal = styled.div`
  display: flex;
`;

export default ({ mqttClient }) => {
  const discoToggleRef = useRef();
  const nsfwToggleRef = useRef();

  const searchInputFieldRef = useRef();
  const uploadButtonRef = useRef();

  const [searchTimer, setSearchTimer] = useState(0);
  const [uploadTimer, setUploadTimer] = useState(0);
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const timeout =
      searchTimer > 0 &&
      setTimeout(() => setSearchTimer(searchTimer - 1), 1000);
  }, [searchTimer]);

  useEffect(() => {
    const timeout =
      uploadTimer > 0 &&
      setTimeout(() => setUploadTimer(uploadTimer - 1), 1000);
  }, [uploadTimer]);

  useEffect(() => {
    uploadButtonRef.current.addEventListener("change", async () => {
      setUploadTimer(INTERACTION_TIMEOUT);
      const imageData = await loadImage();
      mqttClient.publish(`${process.env.APP_TOPIC}/addCustomImage`, imageData, {
        qos: 1,
      });
    });
  }, []);

  function requestAdminMode() {
    let password = prompt("Password?");

    if (password.toLowerCase() === process.env.ADMIN_PASSWORD) {
      setIsAdminMode(true);
    }
  }

  return (
    <>
      <Background />
      <ContentContainer>
        <Title onClick={() => (!isAdminMode ? requestAdminMode() : null)}>
          Bubble Creator
        </Title>
        <IntroText>Create bubbles from:</IntroText>

        <OptionHeadline>Topics in my head...</OptionHeadline>
        <InputField
          disabled={searchTimer > 0}
          placeholder="topic1, topic2, ..."
          ref={searchInputFieldRef}
        />
        <InputButton
          disabled={searchTimer > 0}
          onClick={() => {
            mqttClient.publish(
              `${process.env.APP_TOPIC}/addTopics`,
              searchInputFieldRef.current.value.toString()
            );
            setSearchTimer(INTERACTION_TIMEOUT);
          }}
        >
          {searchTimer > 0 ? searchTimer : "🦆 Find Images"}
        </InputButton>
        <OptionHeadline>Image on my device...</OptionHeadline>
        <Infotext>Max. {MAX_FILE_SIZE_IN_BYTES / 1000000}MB</Infotext>
        <UploadButton
          disabled={uploadTimer > 0}
          onClick={() => uploadButtonRef.current.click()}
        >
          {uploadTimer > 0 ? uploadTimer : "Choose Image"}
        </UploadButton>
        <UploadElement
          ref={uploadButtonRef}
          accept="image/png, image/jpeg"
          type="file"
          id="file-input"
        />
        {isAdminMode && (
          <>
            <OptionHeadline>Admin Panel</OptionHeadline>
            <TogglePanal>
              <div>
                <ToggleElement
                  type="checkbox"
                  ref={discoToggleRef}
                  onClick={() => {
                    mqttClient.publish(
                      `${process.env.APP_TOPIC}/toggleDiscoMode`,
                      discoToggleRef.current.checked.toString()
                    );
                  }}
                />
                <Infotext>Disco</Infotext>
              </div>
              <div>
                <ToggleElement
                  type="checkbox"
                  ref={nsfwToggleRef}
                  onClick={() =>
                    mqttClient.publish(
                      `${process.env.APP_TOPIC}/toggleNSFWMode`,
                      nsfwToggleRef.current.checked.toString()
                    )
                  }
                />
                <Infotext>NSTFW</Infotext>
              </div>
            </TogglePanal>
            <ClearButton
              onClick={() =>
                mqttClient.publish(`${process.env.APP_TOPIC}/clear`, null)
              }
            >
              Clear Bubbles
            </ClearButton>
          </>
        )}
      </ContentContainer>
    </>
  );
};

async function loadImage() {
  const compressedData = await new Promise((resolve) => {
    const fileReader = new FileReader();
    const file = event.target.files[0];
    const fileSize = file.size;

    const compressFactor = fileSize > MAX_FILE_SIZE_IN_BYTES ? 0.2 : 1;
    fileReader.readAsDataURL(file);

    fileReader.addEventListener("load", async (event) => {
      const image = new Image();
      image.src = event.target.result;

      image.addEventListener("load", () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        canvas.width = image.width;
        canvas.height = image.height;
        context.drawImage(image, 0, 0);

        // Compress the image using the canvas and get the compressed data
        const compressedData = canvas.toDataURL("image/jpeg", compressFactor);
        resolve(compressedData);
      });
    });
  });
  return compressedData;
}
