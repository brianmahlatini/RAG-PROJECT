import { useEffect, useRef, useState } from "react";
import ChatFooter from "./ChatFooter.jsx";
import ChatHeader from "./ChatHeader.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatMessages from "./ChatMessages.jsx";
import { API_BASE_URL, DEFAULT_LANGUAGE, LANGUAGES } from "../../lib/constants";
import { useSpeech } from "../../hooks/useSpeech";

const commonEmojis = [
  "😊",
  "😂",
  "❤️",
  "👍",
  "🔥",
  "🎉",
  "🙏",
  "😢",
  "😍",
  "🤔",
  "👋",
  "✅",
  "⭐",
  "💯",
  "🔴",
  "🟢",
];

const ChatApp = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCitations, setShowCitations] = useState({});

  const chatboxRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { speak, stop } = useSpeech(language === "english");

  useEffect(() => {
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSend = async (overrideText) => {
    const text = (overrideText ?? input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setLiveTranscript("");

    try {
      const response = await fetch(`${API_BASE_URL}/chat?language=${language}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        }
      );
      const data = await response.json();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply, citations: data.citations || [] },
      ]);

      if (language === "english") {
        speak(data.reply);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Please try again later." },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const handleVoiceInput = () => {
    if (language !== "english") {
      alert("Voice input is only available in English.");
      return;
    }

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 3;
    recognition.lang = "en-US";

    let finalTranscript = "";
    let recognitionTimeout;
    let sent = false;

    setListening(true);
    setLiveTranscript("Listening...");

    recognition.onresult = (event) => {
      if (recognitionTimeout) clearTimeout(recognitionTimeout);

      let interimTranscript = "";
      let currentFinalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          currentFinalTranscript += transcript;
          finalTranscript = currentFinalTranscript;
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        setLiveTranscript(interimTranscript);
      }

      recognitionTimeout = setTimeout(() => {
        if (finalTranscript && !sent) {
          sent = true;
          setListening(false);
          setLiveTranscript("");
          handleSend(finalTranscript);
        }
      }, 800);
    };

    recognition.onerror = (event) => {
      let errorMessage = "Voice recognition failed. Please try again.";
      if (event.error === "no-speech") errorMessage = "No speech detected. Please try again.";
      if (event.error === "audio-capture") errorMessage = "No microphone found.";
      if (event.error === "not-allowed") errorMessage = "Microphone access denied.";
      if (event.error === "network") errorMessage = "Network error. Please check your connection.";

      alert(errorMessage);
      setListening(false);
      setLiveTranscript("");
    };

    recognition.onend = () => {
      if (finalTranscript && finalTranscript.trim() && !sent) {
        sent = true;
        handleSend(finalTranscript);
      }
      setListening(false);
      setLiveTranscript("");
      if (recognitionTimeout) clearTimeout(recognitionTimeout);
    };

    try {
      recognition.start();
    } catch (error) {
      alert("Failed to start voice recognition.");
      setListening(false);
      setLiveTranscript("");
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        // ignore
      }
    }
    setListening(false);
    setLiveTranscript("");
  };

  const handleClear = () => {
    setMessages([]);
    stop();
  };

  const handleToggleCitation = (index) => {
    setShowCitations((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ChatHeader status={listening ? "Listening" : typing ? "Thinking" : "Online"} />
      <ChatMessages
        messages={messages}
        typing={typing}
        chatboxRef={chatboxRef}
        onToggleCitation={handleToggleCitation}
        showCitations={showCitations}
      />
      <ChatInput
        input={input}
        inputRef={inputRef}
        language={language}
        languages={LANGUAGES}
        onLanguageChange={setLanguage}
        onInputChange={setInput}
        onSend={() => handleSend()}
        onVoice={handleVoiceInput}
        onStopListening={handleStopListening}
        listening={listening}
        showEmojiPicker={showEmojiPicker}
        onToggleEmoji={() => setShowEmojiPicker((prev) => !prev)}
        onAddEmoji={(emoji) => {
          setInput((prev) => prev + emoji);
          setShowEmojiPicker(false);
        }}
        onDeleteChar={() => setInput((prev) => prev.slice(0, -1))}
        onClear={handleClear}
        onMute={stop}
        liveTranscript={liveTranscript}
        emojiPickerRef={emojiPickerRef}
        commonEmojis={commonEmojis}
      />
      <ChatFooter />
    </div>
  );
};

export default ChatApp;
