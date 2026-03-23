// File: AdminAnalytics.jsx
// Purpose: Analytics visualizations.
// Overview:
// - Language mix donut chart
// - Usage line chart
// File: AdminAnalytics.jsx
// Purpose: React component for Tesla ChatBot UI.

import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const AdminAnalytics = ({ languageStats, messages, users, onViewUser }) => {
  const totalMessages = messages.length || 1;
  const englishPct = Math.round((languageStats.english / totalMessages) * 100);
  const germanPct = Math.round((languageStats.german / totalMessages) * 100);

  const morningCount = messages.filter((m) => {
    const hour = new Date(m.timestamp).getHours();
    return hour >= 6 && hour < 12;
  }).length;
  const afternoonCount = messages.filter((m) => {
    const hour = new Date(m.timestamp).getHours();
    return hour >= 12 && hour < 18;
  }).length;
  const eveningCount = messages.filter((m) => {
    const hour = new Date(m.timestamp).getHours();
    return hour >= 18 || hour < 6;
  }).length;

  const peakMax = Math.max(morningCount, afternoonCount, eveningCount, 1);

  const topUsers = users
    .slice()
    .sort((a, b) => (b.messageCount || 0) - (a.messageCount || 0))
    .slice(0, 5);

  const doughnutData = {
    labels: ["English", "German"],
    datasets: [
      {
        data: [languageStats.english, languageStats.german],
        backgroundColor: ["#E31937", "#9AA4B2"],
        borderWidth: 0,
      },
    ],
  };

  const hourlyBuckets = Array.from({ length: 12 }, (_, i) => i * 2);
  const hourlyCounts = hourlyBuckets.map((startHour) =>
    messages.filter((m) => {
      const hour = new Date(m.timestamp).getHours();
      return hour >= startHour && hour < startHour + 2;
    }).length
  );

  const lineData = {
    labels: hourlyBuckets.map((h) => `${h}:00`),
    datasets: [
      {
        label: "Messages (2h buckets)",
        data: hourlyCounts,
        borderColor: "#E31937",
        backgroundColor: "rgba(227, 25, 55, 0.2)",
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5">
        <h3 className="font-display text-lg">Language mix</h3>
        <p className="mt-1 text-xs text-fog">Distribution across chat sessions.</p>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="h-40">
            <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } } }} />
          </div>
          <div className="space-y-3 text-sm text-fog">
            <div>
              <div className="flex items-center justify-between text-xs text-fog">
                <span>English</span>
                <span>{englishPct}%</span>
              </div>
              <p className="mt-1 text-xs text-fog">{languageStats.english} messages</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-xs text-fog">
                <span>German</span>
                <span>{germanPct}%</span>
              </div>
              <p className="mt-1 text-xs text-fog">{languageStats.german} messages</p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5">
        <h3 className="font-display text-lg">Peak usage</h3>
        <p className="mt-1 text-xs text-fog">Time-of-day activity.</p>
        <div className="mt-4 h-48">
          <Line
            data={lineData}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                x: { ticks: { color: "#9AA4B2" }, grid: { color: "rgba(255,255,255,0.05)" } },
                y: { ticks: { color: "#9AA4B2" }, grid: { color: "rgba(255,255,255,0.05)" } },
              },
            }}
          />
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-xs text-fog">
          <div className="rounded-xl border border-white/10 bg-obsidian/40 px-3 py-2 text-center">
            Morning {morningCount}
          </div>
          <div className="rounded-xl border border-white/10 bg-obsidian/40 px-3 py-2 text-center">
            Afternoon {afternoonCount}
          </div>
          <div className="rounded-xl border border-white/10 bg-obsidian/40 px-3 py-2 text-center">
            Evening {eveningCount}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5">
        <h3 className="font-display text-lg">Engagement snapshot</h3>
        <p className="mt-1 text-xs text-fog">Quick operational health check.</p>
        <div className="mt-5 grid gap-3 text-sm text-fog">
          <div className="rounded-xl border border-white/10 bg-obsidian/50 px-4 py-3">
            <p className="text-xs uppercase text-fog">Total messages</p>
            <p className="mt-2 text-xl text-ion">{messages.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-obsidian/50 px-4 py-3">
            <p className="text-xs uppercase text-fog">Active users</p>
            <p className="mt-2 text-xl text-ion">{users.length}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-obsidian/50 px-4 py-3">
            <p className="text-xs uppercase text-fog">Avg messages/user</p>
            <p className="mt-2 text-xl text-ion">
              {users.length ? Math.round(messages.length / users.length) : 0}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-graphite/70 p-5 lg:col-span-3">
        <h3 className="font-display text-lg">Top users</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {topUsers.map((user) => (
            <div
              key={user.ip}
              className="flex items-center justify-between rounded-xl border border-white/10 bg-obsidian/40 px-4 py-3"
            >
              <div>
                <p className="text-sm text-ion">{user.ip}</p>
                <p className="text-xs text-fog">{user.messageCount || 0} messages</p>
              </div>
              <button
                type="button"
                onClick={() => onViewUser(user)}
                className="rounded-full border border-white/10 px-3 py-1 text-xs text-fog hover:text-ion"
              >
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminAnalytics;




