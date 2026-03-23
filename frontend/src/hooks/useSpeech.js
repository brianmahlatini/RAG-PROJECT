// File: useSpeech.js
// Purpose: Speech synthesis hook.
// Overview:
// - Speaks assistant replies
// - Stops speech when needed
// File: useSpeech.js
// Purpose: Project module for Tesla ChatBot.

import { useCallback } from "react";
import { formatNumberForSpeech } from "../lib/format";

export const useSpeech = (enabled) => {
  const speak = useCallback(
    (text) => {
      if (!enabled || !text) return;
      window.speechSynthesis.cancel();
      const formatted = formatNumberForSpeech(text);
      const utterance = new SpeechSynthesisUtterance(formatted);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    },
    [enabled]
  );

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
  }, []);

  return { speak, stop };
};




