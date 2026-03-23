// File: ChatInput.jsx
// Purpose: Message input bar.
// Overview:
// - Language select
// - Text input
// - Voice controls
// File: ChatInput.jsx
// Purpose: React component for Tesla ChatBot UI.

const ChatInput = ({
  input,
  inputRef,
  language,
  languages,
  onLanguageChange,
  onInputChange,
  onSend,
  onVoice,
  onStopListening,
  listening,
  showEmojiPicker,
  onToggleEmoji,
  onAddEmoji,
  onDeleteChar,
  onClear,
  onMute,
  liveTranscript,
  emojiPickerRef,
  commonEmojis,
}) => (
  <div className="border-t border-white/10 bg-carbon/80 px-6 py-4 backdrop-blur">
    <div className="flex flex-col gap-4">
      {/* Language selector */}
      <div className="flex items-center justify-between text-xs text-fog">
        <span>Language</span>
        <select
          value={language}
          onChange={(e) => onLanguageChange(e.target.value)}
          className="bg-graphite border border-white/10 rounded-full px-3 py-1 text-ion"
        >
          {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {lang.label}
            </option>
          ))}
        </select>
      </div>

      {/* Live voice transcription */ }
      {listening && (
        <div className="flex items-center justify-between rounded-2xl border border-ember/50 bg-obsidian/60 px-4 py-3 text-sm text-ion">
          <div className="flex items-center gap-3">
            <div className="flex gap-1">
              <span className="h-2 w-2 rounded-full bg-ember animate-pulse" />
              <span className="h-2 w-2 rounded-full bg-ember animate-pulse [animation-delay:150ms]" />
              <span className="h-2 w-2 rounded-full bg-ember animate-pulse [animation-delay:300ms]" />
            </div>
            <span>{liveTranscript || "Listening..."}</span>
          </div>
          <button
            type="button"
            onClick={onStopListening}
            className="rounded-full border border-ember/40 px-3 py-1 text-ember"
          >
            Stop
          </button>
        </div>
      )}

      {/* Message input + actions */}
      <div className="relative flex items-center gap-2 rounded-2xl border border-white/10 bg-graphite px-3 py-2">
        <button
          type="button"
          onClick={onToggleEmoji}
          className="rounded-full border border-white/10 px-3 py-2 text-fog hover:text-ion"
        >
          :)
        </button>

        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className="absolute bottom-14 left-0 z-20 w-64 rounded-2xl border border-white/10 bg-carbon p-3 shadow-xl"
          >
            <div className="grid grid-cols-8 gap-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  className="rounded-lg bg-graphite/70 p-2 hover:bg-ember/30"
                  onClick={() => onAddEmoji(emoji)}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}

        <input
          ref={inputRef}
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Ask anything about Tesla"
          className="flex-1 bg-transparent text-ion placeholder:text-fog focus:outline-none"
        />

        <div className="flex items-center gap-2">
          {language === "english" && (
            <button
              type="button"
              onClick={listening ? onStopListening : onVoice}
              className={`rounded-full border px-3 py-2 text-sm ${
                listening ? "border-ember text-ember" : "border-white/10 text-fog"
              }`}
            >
              {listening ? "Stop" : "Mic"}
            </button>
          )}
          <button
            type="button"
            onClick={onSend}
            disabled={!input.trim()}
            className="rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          >
            Send
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs text-fog">
        {language === "english" && (
          <button
            type="button"
            onClick={onMute}
            className="rounded-full border border-white/10 px-3 py-1 hover:text-ion"
          >
            Mute voice
          </button>
        )}
        <button
          type="button"
          onClick={onClear}
          className="rounded-full border border-white/10 px-3 py-1 hover:text-ion"
        >
          Clear chat
        </button>
        {input && (
          <button
            type="button"
            onClick={onDeleteChar}
            className="rounded-full border border-white/10 px-3 py-1 hover:text-ion"
          >
            Delete last
          </button>
        )}
      </div>
    </div>
  </div>
);

export default ChatInput;




