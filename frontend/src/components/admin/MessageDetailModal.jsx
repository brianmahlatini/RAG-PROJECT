const MessageDetailModal = ({ message, onClose, onFilterLanguage }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
    <div className="max-w-xl w-full rounded-3xl border border-white/10 bg-carbon p-6">
      <h2 className="font-display text-xl">Message details</h2>
      <div className="mt-4 space-y-3 text-sm text-fog">
        <p><span className="text-ion">ID:</span> {message.id}</p>
        <p><span className="text-ion">Time:</span> {new Date(message.timestamp).toLocaleString()}</p>
        <p><span className="text-ion">IP:</span> {message.ip}</p>
        <p><span className="text-ion">Role:</span> {message.role}</p>
        <p><span className="text-ion">Language:</span> {message.language || "english"}</p>
        <div className="rounded-2xl border border-white/10 bg-graphite px-4 py-3 text-ion">
          {message.content}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => onFilterLanguage(message.language || "english")}
          className="rounded-full bg-ember px-4 py-2 text-sm text-white"
        >
          Filter by language
        </button>
        <button
          type="button"
          onClick={onClose}
          className="rounded-full border border-white/10 px-4 py-2 text-sm text-fog"
        >
          Close
        </button>
      </div>
    </div>
  </div>
);

export default MessageDetailModal;
