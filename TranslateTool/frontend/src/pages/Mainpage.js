import React, { useEffect, useState, useRef } from "react";
import { UserState } from "../context/UserProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import DropdownMenu from "../components/miscellaneous/DropdownMenu";
import axios from "axios";
//import Recorder from "react-recorder";

import {
  Container,
  Box,
  Text,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";

const Mainpage = () => {
  const navigate = useNavigate();
  const { user } = UserState();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("userInfo"));

    if (user) {
      //history.push("/chats");
      navigate("/chats");
    }
  }, [navigate]);

  const [tab, setTab] = useState();
  const [inputValue, setInputValue] = useState("");
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [audioSrc, setAudioSrc] = useState(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const recorder = useRef(null);

  const [selectedLanguageLeft, setSelectedLanguageLeft] = useState("English");
  const [selectedLanguageRight, setSelectedLanguageRight] = useState("English");
  const [translated, setTranslated] = useState();

  const handleClick = async () => {
    const formData = {
      from_lang: selectedLanguageLeft,
      to_lang: selectedLanguageRight,
      query: inputValue,
    };
    //console.log(formData);

    axios
      .post("http://localhost:7000/text-to-text", formData)
      .then((response) => {
        console.log(response.data);
        const data = response.data.translated_text;
        setTranslated(data);
      })
      .catch((error) => {
        console.log(error);
      });
    //Text to speech
    try {
      const response = await axios.post(
        "http://localhost:7000/text-to-speech",
        {
          from_lang: selectedLanguageLeft,
          to_lang: selectedLanguageRight,
          query: inputValue,
        },
        {
          responseType: "blob", // Set the response type to 'blob' to handle binary data
        }
      );

      if (response.status === 200) {
        // Create a blob URL from the response data
        const blob = new Blob([response.data], { type: "audio/wav" });
        const audioUrl = URL.createObjectURL(blob);

        // Create a temporary audio element and set its source to the blob URL
        const audioElement = new Audio(audioUrl);

        // Play the audio
        audioElement.play();
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const handleStartRecording = () => {
    recorder.current.start();
  };

  const handleStopRecording = async () => {
    const audioData = await recorder.current.stop();
    setAudioBlob(audioData);
  };
  const handleSendAudio = async () => {
    if (audioBlob) {
      const formData = new FormData();
      formData.append("file", audioBlob);
      try {
        const response = await axios.post(
          "http://localhost:7000/speech-to-text",
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
        // Handle the response, e.g., display transcription and translation
        console.log("Transcription:", response.data.transcription);
        console.log("Translation:", response.data.translation);
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const startRecording = () => {
    setRecording(true);
    setTranslated(""); // Clear previous translation if any

    // Start recording audio
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const recorder = new MediaRecorder(stream);
        setMediaRecorder(recorder); // Set mediaRecorder in state

        const audioChunks = [];

        recorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        recorder.onstop = () => {
          const audioBlob = new Blob(audioChunks, { type: "audio/wav" });
          setAudioBlob(audioBlob);
        };

        recorder.start();
      })
      .catch((error) => console.error("Error:", error));
  };

  const stopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const sendAudioToAPI = async () => {
    // Make the function async
    if (audioBlob) {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      formData.append("from_lang", selectedLanguageLeft);
      formData.append("to_lang", selectedLanguageRight);

      try {
        const response = await fetch("http://localhost:7000/speech-to-text", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          setTranslated(data.translation);

          // Store the user's query input here

          const textToSpeechResponse = await axios.post(
            "http://localhost:7000/text-to-speech",
            {
              from_lang: selectedLanguageLeft,
              to_lang: selectedLanguageRight,
              query: data.translation,
            },
            {
              responseType: "blob", // Set the response type to 'blob' to handle binary data
            }
          );

          if (textToSpeechResponse.status === 200) {
            // Create a blob URL from the response data
            const blob = new Blob([textToSpeechResponse.data], {
              type: "audio/wav",
            });
            const audioUrl = URL.createObjectURL(blob);

            // Create a temporary audio element and set its source to the blob URL
            const audioElement = new Audio(audioUrl);

            // Play the audio
            audioElement.play();
          }
        } else {
          console.error("Error:", response.statusText);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
  };

  const style = {
    page: {
      background: "#33354F",
      height: "98vh",
      width: "100%",
      color: "white",
      //textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      margin: 0,
      padding: 0,
    },
    tabs: {
      width: "100vw",
      position: "absolute",
      top: "10px",
      left: "60px",
      height: "19vh",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      paddingLeft: "30px",
      borderBotton: "1px solid black",
    },
    tab: {
      width: 150,
      height: 78,
      left: 16,
      top: 90,
      color: "black",
      background: "white",
      boxShadow: "4px -4px 4px rgba(0, 0, 0, 0.25)",
      borderRadius: 11,
      border: "1px #1E2030 solid",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    box: {
      width: "1236px",
      height: "438px",
      position: "absolute",
      top: "19vh",
      //borderRadius: "20px",
      border: "3px solid #FFF",
      background: "#FFF",
      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },

    boxtop: {
      display: "flex",
      height: 55,
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      padding: 30,
    },
    textbox: {
      //marginLeft: 100,
      display: "flex",
      justifyContent: "center",
      height: 378,
      width: 1236,
      alignItems: "center",
      // padding: 30,
      //background: "#FFF",
    },

    rightBox: {
      height: 387,
      width: 610,
      color: "#444444",
      paddingTop: "32px",
      background: "#FFF",
      border: "1px solid black",
      padding: "31px",
      textAlign: "left",
      fontSize: "25px",
      fontWeight: "450",
      // display: "flex",
      // flexDirection: "column",
      //justifyContent: "space-center",
    },

    api: {
      color: "black",
    },
    textarea: {
      width: "618px",
      height: "387px",
      border: "1px solid black",
      color: "black",
      padding: "31px",
      fontSize: "25px",
      fontWeight: "450",
    },
    buttons: {
      width: "1236px",
      display: "flex",
      justifyContent: "space-evenly",
      // marginTop: "10px",
    },
    button: {
      backgroundColor: "#4CAF50" /* Green */,
      border: "none",
      color: "white",
      padding: "7px 12px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: " 10px",
    },
  };

  return (
    <>
      <div style={style.page}>
        <div style={style.tabs}>
          <div
            style={style.tab}
            id="ttos"
            onClick={() => {
              setTab("ttos");
              console.log(tab);
            }}
          >
            Text to speech
          </div>
          <div
            style={style.tab}
            id="ttot"
            onClick={() => {
              setTab("ttot");
              console.log(tab);
            }}
          >
            Text to Text
          </div>
          <div
            style={style.tab}
            id="stos"
            onClick={() => {
              setTab("stos");
              console.log(tab);
            }}
          >
            Speech to Speech
          </div>
          <div
            style={style.tab}
            onClick={() => {
              setTab("stot");
              console.log(tab);
            }}
          >
            Speech to Text
          </div>
        </div>

        <div style={style.box}>
          <div style={style.boxtop}>
            <DropdownMenu
              selectedLanguage={selectedLanguageLeft}
              setSelectedLanguage={setSelectedLanguageLeft}
            ></DropdownMenu>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="35"
              viewBox="0 0 32 45"
              fill="none"
            >
              <path
                d="M2 10.5C1.17157 10.5 0.5 11.1716 0.5 12C0.5 12.8284 1.17157 13.5 2 13.5V10.5ZM31.0607 13.0607C31.6464 12.4749 31.6464 11.5251 31.0607 10.9393L21.5147 1.3934C20.9289 0.807611 19.9792 0.807611 19.3934 1.3934C18.8076 1.97919 18.8076 2.92893 19.3934 3.51472L27.8787 12L19.3934 20.4853C18.8076 21.0711 18.8076 22.0208 19.3934 22.6066C19.9792 23.1924 20.9289 23.1924 21.5147 22.6066L31.0607 13.0607ZM2 13.5H30V10.5H2V13.5Z"
                fill="#B3B3B3"
              />
              <path
                d="M30 34.5C30.8284 34.5 31.5 33.8284 31.5 33C31.5 32.1716 30.8284 31.5 30 31.5V34.5ZM0.939341 31.9393C0.353554 32.5251 0.353554 33.4749 0.939341 34.0607L10.4853 43.6066C11.0711 44.1924 12.0208 44.1924 12.6066 43.6066C13.1924 43.0208 13.1924 42.0711 12.6066 41.4853L4.12132 33L12.6066 24.5147C13.1924 23.9289 13.1924 22.9792 12.6066 22.3934C12.0208 21.8076 11.0711 21.8076 10.4853 22.3934L0.939341 31.9393ZM30 31.5L2 31.5V34.5H30V31.5Z"
                fill="#B3B3B3"
              />
            </svg>
            <DropdownMenu
              selectedLanguage={selectedLanguageRight}
              setSelectedLanguage={setSelectedLanguageRight}
            ></DropdownMenu>
          </div>

          <div style={style.textbox}>
            {/* <div style={style.leftBox}> */}
            {/* <input
                type="text-area"
                placeholder="Enter text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              /> */}
            <textarea
              style={style.textarea}
              value={inputValue}
              placeholder="Type Here..."
              onChange={(e) => setInputValue(e.target.value)}
            ></textarea>
            {/* </div> */}
            {/* Right Box - State Display */}
            <div style={style.rightBox}>
              <p>Translated Text:</p>
              <div>{translated}</div>
            </div>
          </div>
          <div style={style.buttons}>
            {tab === "ttot" || tab === "ttos" ? (
              <button style={style.button} onClick={handleClick}>
                Submit
              </button>
            ) : (
              ""
            )}
            {tab === "stot" ? (
              <div>
                {/* <Recorder ref={recorder} onStop={handleStopRecording} /> */}
                <button style={style.button} onClick={handleStartRecording}>
                  Start Recording
                </button>
                <button style={style.button} onClick={handleStopRecording}>
                  Stop Recording
                </button>
                <button style={style.button} onClick={handleSendAudio}>
                  Send Audio
                </button>
              </div>
            ) : (
              ""
            )}
            {tab === "stos" ? (
              <div style={style.api}>
                <button
                  style={style.button}
                  onClick={startRecording}
                  disabled={recording}
                >
                  {recording ? "Recording..." : "Start Recording"}
                </button>
                <button
                  style={style.button}
                  onClick={stopRecording}
                  disabled={!recording}
                >
                  Stop Recording
                </button>
                <button
                  style={style.button}
                  onClick={sendAudioToAPI}
                  disabled={!audioBlob}
                >
                  Translate Audio
                </button>
                {translated && <p>Translation: {translated}</p>}
              </div>
            ) : (
              ""
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Mainpage;
