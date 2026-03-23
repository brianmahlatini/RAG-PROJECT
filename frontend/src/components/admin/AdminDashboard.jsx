import { useEffect, useMemo, useState } from "react";
import { API_BASE_URL } from "../../lib/constants";
import AdminAnalytics from "./AdminAnalytics.jsx";
import AdminHeader from "./AdminHeader.jsx";
import AdminMessagesTable from "./AdminMessagesTable.jsx";
import AdminTabs from "./AdminTabs.jsx";
import AdminUsersTable from "./AdminUsersTable.jsx";
import MessageDetailModal from "./MessageDetailModal.jsx";
import UserDetailModal from "./UserDetailModal.jsx";

const AdminDashboard = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState("messages");
  const [adminMessages, setAdminMessages] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [languageFilter, setLanguageFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const messagesRes = await fetch(`${API_BASE_URL}/admin/messages`);
      const messagesData = await messagesRes.json();
      setAdminMessages(messagesData);

      const usersRes = await fetch(`${API_BASE_URL}/admin/users`);
      const usersData = await usersRes.json();

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
  }, [activeTab]);

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

  const filteredUsers = useMemo(
    () => adminUsers.filter((user) => !searchTerm || user.ip.includes(searchTerm)),
    [adminUsers, searchTerm]
  );

  const languageStats = useMemo(() => {
    const stats = { english: 0, german: 0 };
    adminMessages.forEach((msg) => {
      const lang = msg.language || "english";
      if (stats[lang] !== undefined) stats[lang] += 1;
    });
    return stats;
  }, [adminMessages]);

  const handleExport = (type) => {
    window.open(`${API_BASE_URL}/admin/export/${type}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-obsidian text-ion">
      <AdminHeader onLogout={onLogout} />
      <main className="px-6 py-6 space-y-6">
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
              />
            )}

            {activeTab === "users" && (
              <AdminUsersTable
                users={filteredUsers}
                searchTerm={searchTerm}
                onSearchTerm={setSearchTerm}
                onViewUser={(user) => setSelectedUser(user)}
                onExport={handleExport}
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
