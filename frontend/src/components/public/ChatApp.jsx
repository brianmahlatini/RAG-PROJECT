// File: ChatApp.jsx
// Purpose: Public chat experience.
// Overview:
// - Manages chat messages and input
// - Sends requests to backend
// - Handles voice input + TTS
import { useEffect, useRef, useState } from "react";
import ChatFooter from "./ChatFooter.jsx";
import ChatHeader from "./ChatHeader.jsx";
import ChatInput from "./ChatInput.jsx";
import ChatMessages from "./ChatMessages.jsx";
import { API_BASE_URL, DEFAULT_LANGUAGE, LANGUAGES } from "../../lib/constants";
import { apiFetch } from "../../lib/api";
import { useSpeech } from "../../hooks/useSpeech";

const commonEmojis = [
  "😀",
  "😃",
  "😄",
  "😁",
  "😆",
  "😅",
  "😂",
  "🤣",
  "😊",
  "😍",
  "😘",
  "😎",
  "🤩",
  "🤔",
  "😴",
  "😇",
  "🥳",
  "😤",
  "😱",
  "😢",
  "😭",
  "😡",
  "👍",
  "👎",
  "👏",
  "🙏",
  "🔥",
  "💡",
  "🚗",
];

const ChatApp = () => {
  // Core chat state
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const [typing, setTyping] = useState(false);
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showCitations, setShowCitations] = useState({});
  const [voiceError, setVoiceError] = useState("");

  const chatboxRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const { speak, stop } = useSpeech(language === "english"); // TTS only for English

  useEffect(() => {
    // Keep chat scrolled to latest message
    if (chatboxRef.current) {
      chatboxRef.current.scrollTop = chatboxRef.current.scrollHeight;
    }
  }, [messages, typing]);

  useEffect(() => {
    // Focus input on load
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    // Close emoji picker on outside click
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Send a user message to backend and append assistant reply
  const handleSend = async (overrideText) => {
    if (typing) return;
    const text = (overrideText ?? input).trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setTyping(true);
    setLiveTranscript("");

    try {
      const response = await apiFetch(`${API_BASE_URL}/chat?language=${language}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        },
        { timeoutMs: 20000, retries: 1 }
      );
      if (!response.ok) {
        throw new Error("Chat request failed");
      }
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

  // Voice input is English-only (browser SpeechRecognition)
  const handleVoiceInput = () => {
    if (language !== "english") {
      setVoiceError("Voice input is only available in English.");
      return;
    }

    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      setVoiceError("Speech recognition is not supported. Use Chrome or Edge.");
      return;
    }

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setVoiceError("Microphone access is not supported in this browser.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 5;
    recognition.lang = "en-US";

    let finalTranscript = "";
    let recognitionTimeout;
    let sent = false;

    const computeSilenceMs = (text) => {
      const words = text.trim().split(/\s+/).filter(Boolean).length;
      if (words >= 10) return 550; // fast send for long speech
      if (words >= 5) return 800;
      return 1400; // slower speakers get more time
    };

    const startRecognition = () => {
      setListening(true);
      setLiveTranscript("Listening...");
      setVoiceError("");

      recognition.onresult = (event) => {
        if (recognitionTimeout) clearTimeout(recognitionTimeout);

        let interimTranscript = "";
        let currentFinalTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i += 1) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            currentFinalTranscript += ` ${transcript}`;
            finalTranscript = currentFinalTranscript.trim();
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
        }, computeSilenceMs(finalTranscript || interimTranscript));
      };

      recognition.onerror = (event) => {
        let errorMessage = "Voice recognition failed. Please try again.";
        if (event.error === "no-speech") errorMessage = "No speech detected. Tap the mic and speak again.";
        if (event.error === "audio-capture") errorMessage = "No microphone found. Check your mic and try again.";
        if (event.error === "not-allowed") errorMessage = "Microphone access denied. Allow mic permission and retry.";
        if (event.error === "network") errorMessage = "Network error. Check your connection and retry.";
        if (event.error === "service-not-allowed") errorMessage = "Speech service blocked. Try Chrome or Edge.";

        setVoiceError((prev) => (prev === errorMessage ? prev : errorMessage));
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
        setVoiceError((prev) =>
          prev === "Failed to start voice recognition. Reload the page and try again."
            ? prev
            : "Failed to start voice recognition. Reload the page and try again."
        );
        setListening(false);
        setLiveTranscript("");
      }
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // Stop tracks immediately; we only need permission warm-up
        stream.getTracks().forEach((track) => track.stop());
        startRecognition();
      })
      .catch(() => {
        setVoiceError("Microphone permission blocked. Allow mic access and refresh.");
        setListening(false);
        setLiveTranscript("");
      });
  };

  // Manual stop for mic input
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

  // Clear chat UI + stop TTS
  const handleClear = () => {
    setMessages([]);
    stop();
  };

  // Toggle citations panel for a single message
  const handleToggleCitation = (index) => {
    setShowCitations((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  return (
    <div className="flex min-h-screen flex-col">
      <ChatHeader status={listening ? "Listening" : typing ? "Thinking" : "Online"} />
      {voiceError && (
        <div className="mx-6 mt-4 rounded-2xl border border-ember/40 bg-ember/10 px-4 py-3 text-sm text-amber-100">
          {voiceError} To fix: click the lock icon in the address bar, set Microphone to Allow, then refresh.
        </div>
      )}
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







