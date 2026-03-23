// File: ChatHeader.jsx
// Purpose: Chat header UI.
// Overview:
// - Brand title
// - Status indicator
// File: ChatHeader.jsx
// Purpose: React component for Tesla ChatBot UI.

const ChatHeader = ({ status }) => (
  <header className="flex items-center justify-between border-b border-white/10 bg-carbon/80 px-6 py-4 backdrop-blur">
    <div className="flex items-center gap-4">
      <div className="h-12 w-12 rounded-2xl bg-ember/20 text-ember shadow-glow flex items-center justify-center font-display text-xl">
        T
      </div>
      <div>
        <h1 className="font-display text-2xl tracking-tight">Tesla ChatBot</h1>
        <p className="text-sm text-fog">{status}</p>
      </div>
    </div>
    <div className="hidden md:flex items-center gap-3 text-xs text-fog">
      <span className="rounded-full border border-ember/30 px-3 py-1">Powered by Tesla Docs</span>
      <span className="rounded-full border border-white/10 px-3 py-1">English + German</span>
    </div>
  </header>
);

export default ChatHeader;




