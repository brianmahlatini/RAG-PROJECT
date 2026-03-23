// File: AdminMessagesTable.jsx
// Purpose: Messages table with filters and export.
// Overview:
// - Search + filter
// - Pagination
// - CSV/JSON export
// File: AdminMessagesTable.jsx
// Purpose: React component for Tesla ChatBot UI.

const AdminMessagesTable = ({
  messages,
  languageFilter,
  roleFilter,
  searchTerm,
  onLanguageFilter,
  onRoleFilter,
  onSearchTerm,
  onViewMessage,
  onExport,
  page,
  pageSize,
  total,
  onPageChange,
}) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={searchTerm}
        onChange={(e) => onSearchTerm(e.target.value)}
        placeholder="Search messages or IP"
        className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-graphite px-3 py-2 text-sm"
      />
      <select
        value={languageFilter}
        onChange={(e) => onLanguageFilter(e.target.value)}
        className="rounded-xl border border-white/10 bg-graphite px-3 py-2 text-sm"
      >
        <option value="all">All languages</option>
        <option value="english">English</option>
        <option value="german">German</option>
      </select>
      <select
        value={roleFilter}
        onChange={(e) => onRoleFilter(e.target.value)}
        className="rounded-xl border border-white/10 bg-graphite px-3 py-2 text-sm"
      >
        <option value="all">All roles</option>
        <option value="user">User</option>
        <option value="assistant">Assistant</option>
      </select>
      <button
        type="button"
        onClick={() => onExport("messages")}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-fog hover:text-ion"
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={() => onExport("messages-json")}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-fog hover:text-ion"
      >
        Export JSON (All Chats)
      </button>
    </div>

    <div className="flex flex-wrap items-center justify-between text-xs text-fog">
      <span>
        Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, page - 1))}
          className="rounded-full border border-white/10 px-3 py-1"
          disabled={page <= 1}
        >
          Prev
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          className="rounded-full border border-white/10 px-3 py-1"
          disabled={page >= Math.ceil(total / pageSize)}
        >
          Next
        </button>
      </div>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-obsidian/70 text-fog">
          <tr>
            <th className="px-4 py-3 text-left">ID</th>
            <th className="px-4 py-3 text-left">IP</th>
            <th className="px-4 py-3 text-left">Role</th>
            <th className="px-4 py-3 text-left">Language</th>
            <th className="px-4 py-3 text-left">Time</th>
            <th className="px-4 py-3 text-left">Message</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {messages.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-6 text-center text-fog">
                No messages found.
              </td>
            </tr>
          )}
          {messages.map((msg) => (
            <tr key={msg.id} className="border-t border-white/10 hover:bg-obsidian/40">
              <td className="px-4 py-3">{msg.id}</td>
              <td className="px-4 py-3">{msg.ip}</td>
              <td className="px-4 py-3 capitalize">{msg.role}</td>
              <td className="px-4 py-3 capitalize">{msg.language || "english"}</td>
              <td className="px-4 py-3">{new Date(msg.timestamp).toLocaleString()}</td>
              <td className="px-4 py-3 max-w-[240px] truncate">{msg.content}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewMessage(msg)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-fog hover:text-ion"
                >
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

export default AdminMessagesTable;




