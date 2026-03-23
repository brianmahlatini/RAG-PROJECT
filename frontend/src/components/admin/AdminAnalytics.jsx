const AdminAnalytics = ({ languageStats, messages, users, onViewUser }) => (
  <div className="grid gap-4 md:grid-cols-2">
    <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5">
      <h3 className="font-display text-lg">Messages by language</h3>
      <div className="mt-3 space-y-2 text-sm text-fog">
        <p>English: {languageStats.english} messages</p>
        <p>German: {languageStats.german} messages</p>
      </div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5">
      <h3 className="font-display text-lg">Peak usage</h3>
      <div className="mt-3 space-y-2 text-sm text-fog">
        <p>
          Morning (6am-12pm):{" "}
          {messages.filter((m) => {
            const hour = new Date(m.timestamp).getHours();
            return hour >= 6 && hour < 12;
          }).length}
        </p>
        <p>
          Afternoon (12pm-6pm):{" "}
          {messages.filter((m) => {
            const hour = new Date(m.timestamp).getHours();
            return hour >= 12 && hour < 18;
          }).length}
        </p>
        <p>
          Evening (6pm-12am):{" "}
          {messages.filter((m) => {
            const hour = new Date(m.timestamp).getHours();
            return hour >= 18 || hour < 6;
          }).length}
        </p>
      </div>
    </div>

    <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5 md:col-span-2">
      <h3 className="font-display text-lg">Top users</h3>
      <ul className="mt-3 space-y-2 text-sm text-fog">
        {users
          .slice()
          .sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))
          .slice(0, 5)
          .map((user) => (
            <li
              key={user.ip}
              className="flex items-center justify-between rounded-xl border border-white/10 px-3 py-2"
            >
              <span>{user.ip}</span>
              <button
                type="button"
                onClick={() => onViewUser(user)}
                className="rounded-full border border-white/10 px-2 py-1 text-xs text-fog hover:text-ion"
              >
                View
              </button>
            </li>
          ))}
      </ul>
    </div>
  </div>
);

export default AdminAnalytics;
