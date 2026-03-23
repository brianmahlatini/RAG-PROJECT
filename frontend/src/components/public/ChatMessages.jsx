import { formatTime } from "../../lib/format";

const ChatMessages = ({ messages, typing, chatboxRef, onToggleCitation, showCitations }) => (
  <div ref={chatboxRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
    {messages.map((msg, index) => {
      const isUser = msg.role === "user";
      return (
        <div key={`${msg.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
            isUser
              ? "bg-ember text-white shadow-glow"
              : "bg-graphite text-ion border border-white/10"
          }`}>
            <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>

            {msg.citations && msg.citations.length > 0 && (
              <div className="mt-3 border-t border-white/10 pt-2 text-xs text-fog">
                <button
                  type="button"
                  onClick={() => onToggleCitation(index)}
                  className="flex items-center gap-2 text-ember"
                >
                  <span>Sources</span>
                  <span>{showCitations[index] ? "-" : "+"}</span>
                </button>
                {showCitations[index] && (
                  <ul className="mt-2 space-y-1">
                    {msg.citations.map((cit, idx) => (
                      <li key={`${index}-${idx}`}>
                        {cit.filename} (pg {cit.page})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div className="mt-2 text-[11px] text-white/50 text-right">
              {formatTime(new Date())}
            </div>
          </div>
        </div>
      );
    })}

    {typing && (
      <div className="flex justify-start">
        <div className="rounded-2xl bg-graphite border border-white/10 px-4 py-3">
          <div className="flex gap-2">
            <span className="h-2 w-2 rounded-full bg-ember animate-bounce" />
            <span className="h-2 w-2 rounded-full bg-ember animate-bounce [animation-delay:150ms]" />
            <span className="h-2 w-2 rounded-full bg-ember animate-bounce [animation-delay:300ms]" />
          </div>
        </div>
      </div>
    )}
  </div>
);

export default ChatMessages;
