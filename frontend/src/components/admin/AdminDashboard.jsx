// File: AdminDashboard.jsx
// Purpose: Admin panel shell and data orchestration.
// Overview:
// - Fetches messages/users
// - Renders analytics + tables
// - Handles export actions
// File: AdminDashboard.jsx
// Purpose: React component for Tesla ChatBot UI.

import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../lib/constants";
import { apiFetch } from "../../lib/api";
import AdminAnalytics from "./AdminAnalytics.jsx";
import AdminHeader from "./AdminHeader.jsx";
import AdminMessagesTable from "./AdminMessagesTable.jsx";
import AdminTabs from "./AdminTabs.jsx";
import AdminUsersTable from "./AdminUsersTable.jsx";
import MessageDetailModal from "./MessageDetailModal.jsx";
import UserDetailModal from "./UserDetailModal.jsx";

const AdminDashboard = ({ onLogout, role = "viewer", token = "" }) => {
  // Dashboard state
  const [activeTab, setActiveTab] = useState("messages");
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminToken] = useState(token || localStorage.getItem("adminToken") || "");
  const [adminRole] = useState(role || localStorage.getItem("adminRole") || "viewer");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messagesPage, setMessagesPage] = useState(1);
  const [usersPage, setUsersPage] = useState(1);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [usersTotal, setUsersTotal] = useState(0);
  const pageSize = 50;

  // Fetch messages + users for admin panels
  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const messagesRes = await apiFetch(
        `${API_BASE_URL}/admin/messages?page=${messagesPage}&page_size=${pageSize}`,
        { headers: { "x-admin-token": adminToken } },
        { timeoutMs: 20000, retries: 1 }
      );
      if (messagesRes.status === 401 || messagesRes.status === 403) {
        setAuthError("Session expired or insufficient permissions.");
        setLoading(false);
        return;
      }
      const messagesPayload = await messagesRes.json();
      setAdminMessages(messagesPayload.data || []);
      setMessagesTotal(messagesPayload.total || 0);

      const usersRes = await apiFetch(
        `${API_BASE_URL}/admin/users?page=${usersPage}&page_size=${pageSize}`,
        { headers: { "x-admin-token": adminToken } },
        { timeoutMs: 20000, retries: 1 }
      );
      if (usersRes.status === 401 || usersRes.status === 403) {
        setAuthError("Session expired or insufficient permissions.");
        setLoading(false);
        return;
      }
      const usersPayload = await usersRes.json();
      const usersData = usersPayload.data || [];
      setUsersTotal(usersPayload.total || 0);

      const enhancedUsers = usersData.map((user) => {
        const userMsgs = messagesData.filter((m) => m.ip === user.ip);
        const userLanguages = [...new Set(userMsgs.map((m) => m.language || "english"))];

        return {
          ...user,
          messageCount: userMsgs.length,
          languages: userLanguages,
          lastMessage: userMsgs[0]?.timestamp,
        };
      });

      setAdminUsers(enhancedUsers);
    } catch (error) {
      console.error("Error fetching admin data", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [activeTab, messagesPage, usersPage, adminToken]);

  // Apply search + filters to messages table
  const filteredMessages = useMemo(
    () =>
      adminMessages.filter((msg) => {
        if (languageFilter !== "all" && msg.language !== languageFilter) return false;
        if (roleFilter !== "all" && msg.role !== roleFilter) return false;
        if (!searchTerm) return true;
        const searchLower = searchTerm.toLowerCase();
        return (
          msg.content?.toLowerCase().includes(searchLower) ||
          msg.ip?.includes(searchLower) ||
          msg.id?.toString().includes(searchLower)
        );
      }),
    [adminMessages, languageFilter, roleFilter, searchTerm]
  );

  // Apply search to users table
  const filteredUsers = useMemo(
    () => adminUsers.filter((user) => !searchTerm || user.ip.includes(searchTerm)),
    [adminUsers, searchTerm]
  );

  // Build language analytics
  const languageStats = useMemo(() => {
    const stats = { english: 0, german: 0 };
    adminMessages.forEach((msg) => {
      const lang = msg.language || "english";
      if (stats[lang] !== undefined) stats[lang] += 1;
    });
    return stats;
  }, [adminMessages]);

  // Export CSV via backend endpoints
  const handleExport = (type) => {
    window.open(`${API_BASE_URL}/admin/export/${type}?token=${adminToken}`, "_blank");
  };

  const handleAuditExport = () => {
    window.open(`${API_BASE_URL}/admin/export/audit?token=${adminToken}`, "_blank");
  };


  return (
    <div className="min-h-screen bg-obsidian text-ion">
      <AdminHeader
        onLogout={onLogout}
        onSwitchToChat={() => {
          window.location.href = "/";
        }}
      />
      <main className="px-6 py-6 space-y-6">
        {authError && (
          <div className="rounded-2xl border border-ember/40 bg-ember/10 px-5 py-3 text-sm">
            {authError}
          </div>
        )}
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-graphite/70 px-5 py-4">
            <p className="text-xs uppercase text-fog">Total messages</p>
            <p className="mt-2 text-2xl text-ion">{adminMessages.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-graphite/70 px-5 py-4">
            <p className="text-xs uppercase text-fog">Active users</p>
            <p className="mt-2 text-2xl text-ion">{adminUsers.length}</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-graphite/70 px-5 py-4">
            <p className="text-xs uppercase text-fog">English share</p>
            <p className="mt-2 text-2xl text-ion">
              {adminMessages.length
                ? Math.round(
                    (adminMessages.filter((m) => (m.language || "english") === "english").length /
                      adminMessages.length) *
                      100
                  )
                : 0}
              %
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-graphite/70 px-5 py-4 text-sm">
          <div>
            <p className="text-xs uppercase text-fog">Role</p>
            <p className="mt-1 text-ion">{adminRole}</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {adminRole === "admin" && (
              <button
                type="button"
                onClick={handleAuditExport}
                className="rounded-full border border-white/10 px-4 py-2 text-xs text-fog hover:text-ion"
              >
                Export Audit
              </button>
            )}
          </div>
        </div>
        <AdminTabs activeTab={activeTab} onChange={setActiveTab} />

        {loading ? (
          <div className="rounded-2xl border border-white/10 bg-graphite/60 px-6 py-8 text-fog">
            Loading dashboard data...
          </div>
        ) : (
          <>
            {activeTab === "messages" && (
              <AdminMessagesTable
                messages={filteredMessages}
                languageFilter={languageFilter}
                roleFilter={roleFilter}
                searchTerm={searchTerm}
                onLanguageFilter={setLanguageFilter}
                onRoleFilter={setRoleFilter}
                onSearchTerm={setSearchTerm}
                onViewMessage={(msg) => setSelectedMessage(msg)}
                onExport={handleExport}
                page={messagesPage}
                pageSize={pageSize}
                total={messagesTotal}
                onPageChange={setMessagesPage}
              />
            )}

            {activeTab === "users" && (
              <AdminUsersTable
                users={filteredUsers}
                searchTerm={searchTerm}
                onSearchTerm={setSearchTerm}
                onViewUser={(user) => setSelectedUser(user)}
                onExport={handleExport}
                page={usersPage}
                pageSize={pageSize}
                total={usersTotal}
                onPageChange={setUsersPage}
              />
            )}

            {activeTab === "analytics" && (
              <AdminAnalytics
                languageStats={languageStats}
                messages={adminMessages}
                users={adminUsers}
                onViewUser={(user) => setSelectedUser(user)}
              />
            )}
          </>
        )}
      </main>

      {selectedMessage && (
        <MessageDetailModal
          message={selectedMessage}
          onClose={() => setSelectedMessage(null)}
          onFilterLanguage={(language) => {
            setLanguageFilter(language);
            setActiveTab("messages");
            setSelectedMessage(null);
          }}
        />
      )}

      {selectedUser && (
        <UserDetailModal
          user={selectedUser}
          messages={adminMessages.filter((m) => m.ip === selectedUser.ip)}
          onClose={() => setSelectedUser(null)}
          onViewMessage={(msg) => {
            setSelectedMessage(msg);
            setSelectedUser(null);
          }}
        />
      )}
    </div>
  );
};

export default AdminDashboard;




