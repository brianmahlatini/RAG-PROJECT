const AdminUsersTable = ({ users, searchTerm, onSearchTerm, onViewUser, onExport }) => (
  <div className="space-y-4">
    <div className="flex flex-wrap items-center gap-3">
      <input
        value={searchTerm}
        onChange={(e) => onSearchTerm(e.target.value)}
        placeholder="Search IP"
        className="flex-1 min-w-[200px] rounded-xl border border-white/10 bg-graphite px-3 py-2 text-sm"
      />
      <button
        type="button"
        onClick={() => onExport("users")}
        className="rounded-xl border border-white/10 px-4 py-2 text-sm text-fog hover:text-ion"
      >
        Export CSV
      </button>
    </div>

    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="min-w-full text-sm">
        <thead className="bg-obsidian/70 text-fog">
          <tr>
            <th className="px-4 py-3 text-left">IP Address</th>
            <th className="px-4 py-3 text-left">Messages</th>
            <th className="px-4 py-3 text-left">Languages</th>
            <th className="px-4 py-3 text-left">Last Active</th>
            <th className="px-4 py-3 text-left">Policy</th>
            <th className="px-4 py-3 text-left">Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.ip} className="border-t border-white/10 hover:bg-obsidian/40">
              <td className="px-4 py-3">{user.ip}</td>
              <td className="px-4 py-3">{user.messageCount || 0}</td>
              <td className="px-4 py-3">
                {(user.languages || ["english"]).map((lang) => (
                  <span
                    key={lang}
                    className="mr-2 inline-flex items-center rounded-full border border-white/10 px-2 py-1 text-xs"
                  >
                    {lang}
                  </span>
                ))}
              </td>
              <td className="px-4 py-3">
                {user.lastMessage ? new Date(user.lastMessage).toLocaleString() : "Never"}
              </td>
              <td className="px-4 py-3">{user.policy || "Not provided"}</td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewUser(user)}
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

export default AdminUsersTable;
