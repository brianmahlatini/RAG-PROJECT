// File: AdminHeader.jsx
// Purpose: Admin header with navigation.
// Overview:
// - Back to chat button
// - Logout
const AdminHeader = ({ onLogout, onSwitchToChat }) => (
  <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-carbon/80 px-6 py-4">
    <div>
      <h1 className="font-display text-2xl">Admin Dashboard</h1>
      <p className="text-xs text-fog">Tesla ChatBot analytics and oversight</p>
    </div>
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={onSwitchToChat}
        className="rounded-full border border-ember/40 px-4 py-2 text-sm text-ember hover:text-white"
      >
        Back to Chat
      </button>
      <button
        type="button"
        onClick={onLogout}
        className="rounded-full border border-white/10 px-4 py-2 text-sm text-fog hover:text-ion"
      >
        Logout
      </button>
    </div>
  </header>
);

export default AdminHeader;





