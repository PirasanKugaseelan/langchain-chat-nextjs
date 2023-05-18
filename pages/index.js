import { useState, useRef, useEffect } from 'react';
import Head from 'next/head';
import styles from '../styles/Home.module.css';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import CircularProgress from '@mui/material/CircularProgress';

export default function Home() {
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi there! How can I help?" }
  ]);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioData, setAudioData] = useState([]);
  
  const messageListRef = useRef(null);
  const textAreaRef = useRef(null);

  // Auto scroll chat to bottom
  useEffect(() => {
    const messageList = messageListRef.current;
    messageList.scrollTop = messageList.scrollHeight;
  }, [messages]);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const audioBlob = new Blob(audioData, { type: 'audio/webm' });
    const formData = new FormData();
    formData.append('audio', audioBlob);

    // Send audio data to API
    const response = await fetch("/api/transcribe", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      handleError();
      return;
    }

    const data = await response.json();

    setMessages((prevMessages) => [...prevMessages, { role: "user", content: data.transcript }]);
    setUserInput(data.transcript);

    const context = [...messages, { role: "user", content: userInput }];

    // Send chat history to API
    const chatResponse = await fetch("/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ messages: context }),
    });

    if (!chatResponse.ok) {
      handleError();
      return;
    }

    const chatData = await chatResponse.json();
    setMessages((prevMessages) => [...prevMessages, { role: "assistant", content: chatData.result.content }]);
    setLoading(false);
    setAudioData([]);
  };

  // Start recording
  const startRecording = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const mediaRecorder = new MediaRecorder(stream);
      setMediaRecorder(mediaRecorder);

      mediaRecorder.start();

      mediaRecorder.ondataavailable = (e) => {
        setAudioData(prevAudioData => [...prevAudioData, e.data]);
      };
    });
  }

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
    }
  }

  return (
    <>
      <Head>
        <title>GPT-4 Chat UI</title>
        <meta name="description" content="GPT-4 interface" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.topnav}>
        {/* Rest of your JSX ... */}
      </div>
      <main className={styles.main}>
        <div className={styles.cloud}>
          {/* Rest of your JSX ... */}
        </div>
        <div className={styles.center}>
          <div className={styles.cloudform}>
            <form onSubmit={handleSubmit}>
              <button
                type="button"
                disabled={loading}
                onClick={startRecording}
              >
                Start Recording
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={stopRecording}
              >
                Stop Recording
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.generatebutton}
              >
                {loading ? <div className={styles.loadingwheel}><CircularProgress color="inherit" size={20} /> </div> :
                  // Send icon SVG in input field
                  <svg viewBox='0 0 20 20' className={styles.svgicon} xmlns='http://www.w3.org/2000/svg'>
                    <path d='M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z'></path>
                  </svg>}
              </button>
            </form>
          </div>
          <div className={styles.footer}>
            {/* Rest of your JSX ... */}
          </div>
        </div>
      </main>
    </>
  )
}
