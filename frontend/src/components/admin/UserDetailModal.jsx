const UserDetailModal = ({ user, messages, onClose, onViewMessage }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-6">
    <div className="max-w-2xl w-full rounded-3xl border border-white/10 bg-carbon p-6">
      <h2 className="font-display text-xl">User details</h2>
      <div className="mt-4 grid gap-3 text-sm text-fog md:grid-cols-2">
        <p><span className="text-ion">IP:</span> {user.ip}</p>
        <p><span className="text-ion">Messages:</span> {user.messageCount || 0}</p>
        <p><span className="text-ion">Languages:</span> {(user.languages || ["english"]).join(", ")}</p>
        <p><span className="text-ion">Policy:</span> {user.policy || "Not provided"}</p>
      </div>

      <div className="mt-5">
        <h3 className="font-display text-lg">Message history</h3>
        <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
          {messages.map((msg) => (
            <button
              key={msg.id}
              type="button"
              onClick={() => onViewMessage(msg)}
              className="w-full rounded-2xl border border-white/10 bg-graphite/70 px-4 py-3 text-left text-sm text-fog hover:bg-graphite"
            >
              <div className="flex items-center justify-between text-xs text-fog">
                <span className="uppercase">{msg.role}</span>
                <span>{new Date(msg.timestamp).toLocaleString()}</span>
              </div>
              <p className="mt-2 text-ion">{msg.content.slice(0, 120)}...</p>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex justify-end">
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

export default UserDetailModal;
