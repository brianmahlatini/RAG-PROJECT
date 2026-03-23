// File: AdminTabs.jsx
// Purpose: Admin tab switcher.
// Overview:
// - Messages / Users / Analytics
// File: AdminTabs.jsx
// Purpose: React component for Tesla ChatBot UI.

const tabs = [
  { id: "messages", label: "Messages" },
  { id: "users", label: "Users" },
  { id: "analytics", label: "Analytics" },
];

const AdminTabs = ({ activeTab, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        type="button"
        onClick={() => onChange(tab.id)}
        className={`rounded-full px-4 py-2 text-sm ${
          activeTab === tab.id
            ? "bg-ember text-white"
            : "border border-white/10 text-fog hover:text-ion"
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default AdminTabs;




