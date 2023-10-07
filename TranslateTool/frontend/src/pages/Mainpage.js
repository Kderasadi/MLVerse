import React, { useEffect, useState, useRef } from "react";
import { UserState } from "../context/UserProvider";
import SideDrawer from "../components/miscellaneous/SideDrawer";
import { useNavigate } from "react-router-dom";
import "./styles.css";
import DropdownMenu from "../components/miscellaneous/DropdownMenu";
import axios from "axios";

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

  // const handleClick = async () => {
  //   const formData = {
  //     from_lang: selectedLanguageLeft,
  //     to_lang: selectedLanguageRight,
  //     query: inputValue,
  //   };
  //   console.log(formData);

  //   axios
  //     .post("http://localhost:7000/text-to-text", formData)
  //     .then((response) => {
  //       console.log(response.data);
  //       const data = response.data.translated_text;
  //       setTranslated(data);
  //     })
  //     .catch((error) => {
  //       console.log(error);
  //     });

  // };

  //Text to Speech
  const [audioSrc, setAudioSrc] = useState(null);
  // Store the user's query input here
  const handleClick = async () => {
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

  // const [audioBlob, setAudioBlob] = useState(null);

  // const recorder = useRef(null);

  // const handleStartRecording = () => {
  //   recorder.current.start();
  // };

  // const handleStopRecording = async () => {
  //   const audioData = await recorder.current.stop();
  //   setAudioBlob(audioData);
  // };

  // const handleSendAudio = async () => {
  //   if (audioBlob) {
  //     const formData = new FormData();
  //     formData.append("file", audioBlob);

  //     try {
  //       const response = await axios.post(
  //         "http://localhost:7000/speech-to-text",
  //         formData,
  //         {
  //           headers: {
  //             "Content-Type": "multipart/form-data",
  //           },
  //         }
  //       );

  //       // Handle the response, e.g., display transcription and translation
  //       console.log("Transcription:", response.data.transcription);
  //       console.log("Translation:", response.data.translation);
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   }
  // };

  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);

  const [mediaRecorder, setMediaRecorder] = useState(null);

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
      background: "#2B2D42",
      height: "96vh",
      width: "100vw",
      color: "white",
      textAlign: "center",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      margin: 0,
    },
    tabs: {
      width: "100vw",
      position: "absolute",
      top: "10px",
      left: "60px",
      height: "10vw",
      display: "flex",
      alignItems: "center",
      gap: "5px",
      paddingLeft: "30px",
      borderBotton: "1px solid black",
    },
    tab: {
      width: 227,
      height: 90,
      left: 16,
      top: 90,

      background: "#2B2D42",
      boxShadow: "4px -4px 4px rgba(0, 0, 0, 0.25)",
      borderRadius: 11,
      border: "1px #1E2030 solid",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },

    box: {
      width: "1236px",
      height: "450px",
      position: "absolute",
      top: "19vh",
      borderRadius: "20px",
      border: "3px solid #FFF",
      background: "#FFF",
      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
    },

    boxtop: {
      display: "flex",
      height: 50,
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 10,
      padding: 30,
    },
    textbox: {
      marginLeft: 100,
      display: "flex",
      justifyContent: "space-between",
      height: 500,
      width: 1000,
      alignItems: "center",
      padding: 30,
      background: "#FFF",
    },
    leftBox: {
      height: 100,
      width: 100,
      color: "black",
      padding: 20,
      background: "#FFF",
    },
    rightBox: {
      height: 300,
      width: 300,
      color: "black",
      paddingTop: 100,
      background: "#FFF",
      border: "1px solid black",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-center",
    },

    api: {
      color: "black",
    },
  };
  const [selectedLanguageLeft, setSelectedLanguageLeft] = useState("English");
  const [selectedLanguageRight, setSelectedLanguageRight] = useState("English");
  const [translated, setTranslated] = useState();

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

            <DropdownMenu
              selectedLanguage={selectedLanguageRight}
              setSelectedLanguage={setSelectedLanguageRight}
            ></DropdownMenu>
          </div>

          <div style={style.textbox}>
            <div style={style.leftBox}>
              <input
                type="text-field"
                placeholder="Enter text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            {/* Right Box - State Display */}
            <div style={style.rightBox}>
              <p>Translated Text:</p>
              <div>{translated}</div>
            </div>
          </div>
          {/* <button onClick={handleClick}>Submit</button> */}
          {/* <div>
            <Recorder ref={recorder} onStop={handleStopRecording} />
            <button onClick={handleStartRecording}>Start Recording</button>
            <button onClick={handleStopRecording}>Stop Recording</button>
            <button onClick={handleSendAudio}>Send Audio</button>
          </div> */}
          <div style={style.api}>
            <button onClick={startRecording} disabled={recording}>
              {recording ? "Recording..." : "Start Recording"}
            </button>
            <button onClick={stopRecording} disabled={!recording}>
              Stop Recording
            </button>
            <button onClick={sendAudioToAPI} disabled={!audioBlob}>
              Translate Audio
            </button>
            {translated && <p>Translation: {translated}</p>}
          </div>
        </div>
      </div>
    </>
  );
};

export default Mainpage;
