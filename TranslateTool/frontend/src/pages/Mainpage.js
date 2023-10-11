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

  const handleStopRecording = () => {
    if (mediaRecorder && recording) {
      mediaRecorder.stop();
      setRecording(false);
    }
  };

  const sendAudioToAPII = async () => {
    // Make the function async
    if (audioBlob) {
      const formData = new FormData();
      formData.append("file", audioBlob, "audio.wav");
      formData.append("from_lang", selectedLanguageLeft);
      formData.append("to_lang", selectedLanguageRight);

      const response = await fetch("http://localhost:7000/speech-to-text", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setTranslated(data.translation);
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
      color: "#8D8D8D",
      background: "white",
      boxShadow: "4px -4px 4px rgba(0, 0, 0, 0.25)",
      borderRadius: 11,
      border: "1px #1E2030 solid",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "12px",
      flexDirection: "column",
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
      display: "flex",
      justifyContent: "center",
      height: 378,
      width: 1236,
      alignItems: "center",
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
      gap: "30px",

      // marginTop: "10px",
    },
    button: {
      backgroundColor: "#FF6969" /* Green */,
      border: "none",
      color: "white",
      padding: "5px 8px",
      textAlign: "center",
      textDecoration: "none",
      display: "inline-block",
      fontSize: " 20px",
      borderRadius: "15px",
      marginLeft: "8px",
      boxShadow: "0px 4px 4px 0px rgba(0, 0, 0, 0.25)",
    },
    icons: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    },
    tag: {
      alignSelf: "flex-end",
    },
  };

  return (
    <>
      <div style={style.page}>
        <div style={style.tabs}>
          <div
            style={{
              ...style.tab,
              backgroundColor: "white",
              dropShadow: "none",
              border: tab === "ttos" ? "5px solid #FF6969" : "",
            }}
            id="ttos"
            onClick={() => {
              setTab("ttos");
              console.log(tab);
            }}
          >
            <div style={style.icons}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="37"
                viewBox="0 0 34 37"
                fill="none"
              >
                <path
                  opacity="0.2"
                  d="M30.8125 23.7031C30.8125 25.9376 28.9093 27.75 26.5625 27.75C24.2157 27.75 22.3125 25.9376 22.3125 23.7031C22.3125 21.4687 24.2157 19.6562 26.5625 19.6562C28.9093 19.6562 30.8125 21.4687 30.8125 23.7031ZM4.62451 21.9688H16.6254L10.625 8.09375L4.62451 21.9688Z"
                  fill="#9747FF"
                />
                <path
                  d="M11.5865 7.60089C11.5007 7.40225 11.3647 7.23429 11.1945 7.11664C11.0242 6.999 10.8267 6.93652 10.625 6.93652C10.4233 6.93652 10.2258 6.999 10.0555 7.11664C9.8852 7.23429 9.74922 7.40225 9.66341 7.60089L1.16341 27.2571C1.10402 27.3946 1.07009 27.5434 1.06355 27.695C1.057 27.8467 1.07798 27.9983 1.12527 28.1412C1.22079 28.4297 1.41773 28.6652 1.67275 28.7957C1.92777 28.9262 2.21999 28.9411 2.48513 28.8372C2.75027 28.7332 2.9666 28.5189 3.08654 28.2414L5.29919 23.125H15.9508L18.1634 28.2414C18.2228 28.3788 18.3065 28.5022 18.4097 28.6044C18.5129 28.7066 18.6335 28.7857 18.7648 28.8372C18.8961 28.8886 19.0354 28.9115 19.1748 28.9044C19.3142 28.8972 19.4509 28.8603 19.5772 28.7957C19.7035 28.731 19.8168 28.64 19.9108 28.5277C20.0047 28.4154 20.0774 28.2841 20.1247 28.1412C20.172 27.9983 20.1929 27.8467 20.1864 27.695C20.1799 27.5434 20.1459 27.3946 20.0865 27.2571L11.5865 7.60089ZM6.29927 20.8125L10.625 10.8095L14.9507 20.8125H6.29927ZM26.5625 13.875C24.8678 13.875 23.5436 14.3765 22.6272 15.3666C22.4354 15.5842 22.3293 15.8748 22.3315 16.1764C22.3338 16.478 22.4443 16.7667 22.6394 16.9809C22.8345 17.1951 23.0988 17.3179 23.3759 17.323C23.653 17.3282 23.921 17.2153 24.1227 17.0084C24.6274 16.4635 25.4508 16.1875 26.5625 16.1875C28.3196 16.1875 29.75 17.4883 29.75 19.0781V19.5435C28.8071 18.857 27.6969 18.4936 26.5625 18.5C23.6326 18.5 21.25 20.8342 21.25 23.7031C21.25 26.5721 23.6326 28.9062 26.5625 28.9062C27.6974 28.9117 28.8077 28.5467 29.75 27.8584C29.7632 28.165 29.8878 28.4534 30.0964 28.6601C30.305 28.8668 30.5805 28.9748 30.8623 28.9604C31.1441 28.9461 31.4091 28.8105 31.599 28.5835C31.7889 28.3565 31.8882 28.0567 31.875 27.75V19.0781C31.875 16.2092 29.4923 13.875 26.5625 13.875ZM26.5625 26.5937C24.8054 26.5937 23.375 25.293 23.375 23.7031C23.375 22.1133 24.8054 20.8125 26.5625 20.8125C28.3196 20.8125 29.75 22.1133 29.75 23.7031C29.75 25.293 28.3196 26.5937 26.5625 26.5937Z"
                  fill="#9747FF"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="16"
                viewBox="0 0 27 16"
                fill="none"
              >
                <path
                  d="M1 7C0.447715 7 -1.11063e-09 7.44772 0 8C1.11063e-09 8.55228 0.447715 9 1 9L1 7ZM26.6915 8.70711C27.082 8.31658 27.082 7.68342 26.6915 7.29289L20.3275 0.928932C19.937 0.538408 19.3038 0.538408 18.9133 0.928932C18.5228 1.31946 18.5228 1.95262 18.9133 2.34315L24.5702 8L18.9133 13.6569C18.5228 14.0474 18.5228 14.6805 18.9133 15.0711C19.3038 15.4616 19.937 15.4616 20.3275 15.0711L26.6915 8.70711ZM1 9L25.9844 9L25.9844 7L1 7L1 9Z"
                  fill="url(#paint0_linear_91_97)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_91_97"
                    x1="1.02344"
                    y1="8.11291"
                    x2="24.5234"
                    y2="8.11292"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#ACA7F6" />
                    <stop offset="1" stop-color="#E5D36B" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="28"
                viewBox="0 0 27 28"
                fill="none"
              >
                <path
                  d="M16.875 2.33325C14.6896 2.3334 12.5789 3.15795 10.9366 4.65309C9.29426 6.14824 8.23246 8.21188 7.94925 10.4591L5.418 14.5879C5.2515 14.8598 5.28525 15.2646 5.67113 15.4373L7.875 16.4149V19.8333C7.875 20.4521 8.11206 21.0456 8.53401 21.4832C8.95597 21.9208 9.52827 22.1666 10.125 22.1666H12.3739L12.375 25.6666H22.5V21.3569C22.5 19.9803 22.9905 18.6771 23.8995 17.5011C24.9595 16.1285 25.6241 14.4733 25.8166 12.7262C26.0091 10.9791 25.7218 9.21108 24.9876 7.62591C24.2535 6.04075 23.1025 4.70291 21.6672 3.76652C20.2319 2.83013 18.5707 2.3333 16.875 2.33325ZM3.20175 21.1189L5.07488 19.8239C3.96382 18.1004 3.37212 16.0731 3.375 13.9999C3.37149 11.9264 3.96282 9.89872 5.07375 8.17475L3.20175 6.87975C1.84363 8.9869 1.12072 11.4654 1.125 13.9999C1.125 16.6343 1.89 19.0819 3.20175 21.1189Z"
                  fill="#E1CF74"
                />
              </svg>
            </div>
            Text to speech
          </div>
          <div
            style={{
              ...style.tab,
              backgroundColor: "white",
              dropShadow: "none",
              border: tab === "ttot" ? "5px solid #FF6969" : "",
            }}
            id="ttot"
            onClick={() => {
              setTab("ttot");
              console.log(tab);
            }}
          >
            <div style={style.icons}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="37"
                viewBox="0 0 34 37"
                fill="none"
              >
                <path
                  opacity="0.2"
                  d="M30.8125 23.7031C30.8125 25.9376 28.9093 27.75 26.5625 27.75C24.2157 27.75 22.3125 25.9376 22.3125 23.7031C22.3125 21.4687 24.2157 19.6562 26.5625 19.6562C28.9093 19.6562 30.8125 21.4687 30.8125 23.7031ZM4.62451 21.9688H16.6254L10.625 8.09375L4.62451 21.9688Z"
                  fill="#9747FF"
                />
                <path
                  d="M11.5865 7.60089C11.5007 7.40225 11.3647 7.23429 11.1945 7.11664C11.0242 6.999 10.8267 6.93652 10.625 6.93652C10.4233 6.93652 10.2258 6.999 10.0555 7.11664C9.8852 7.23429 9.74922 7.40225 9.66341 7.60089L1.16341 27.2571C1.10402 27.3946 1.07009 27.5434 1.06355 27.695C1.057 27.8467 1.07798 27.9983 1.12527 28.1412C1.22079 28.4297 1.41773 28.6652 1.67275 28.7957C1.92777 28.9262 2.21999 28.9411 2.48513 28.8372C2.75027 28.7332 2.9666 28.5189 3.08654 28.2414L5.29919 23.125H15.9508L18.1634 28.2414C18.2228 28.3788 18.3065 28.5022 18.4097 28.6044C18.5129 28.7066 18.6335 28.7857 18.7648 28.8372C18.8961 28.8886 19.0354 28.9115 19.1748 28.9044C19.3142 28.8972 19.4509 28.8603 19.5772 28.7957C19.7035 28.731 19.8168 28.64 19.9108 28.5277C20.0047 28.4154 20.0774 28.2841 20.1247 28.1412C20.172 27.9983 20.1929 27.8467 20.1864 27.695C20.1799 27.5434 20.1459 27.3946 20.0865 27.2571L11.5865 7.60089ZM6.29927 20.8125L10.625 10.8095L14.9507 20.8125H6.29927ZM26.5625 13.875C24.8678 13.875 23.5436 14.3765 22.6272 15.3666C22.4354 15.5842 22.3293 15.8748 22.3315 16.1764C22.3338 16.478 22.4443 16.7667 22.6394 16.9809C22.8345 17.1951 23.0988 17.3179 23.3759 17.323C23.653 17.3282 23.921 17.2153 24.1227 17.0084C24.6274 16.4635 25.4508 16.1875 26.5625 16.1875C28.3196 16.1875 29.75 17.4883 29.75 19.0781V19.5435C28.8071 18.857 27.6969 18.4936 26.5625 18.5C23.6326 18.5 21.25 20.8342 21.25 23.7031C21.25 26.5721 23.6326 28.9062 26.5625 28.9062C27.6974 28.9117 28.8077 28.5467 29.75 27.8584C29.7632 28.165 29.8878 28.4534 30.0964 28.6601C30.305 28.8668 30.5805 28.9748 30.8623 28.9604C31.1441 28.9461 31.4091 28.8105 31.599 28.5835C31.7889 28.3565 31.8882 28.0567 31.875 27.75V19.0781C31.875 16.2092 29.4923 13.875 26.5625 13.875ZM26.5625 26.5937C24.8054 26.5937 23.375 25.293 23.375 23.7031C23.375 22.1133 24.8054 20.8125 26.5625 20.8125C28.3196 20.8125 29.75 22.1133 29.75 23.7031C29.75 25.293 28.3196 26.5937 26.5625 26.5937Z"
                  fill="#9747FF"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="16"
                viewBox="0 0 27 16"
                fill="none"
              >
                <path
                  d="M1 7C0.447715 7 -1.11063e-09 7.44772 0 8C1.11063e-09 8.55228 0.447715 9 1 9L1 7ZM26.6915 8.70711C27.082 8.31658 27.082 7.68342 26.6915 7.29289L20.3275 0.928932C19.937 0.538408 19.3038 0.538408 18.9133 0.928932C18.5228 1.31946 18.5228 1.95262 18.9133 2.34315L24.5702 8L18.9133 13.6569C18.5228 14.0474 18.5228 14.6805 18.9133 15.0711C19.3038 15.4616 19.937 15.4616 20.3275 15.0711L26.6915 8.70711ZM1 9L25.9844 9L25.9844 7L1 7L1 9Z"
                  fill="url(#paint0_linear_91_97)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_91_97"
                    x1="1.02344"
                    y1="8.11291"
                    x2="24.5234"
                    y2="8.11292"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#ACA7F6" />
                    <stop offset="1" stop-color="#E5D36B" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="37"
                viewBox="0 0 34 37"
                fill="none"
              >
                <path
                  opacity="0.2"
                  d="M30.8125 23.7031C30.8125 25.9376 28.9093 27.75 26.5625 27.75C24.2157 27.75 22.3125 25.9376 22.3125 23.7031C22.3125 21.4687 24.2157 19.6562 26.5625 19.6562C28.9093 19.6562 30.8125 21.4687 30.8125 23.7031ZM4.62451 21.9688H16.6254L10.625 8.09375L4.62451 21.9688Z"
                  fill="#E2D072"
                />
                <path
                  d="M11.5865 7.60089C11.5007 7.40225 11.3647 7.23429 11.1945 7.11664C11.0242 6.999 10.8267 6.93652 10.625 6.93652C10.4233 6.93652 10.2258 6.999 10.0555 7.11664C9.8852 7.23429 9.74922 7.40225 9.66341 7.60089L1.16341 27.2571C1.10402 27.3946 1.07009 27.5434 1.06355 27.695C1.057 27.8467 1.07798 27.9983 1.12527 28.1412C1.22079 28.4297 1.41773 28.6652 1.67275 28.7957C1.92777 28.9262 2.21999 28.9411 2.48513 28.8372C2.75027 28.7332 2.9666 28.5189 3.08654 28.2414L5.29919 23.125H15.9508L18.1634 28.2414C18.2228 28.3788 18.3065 28.5022 18.4097 28.6044C18.5129 28.7066 18.6335 28.7857 18.7648 28.8372C18.8961 28.8886 19.0354 28.9115 19.1748 28.9044C19.3142 28.8972 19.4509 28.8603 19.5772 28.7957C19.7035 28.731 19.8168 28.64 19.9108 28.5277C20.0047 28.4154 20.0774 28.2841 20.1247 28.1412C20.172 27.9983 20.1929 27.8467 20.1864 27.695C20.1799 27.5434 20.1459 27.3946 20.0865 27.2571L11.5865 7.60089ZM6.29927 20.8125L10.625 10.8095L14.9507 20.8125H6.29927ZM26.5625 13.875C24.8678 13.875 23.5436 14.3765 22.6272 15.3666C22.4354 15.5842 22.3293 15.8748 22.3315 16.1764C22.3338 16.478 22.4443 16.7667 22.6394 16.9809C22.8345 17.1951 23.0988 17.3179 23.3759 17.323C23.653 17.3282 23.921 17.2153 24.1227 17.0084C24.6274 16.4635 25.4508 16.1875 26.5625 16.1875C28.3196 16.1875 29.75 17.4883 29.75 19.0781V19.5435C28.8071 18.857 27.6969 18.4936 26.5625 18.5C23.6326 18.5 21.25 20.8342 21.25 23.7031C21.25 26.5721 23.6326 28.9062 26.5625 28.9062C27.6974 28.9117 28.8077 28.5467 29.75 27.8584C29.7632 28.165 29.8878 28.4534 30.0964 28.6601C30.305 28.8668 30.5805 28.9748 30.8623 28.9604C31.1441 28.9461 31.4091 28.8105 31.599 28.5835C31.7889 28.3565 31.8882 28.0567 31.875 27.75V19.0781C31.875 16.2092 29.4923 13.875 26.5625 13.875ZM26.5625 26.5937C24.8054 26.5937 23.375 25.293 23.375 23.7031C23.375 22.1133 24.8054 20.8125 26.5625 20.8125C28.3196 20.8125 29.75 22.1133 29.75 23.7031C29.75 25.293 28.3196 26.5937 26.5625 26.5937Z"
                  fill="#E2D072"
                />
              </svg>
            </div>
            Text to Text
          </div>
          <div
            style={{
              ...style.tab,
              backgroundColor: "white",
              dropShadow: "none",
              border: tab === "stos" ? "5px solid #FF6969" : "",
            }}
            id="stos"
            onClick={() => {
              setTab("stos");
              console.log(tab);
            }}
          >
            <div style={style.icons}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="28"
                viewBox="0 0 27 28"
                fill="none"
              >
                <path
                  d="M10.125 2.33325C12.3104 2.3334 14.4211 3.15795 16.0634 4.65309C17.7057 6.14824 18.7675 8.21188 19.0507 10.4591L21.582 14.5879C21.7485 14.8598 21.7147 15.2646 21.3289 15.4373L19.125 16.4149V19.8333C19.125 20.4521 18.8879 21.0456 18.466 21.4832C18.044 21.9208 17.4717 22.1666 16.875 22.1666H14.6261L14.625 25.6666H4.5V21.3569C4.5 19.9803 4.0095 18.6771 3.1005 17.5011C2.04047 16.1285 1.37592 14.4733 1.18341 12.7262C0.990894 10.9791 1.27825 9.21108 2.01237 7.62591C2.74649 6.04075 3.8975 4.70291 5.3328 3.76652C6.7681 2.83013 8.4293 2.3333 10.125 2.33325ZM23.7982 21.1189L21.9251 19.8239C23.0362 18.1004 23.6279 16.0731 23.625 13.9999C23.6285 11.9264 23.0372 9.89872 21.9262 8.17475L23.7982 6.87975C25.1564 8.9869 25.8793 11.4654 25.875 13.9999C25.875 16.6343 25.11 19.0819 23.7982 21.1189Z"
                  fill="#9790F6"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="16"
                viewBox="0 0 27 16"
                fill="none"
              >
                <path
                  d="M1 7C0.447715 7 -1.11063e-09 7.44772 0 8C1.11063e-09 8.55228 0.447715 9 1 9L1 7ZM26.6915 8.70711C27.082 8.31658 27.082 7.68342 26.6915 7.29289L20.3275 0.928932C19.937 0.538408 19.3038 0.538408 18.9133 0.928932C18.5228 1.31946 18.5228 1.95262 18.9133 2.34315L24.5702 8L18.9133 13.6569C18.5228 14.0474 18.5228 14.6805 18.9133 15.0711C19.3038 15.4616 19.937 15.4616 20.3275 15.0711L26.6915 8.70711ZM1 9L25.9844 9L25.9844 7L1 7L1 9Z"
                  fill="url(#paint0_linear_91_97)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_91_97"
                    x1="1.02344"
                    y1="8.11291"
                    x2="24.5234"
                    y2="8.11292"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#ACA7F6" />
                    <stop offset="1" stop-color="#E5D36B" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="28"
                viewBox="0 0 27 28"
                fill="none"
              >
                <path
                  d="M16.875 2.33325C14.6896 2.3334 12.5789 3.15795 10.9366 4.65309C9.29426 6.14824 8.23246 8.21188 7.94925 10.4591L5.418 14.5879C5.2515 14.8598 5.28525 15.2646 5.67113 15.4373L7.875 16.4149V19.8333C7.875 20.4521 8.11206 21.0456 8.53401 21.4832C8.95597 21.9208 9.52827 22.1666 10.125 22.1666H12.3739L12.375 25.6666H22.5V21.3569C22.5 19.9803 22.9905 18.6771 23.8995 17.5011C24.9595 16.1285 25.6241 14.4733 25.8166 12.7262C26.0091 10.9791 25.7218 9.21108 24.9876 7.62591C24.2535 6.04075 23.1025 4.70291 21.6672 3.76652C20.2319 2.83013 18.5707 2.3333 16.875 2.33325ZM3.20175 21.1189L5.07488 19.8239C3.96382 18.1004 3.37212 16.0731 3.375 13.9999C3.37149 11.9264 3.96282 9.89872 5.07375 8.17475L3.20175 6.87975C1.84363 8.9869 1.12072 11.4654 1.125 13.9999C1.125 16.6343 1.89 19.0819 3.20175 21.1189Z"
                  fill="#E1CF74"
                />
              </svg>
            </div>
            Speech to Speech
          </div>
          <div
            style={{
              ...style.tab,
              backgroundColor: "white",
              dropShadow: "none",
              border: tab === "stot" ? "5px solid #FF6969" : "",
            }}
            onClick={() => {
              setTab("stot");
              console.log(tab);
            }}
          >
            <div style={style.icons}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="28"
                viewBox="0 0 27 28"
                fill="none"
              >
                <path
                  d="M10.125 2.33325C12.3104 2.3334 14.4211 3.15795 16.0634 4.65309C17.7057 6.14824 18.7675 8.21188 19.0507 10.4591L21.582 14.5879C21.7485 14.8598 21.7147 15.2646 21.3289 15.4373L19.125 16.4149V19.8333C19.125 20.4521 18.8879 21.0456 18.466 21.4832C18.044 21.9208 17.4717 22.1666 16.875 22.1666H14.6261L14.625 25.6666H4.5V21.3569C4.5 19.9803 4.0095 18.6771 3.1005 17.5011C2.04047 16.1285 1.37592 14.4733 1.18341 12.7262C0.990894 10.9791 1.27825 9.21108 2.01237 7.62591C2.74649 6.04075 3.8975 4.70291 5.3328 3.76652C6.7681 2.83013 8.4293 2.3333 10.125 2.33325ZM23.7982 21.1189L21.9251 19.8239C23.0362 18.1004 23.6279 16.0731 23.625 13.9999C23.6285 11.9264 23.0372 9.89872 21.9262 8.17475L23.7982 6.87975C25.1564 8.9869 25.8793 11.4654 25.875 13.9999C25.875 16.6343 25.11 19.0819 23.7982 21.1189Z"
                  fill="#9790F6"
                />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="27"
                height="16"
                viewBox="0 0 27 16"
                fill="none"
              >
                <path
                  d="M1 7C0.447715 7 -1.11063e-09 7.44772 0 8C1.11063e-09 8.55228 0.447715 9 1 9L1 7ZM26.6915 8.70711C27.082 8.31658 27.082 7.68342 26.6915 7.29289L20.3275 0.928932C19.937 0.538408 19.3038 0.538408 18.9133 0.928932C18.5228 1.31946 18.5228 1.95262 18.9133 2.34315L24.5702 8L18.9133 13.6569C18.5228 14.0474 18.5228 14.6805 18.9133 15.0711C19.3038 15.4616 19.937 15.4616 20.3275 15.0711L26.6915 8.70711ZM1 9L25.9844 9L25.9844 7L1 7L1 9Z"
                  fill="url(#paint0_linear_91_97)"
                />
                <defs>
                  <linearGradient
                    id="paint0_linear_91_97"
                    x1="1.02344"
                    y1="8.11291"
                    x2="24.5234"
                    y2="8.11292"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#ACA7F6" />
                    <stop offset="1" stop-color="#E5D36B" />
                  </linearGradient>
                </defs>
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="34"
                height="37"
                viewBox="0 0 34 37"
                fill="none"
              >
                <path
                  opacity="0.2"
                  d="M30.8125 23.7031C30.8125 25.9376 28.9093 27.75 26.5625 27.75C24.2157 27.75 22.3125 25.9376 22.3125 23.7031C22.3125 21.4687 24.2157 19.6562 26.5625 19.6562C28.9093 19.6562 30.8125 21.4687 30.8125 23.7031ZM4.62451 21.9688H16.6254L10.625 8.09375L4.62451 21.9688Z"
                  fill="#E2D072"
                />
                <path
                  d="M11.5865 7.60089C11.5007 7.40225 11.3647 7.23429 11.1945 7.11664C11.0242 6.999 10.8267 6.93652 10.625 6.93652C10.4233 6.93652 10.2258 6.999 10.0555 7.11664C9.8852 7.23429 9.74922 7.40225 9.66341 7.60089L1.16341 27.2571C1.10402 27.3946 1.07009 27.5434 1.06355 27.695C1.057 27.8467 1.07798 27.9983 1.12527 28.1412C1.22079 28.4297 1.41773 28.6652 1.67275 28.7957C1.92777 28.9262 2.21999 28.9411 2.48513 28.8372C2.75027 28.7332 2.9666 28.5189 3.08654 28.2414L5.29919 23.125H15.9508L18.1634 28.2414C18.2228 28.3788 18.3065 28.5022 18.4097 28.6044C18.5129 28.7066 18.6335 28.7857 18.7648 28.8372C18.8961 28.8886 19.0354 28.9115 19.1748 28.9044C19.3142 28.8972 19.4509 28.8603 19.5772 28.7957C19.7035 28.731 19.8168 28.64 19.9108 28.5277C20.0047 28.4154 20.0774 28.2841 20.1247 28.1412C20.172 27.9983 20.1929 27.8467 20.1864 27.695C20.1799 27.5434 20.1459 27.3946 20.0865 27.2571L11.5865 7.60089ZM6.29927 20.8125L10.625 10.8095L14.9507 20.8125H6.29927ZM26.5625 13.875C24.8678 13.875 23.5436 14.3765 22.6272 15.3666C22.4354 15.5842 22.3293 15.8748 22.3315 16.1764C22.3338 16.478 22.4443 16.7667 22.6394 16.9809C22.8345 17.1951 23.0988 17.3179 23.3759 17.323C23.653 17.3282 23.921 17.2153 24.1227 17.0084C24.6274 16.4635 25.4508 16.1875 26.5625 16.1875C28.3196 16.1875 29.75 17.4883 29.75 19.0781V19.5435C28.8071 18.857 27.6969 18.4936 26.5625 18.5C23.6326 18.5 21.25 20.8342 21.25 23.7031C21.25 26.5721 23.6326 28.9062 26.5625 28.9062C27.6974 28.9117 28.8077 28.5467 29.75 27.8584C29.7632 28.165 29.8878 28.4534 30.0964 28.6601C30.305 28.8668 30.5805 28.9748 30.8623 28.9604C31.1441 28.9461 31.4091 28.8105 31.599 28.5835C31.7889 28.3565 31.8882 28.0567 31.875 27.75V19.0781C31.875 16.2092 29.4923 13.875 26.5625 13.875ZM26.5625 26.5937C24.8054 26.5937 23.375 25.293 23.375 23.7031C23.375 22.1133 24.8054 20.8125 26.5625 20.8125C28.3196 20.8125 29.75 22.1133 29.75 23.7031C29.75 25.293 28.3196 26.5937 26.5625 26.5937Z"
                  fill="#E2D072"
                />
              </svg>
            </div>
            Speech to Text
          </div>
          {/* <div style={style.tag}>MLVerse</div> */}
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
                <button style={style.button} onClick={sendAudioToAPII}>
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
                {/* {translated && <p>Translation: {translated}</p>} */}
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
