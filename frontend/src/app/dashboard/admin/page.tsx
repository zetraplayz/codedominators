"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/session";
import {
  Building2, UserPlus, Shield, Mail, CreditCard, Trash2,
  AlertTriangle, TerminalSquare, Wrench, BarChart3, Users,
  FileText, RefreshCw, ChevronDown, CheckCircle2, Loader2
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────
interface Dept { id: number; name: string; hod_id: string | null; }
interface UserItem {
  id: string; full_name: string; email: string; employee_id: string;
  role: string; department_id: number | null; department_name: string | null;
  designation?: string; created_at?: string;
}
interface Stats {
  total_users: number; total_resources: number; total_departments: number;
  pending_access_requests: number; role_breakdown: Record<string, number>;
}

// ─── Sub-components ───────────────────────────────────────

function TabButton({ label, active, onClick, icon: Icon }: {
  label: string; active: boolean; onClick: () => void; icon: React.ElementType;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-5 py-2.5 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
        active ? "bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]" : "opacity-50 hover:opacity-100"
      }`}
    >
      <Icon size={15} /> {label}
    </button>
  );
}

function RoleBadge({ role }: { role: string }) {
  const color = role === "ADMIN"
    ? "bg-[var(--color-base-yellow)]"
    : role === "HOD"
    ? "bg-[var(--color-base-mint)]"
    : "bg-[var(--color-base-bg)]";
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold shadow-clay-pressed border border-white/20 ${color}`}>
      {role}
    </span>
  );
}

// ─── Main Component ───────────────────────────────────────

export default function AdminControlPlane() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState("overview");

  // Data
  const [departments, setDepartments] = useState<Dept[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [systemSettings, setSystemSettings] = useState<Record<string, string>>({});
  const [patchVersion, setPatchVersion] = useState("");
  const [patchContent, setPatchContent] = useState("");
  const [devAnnouncement, setDevAnnouncement] = useState("");
  const [turnUrl, setTurnUrl] = useState("");
  const [turnUser, setTurnUser] = useState("");
  const [turnPass, setTurnPass] = useState("");

  // Forms
  const [newDeptName, setNewDeptName] = useState("");
  const [newUser, setNewUser] = useState({
    full_name: "", email: "", employee_id: "", password: "", role: "STAFF", department_id: ""
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);

  // Dev Mode Backup Gate
  const [backupConfirmed, setBackupConfirmed] = useState(false);
  const [backupGateOpen, setBackupGateOpen] = useState(false);
  const [backupCode, setBackupCode] = useState("");
  const BACKUP_SECRET = "RITCONNECT-DEVMODE";  // in production, this would be server-generated

  const showMsg = (type: string, text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: "", text: "" }), 4000);
  };

  // ── Fetchers ──────────────────────────────────────────
  const fetchAll = async () => {
    await Promise.all([fetchDepartments(), fetchUsers(), fetchStats(), fetchSystemSettings()]);
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments", { credentials: "include" });
      if (res.ok) setDepartments(await res.json());
    } catch { /* silent */ }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) setUsers(await res.json());
    } catch { /* silent */ }
  };

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/admin/stats", { credentials: "include" });
      if (res.ok) setStats(await res.json());
    } catch { /* silent */ }
  };

  const fetchSystemSettings = async () => {
    try {
      const res = await fetch("/api/admin/settings", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSystemSettings(data);
        if (data.PATCH_NOTE_VERSION) setPatchVersion(data.PATCH_NOTE_VERSION);
        if (data.PATCH_NOTE_CONTENT) setPatchContent(data.PATCH_NOTE_CONTENT);
        if (data.DEV_MODE_ANNOUNCEMENT) setDevAnnouncement(data.DEV_MODE_ANNOUNCEMENT);
        if (data.TURN_SERVER_URL) setTurnUrl(data.TURN_SERVER_URL);
        if (data.TURN_SERVER_USERNAME) setTurnUser(data.TURN_SERVER_USERNAME);
        if (data.TURN_SERVER_PASSWORD) setTurnPass(data.TURN_SERVER_PASSWORD);
        if (data.DEVELOPER_MODE === "true") {
          document.body.classList.add("dev-mode");
        } else {
          document.body.classList.remove("dev-mode");
        }
      }
    } catch { /* silent */ }
  };

  useEffect(() => {
    if (user?.role === "ADMIN") fetchAll();
  }, [user]);

  // ── Actions ───────────────────────────────────────────

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName })
      });
      if (res.ok) {
        showMsg("success", "Department created successfully!");
        setNewDeptName("");
        fetchDepartments(); fetchStats();
      } else {
        const err = await res.json();
        showMsg("error", err.detail || "Error creating department");
      }
    } catch { showMsg("error", "Network error"); }
    setLoading(false);
  };

  const handleDeleteDepartment = async (id: number, name: string) => {
    if (!confirm(`Delete department "${name}"? All users in this department will be unassigned.`)) return;
    try {
      const res = await fetch(`/api/admin/departments/${id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showMsg("success", `Department "${name}" deleted.`);
        fetchDepartments(); fetchStats();
      }
    } catch { showMsg("error", "Failed to delete department."); }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const body = { ...newUser, department_id: newUser.department_id ? parseInt(newUser.department_id) : null };
      const res = await fetch("/api/admin/users", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        showMsg("success", "User created! They can now log in.");
        setNewUser({ full_name: "", email: "", employee_id: "", password: "", role: "STAFF", department_id: "" });
        fetchUsers(); fetchStats();
      } else {
        const err = await res.json();
        showMsg("error", err.detail || "Error creating user");
      }
    } catch { showMsg("error", "Network error"); }
    setLoading(false);
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Permanently delete user "${name}"? This cannot be undone.`)) return;
    setDeletingUserId(userId);
    try {
      const res = await fetch(`/api/admin/users/${userId}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        showMsg("success", `User "${name}" deleted.`);
        fetchUsers(); fetchStats();
      } else {
        const err = await res.json();
        showMsg("error", err.detail || "Failed to delete user.");
      }
    } catch { showMsg("error", "Network error."); }
    setDeletingUserId(null);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole })
      });
      if (res.ok) {
        showMsg("success", "Role updated.");
        fetchUsers();
      } else {
        const err = await res.json();
        showMsg("error", err.detail || "Failed to update role.");
      }
    } catch { showMsg("error", "Network error."); }
  };

  const toggleSetting = async (key: string, currentValue: string) => {
    // Dev Mode requires backup gate
    if (key === "DEVELOPER_MODE" && currentValue !== "true") {
      if (!backupConfirmed) {
        setBackupGateOpen(true);
        return;
      }
    }
    const newValue = currentValue === "true" ? "false" : "true";
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value: newValue })
      });
      if (res.ok) {
        fetchSystemSettings();
        if (key === "DEVELOPER_MODE" && newValue === "false") {
          setBackupConfirmed(false); // Reset gate when disabling
        }
      }
    } catch { /* silent */ }
  };

  const savePatchNote = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "PATCH_NOTE_VERSION", value: patchVersion })
      });
      await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "PATCH_NOTE_CONTENT", value: patchContent })
      });
      showMsg("success", "Patch note updated successfully.");
      fetchSystemSettings();
    } catch {
      showMsg("error", "Failed to update patch note.");
    }
    setLoading(false);
  };

  const saveDevAnnouncement = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "DEV_MODE_ANNOUNCEMENT", value: devAnnouncement })
      });
      showMsg("success", "Dev Mode announcement updated successfully.");
      fetchSystemSettings();
    } catch {
      showMsg("error", "Failed to update dev mode announcement.");
    }
    setLoading(false);
  };

  const saveTurnSettings = async () => {
    setLoading(true);
    try {
      await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "TURN_SERVER_URL", value: turnUrl })
      });
      await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "TURN_SERVER_USERNAME", value: turnUser })
      });
      await fetch("/api/admin/settings", {
        method: "POST", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "TURN_SERVER_PASSWORD", value: turnPass })
      });
      showMsg("success", "TURN server settings updated successfully.");
      fetchSystemSettings();
    } catch {
      showMsg("error", "Failed to update TURN settings.");
    }
    setLoading(false);
  };

  const handleBackupConfirm = () => {
    if (backupCode.trim().toUpperCase() === BACKUP_SECRET) {
      setBackupConfirmed(true);
      setBackupGateOpen(false);
      setBackupCode("");
      // Now actually enable dev mode
      toggleSetting("DEVELOPER_MODE", "false");
    } else {
      showMsg("error", "Incorrect backup confirmation code.");
      setBackupCode("");
    }
  };

  useEffect(() => {
    if (user && user.role !== "ADMIN") {
      window.location.href = "/login";
    }
  }, [user]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex items-center justify-center h-screen bg-[var(--color-base-bg)]">
        <Loader2 size={32} className="animate-spin text-[var(--color-base-text)] opacity-40" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">
          Admin Control Plane
        </h1>
        <p className="opacity-60 mt-2 font-medium text-[var(--color-base-text)] text-sm">
          Code Dominator · Full system control for RIT Connect Plus
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-[var(--color-base-text)]/10 pb-4">
        <TabButton label="Overview" active={activeTab === "overview"} onClick={() => setActiveTab("overview")} icon={BarChart3} />
        <TabButton label="Users" active={activeTab === "users"} onClick={() => setActiveTab("users")} icon={Users} />
        <TabButton label="Departments" active={activeTab === "departments"} onClick={() => setActiveTab("departments")} icon={Building2} />
        <TabButton label="System Controls" active={activeTab === "system"} onClick={() => setActiveTab("system")} icon={Shield} />
      </div>

      {/* Global message */}
      {message.text && (
        <div className={`p-4 rounded-2xl font-bold text-sm flex items-center gap-2 ${message.type === "success" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {message.type === "success" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          {message.text}
        </div>
      )}

      {/* ── OVERVIEW TAB ─────────────────────────────── */}
      {activeTab === "overview" && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { label: "Total Users", value: stats.total_users, icon: Users },
            { label: "Resources", value: stats.total_resources, icon: FileText },
            { label: "Departments", value: stats.total_departments, icon: Building2 },
            { label: "Pending Requests", value: stats.pending_access_requests, icon: AlertTriangle },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="p-6 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-widest text-[var(--color-base-text)] opacity-60">{label}</p>
                <Icon size={16} className="text-[var(--color-base-text)] opacity-40" />
              </div>
              <p className="text-5xl font-extrabold text-[var(--color-base-text)]">{value}</p>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 p-6 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card flex flex-wrap gap-6">
            <p className="text-sm font-extrabold uppercase tracking-wider text-[var(--color-base-text)] opacity-60 w-full">Role Breakdown</p>
            {Object.entries(stats.role_breakdown).map(([role, count]) => (
              <div key={role} className="flex flex-col gap-1">
                <p className="text-3xl font-extrabold text-[var(--color-base-text)]">{count}</p>
                <p className="text-xs font-bold text-[var(--color-base-text)] opacity-50 uppercase">{role}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── USERS TAB ────────────────────────────────── */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-8">
          {/* Create user form */}
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card">
            <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-6 flex items-center gap-2">
              <UserPlus size={20} /> Create New User
            </h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Full Name", key: "full_name", type: "text", placeholder: "Dr. Jane Smith" },
                { label: "Official Email (@ritrjpm.ac.in)", key: "email", type: "email", placeholder: "name@ritrjpm.ac.in" },
                { label: "Employee ID", key: "employee_id", type: "text", placeholder: "EMP001" },
                { label: "Temporary Password", key: "password", type: "password", placeholder: "••••••••" },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key} className="flex flex-col gap-2">
                  <label className="font-bold text-xs uppercase tracking-wider opacity-70">{label}</label>
                  <input
                    required type={type}
                    placeholder={placeholder}
                    value={newUser[key as keyof typeof newUser]}
                    onChange={e => setNewUser({ ...newUser, [key]: e.target.value })}
                    className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none text-[var(--color-base-text)] font-medium"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Role</label>
                <select
                  required value={newUser.role}
                  onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                  className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none font-bold text-[var(--color-base-text)]"
                >
                  <option value="STAFF">STAFF</option>
                  <option value="HOD">HOD</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Department</label>
                <select
                  value={newUser.department_id}
                  onChange={e => setNewUser({ ...newUser, department_id: e.target.value })}
                  className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none font-bold text-[var(--color-base-text)]"
                >
                  <option value="">— None / Select —</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div className="md:col-span-2 mt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 rounded-2xl bg-[var(--color-base-text)] text-[var(--color-base-bg)] font-extrabold shadow-clay-btn hover:shadow-clay-pressed transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
                  {loading ? "Creating..." : "Create User"}
                </button>
              </div>
            </form>
          </div>

          {/* Users list */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[var(--color-base-text)]">All Users ({users.length})</h2>
              <button onClick={fetchUsers} className="p-2 rounded-xl bg-[var(--color-base-mint)] shadow-clay-btn text-[var(--color-base-text)] opacity-60 hover:opacity-100 transition-all">
                <RefreshCw size={16} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map(u => (
                <div key={u.id} className="p-5 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-card flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="font-bold text-lg text-[var(--color-base-text)] truncate">{u.full_name}</p>
                      {u.id === user.id && <span className="text-[10px] font-bold text-[var(--color-base-text)] opacity-40">(You)</span>}
                    </div>
                    <RoleBadge role={u.role} />
                  </div>
                  <div className="flex flex-col gap-1 text-sm font-medium opacity-70">
                    <p className="flex items-center gap-2 text-[var(--color-base-text)]"><Mail size={13}/> {u.email}</p>
                    <p className="flex items-center gap-2 text-[var(--color-base-text)]"><CreditCard size={13}/> {u.employee_id}</p>
                    <p className="flex items-center gap-2 text-[var(--color-base-text)]"><Building2 size={13}/> {u.department_name || "No Dept"}</p>
                  </div>
                  {u.id !== user.id && (
                    <div className="flex items-center gap-2 pt-3 border-t border-[var(--color-base-text)]/10">
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        className="flex-1 p-2 rounded-xl bg-[var(--color-base-mint)] shadow-clay-pressed text-xs font-bold outline-none text-[var(--color-base-text)]"
                      >
                        <option value="STAFF">STAFF</option>
                        <option value="HOD">HOD</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(u.id, u.full_name)}
                        disabled={deletingUserId === u.id}
                        className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-clay-btn disabled:opacity-40"
                        title="Delete user"
                      >
                        {deletingUserId === u.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── DEPARTMENTS TAB ───────────────────────────── */}
      {activeTab === "departments" && (
        <div className="flex flex-col gap-8">
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card max-w-xl">
            <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-6 flex items-center gap-2">
              <Building2 size={20} /> Create Department
            </h2>
            <form onSubmit={handleCreateDepartment} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Department Name</label>
                <input
                  required type="text" value={newDeptName}
                  onChange={e => setNewDeptName(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none font-bold text-[var(--color-base-text)]"
                />
              </div>
              <button type="submit" disabled={loading} className="py-3.5 rounded-2xl bg-[var(--color-base-text)] text-[var(--color-base-bg)] font-extrabold shadow-clay-btn hover:shadow-clay-pressed transition-all disabled:opacity-40">
                {loading ? "Creating..." : "Create Department"}
              </button>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--color-base-text)] mb-4">All Departments ({departments.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {departments.map(d => (
                <div key={d.id} className="p-6 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-card flex items-center justify-between gap-3">
                  <span className="font-bold text-lg text-[var(--color-base-text)] truncate">{d.name}</span>
                  <button
                    onClick={() => handleDeleteDepartment(d.id, d.name)}
                    className="p-2 rounded-xl bg-red-100 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-clay-btn flex-shrink-0"
                    title="Delete department"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
              {departments.length === 0 && (
                <p className="text-[var(--color-base-text)] opacity-40 font-medium">No departments yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── SYSTEM CONTROLS TAB ──────────────────────── */}
      {activeTab === "system" && (
        <div className="flex flex-col gap-6 max-w-2xl">

          {/* Maintenance Mode */}
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Wrench size={20} className="text-[var(--color-base-text)] opacity-60" />
                <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Maintenance Mode</h2>
              </div>
              <p className="text-sm opacity-60 font-medium text-[var(--color-base-text)] ml-8">
                Blocks all HOD and STAFF users from accessing the system. Only Admins can log in.
                A maintenance animation is shown to blocked users.
              </p>
            </div>
            <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--color-base-yellow)] shadow-clay-pressed">
              <div>
                <p className="font-extrabold text-[var(--color-base-text)]">Status</p>
                <p className="text-sm font-bold opacity-60">
                  {systemSettings.MAINTENANCE_MODE === "true" ? "🔴 System is in maintenance" : "🟢 System is live"}
                </p>
              </div>
              <button
                onClick={() => toggleSetting("MAINTENANCE_MODE", systemSettings.MAINTENANCE_MODE || "false")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                  systemSettings.MAINTENANCE_MODE === "true"
                    ? "bg-red-500 text-white shadow-clay-btn"
                    : "bg-[var(--color-base-bg)] text-[var(--color-base-text)] shadow-clay-btn"
                }`}
              >
                {systemSettings.MAINTENANCE_MODE === "true" ? "DEACTIVATE" : "ACTIVATE"}
              </button>
            </div>
          </div>

          {/* Developer Control Mode */}
          <div className={`p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-5 transition-colors ${
            systemSettings.DEVELOPER_MODE === "true"
              ? "bg-black border-2 border-red-500"
              : "bg-[var(--color-base-bg)]"
          }`}>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <TerminalSquare size={20} className={systemSettings.DEVELOPER_MODE === "true" ? "text-red-500" : "text-[var(--color-base-text)] opacity-60"} />
                <h2 className={`text-2xl font-bold ${systemSettings.DEVELOPER_MODE === "true" ? "text-white" : "text-[var(--color-base-text)]"}`}>
                  Developer Control Mode
                </h2>
              </div>
              <p className={`text-sm font-medium ml-8 ${systemSettings.DEVELOPER_MODE === "true" ? "text-red-400" : "text-[var(--color-base-text)] opacity-60"}`}>
                Enables the White/Black/Red developer theme globally. Requires backup confirmation before activation.
                {!backupConfirmed && systemSettings.DEVELOPER_MODE !== "true" && (
                  <span className="block mt-1 font-bold text-orange-500">⚠ A backup gate confirmation is required to enable.</span>
                )}
                {systemSettings.DEVELOPER_MODE === "true" && (
                  <span className="block mt-1 font-bold text-red-400">⚡ Developer mode is ACTIVE. All users see the dev theme.</span>
                )}
              </p>
            </div>
            <div className={`flex items-center justify-between p-5 rounded-2xl ${
              systemSettings.DEVELOPER_MODE === "true" ? "bg-red-900/30 border border-red-500/30" : "bg-[var(--color-base-mint)] shadow-clay-pressed"
            }`}>
              <div>
                <p className={`font-extrabold ${systemSettings.DEVELOPER_MODE === "true" ? "text-white" : "text-[var(--color-base-text)]"}`}>
                  Dev Mode
                </p>
                <p className={`text-sm font-bold ${systemSettings.DEVELOPER_MODE === "true" ? "text-red-400" : "opacity-60"}`}>
                  {systemSettings.DEVELOPER_MODE === "true" ? "ENABLED (Backup Gate Passed)" : "DISABLED"}
                </p>
              </div>
              <button
                onClick={() => toggleSetting("DEVELOPER_MODE", systemSettings.DEVELOPER_MODE || "false")}
                className={`px-5 py-2.5 rounded-xl font-extrabold text-sm transition-all ${
                  systemSettings.DEVELOPER_MODE === "true"
                    ? "bg-red-500 text-white border border-red-400"
                    : "bg-[var(--color-base-bg)] text-[var(--color-base-text)] shadow-clay-btn"
                }`}
              >
                {systemSettings.DEVELOPER_MODE === "true" ? "DISABLE" : "ENABLE"}
              </button>
            </div>
            
            {systemSettings.DEVELOPER_MODE === "true" && (
              <div className="flex flex-col gap-4 p-5 rounded-2xl bg-red-900/30 border border-red-500/30 mt-4">
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-xs uppercase tracking-wider text-red-300">Custom Dev Announcement</label>
                  <textarea
                    placeholder="Enter an announcement for other users..." value={devAnnouncement}
                    onChange={e => setDevAnnouncement(e.target.value)} rows={2}
                    className="p-3 rounded-xl bg-black border border-red-500/50 outline-none font-medium text-white resize-none"
                  />
                </div>
                <button
                  onClick={saveDevAnnouncement} disabled={loading}
                  className="py-3 rounded-xl bg-red-500 text-white font-extrabold hover:bg-red-600 transition-all disabled:opacity-40"
                >
                  {loading ? "Saving..." : "Post Announcement"}
                </button>
              </div>
            )}
          </div>

          {/* Patch Notes Configuration */}
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FileText size={20} className="text-[var(--color-base-text)] opacity-60" />
                <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Patch Notes</h2>
              </div>
              <p className="text-sm opacity-60 font-medium text-[var(--color-base-text)] ml-8">
                Update the version and release notes displayed to all users in the sidebar.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Version Number</label>
                <input
                  type="text" placeholder="e.g. 1.2.0" value={patchVersion}
                  onChange={e => setPatchVersion(e.target.value)}
                  className="p-3 rounded-xl bg-[var(--color-base-bg)] shadow-inner outline-none font-bold text-[var(--color-base-text)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Release Notes / Content</label>
                <textarea
                  placeholder="What's new in this update..." value={patchContent}
                  onChange={e => setPatchContent(e.target.value)} rows={3}
                  className="p-3 rounded-xl bg-[var(--color-base-bg)] shadow-inner outline-none font-medium text-[var(--color-base-text)] resize-none"
                />
              </div>
              <button
                onClick={savePatchNote} disabled={loading}
                className="mt-2 py-3 rounded-xl bg-[var(--color-base-text)] text-[var(--color-base-bg)] font-extrabold shadow-clay-btn hover:shadow-clay-pressed transition-all disabled:opacity-40"
              >
                {loading ? "Saving..." : "Save Patch Note"}
              </button>
            </div>
          </div>

          {/* TURN Server Configuration */}
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-5">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <FileText size={20} className="text-[var(--color-base-text)] opacity-60" />
                <h2 className="text-2xl font-bold text-[var(--color-base-text)]">TURN Server (WebRTC)</h2>
              </div>
              <p className="text-sm opacity-60 font-medium text-[var(--color-base-text)] ml-8">
                Configure TURN server credentials for reliable WebRTC Calls/Camera connections across restrictive networks.
              </p>
            </div>
            <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">TURN URL</label>
                <input
                  type="text" placeholder="e.g. turn:global.turn.twilio.com:3478?transport=tcp" value={turnUrl}
                  onChange={e => setTurnUrl(e.target.value)}
                  className="p-3 rounded-xl bg-[var(--color-base-bg)] shadow-inner outline-none font-bold text-[var(--color-base-text)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Username</label>
                <input
                  type="text" placeholder="Username" value={turnUser}
                  onChange={e => setTurnUser(e.target.value)}
                  className="p-3 rounded-xl bg-[var(--color-base-bg)] shadow-inner outline-none font-bold text-[var(--color-base-text)]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Credential / Password</label>
                <input
                  type="password" placeholder="Password" value={turnPass}
                  onChange={e => setTurnPass(e.target.value)}
                  className="p-3 rounded-xl bg-[var(--color-base-bg)] shadow-inner outline-none font-bold text-[var(--color-base-text)]"
                />
              </div>
              <button
                onClick={saveTurnSettings} disabled={loading}
                className="mt-2 py-3 rounded-xl bg-[var(--color-base-text)] text-[var(--color-base-bg)] font-extrabold shadow-clay-btn hover:shadow-clay-pressed transition-all disabled:opacity-40"
              >
                {loading ? "Saving..." : "Save TURN Settings"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── BACKUP GATE MODAL ────────────────────────── */}
      {backupGateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="w-full max-w-md bg-black border-2 border-red-500 rounded-3xl p-8 flex flex-col gap-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <AlertTriangle size={28} className="text-red-500 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-extrabold text-white">Backup Gate</h2>
                <p className="text-sm text-red-400 font-medium mt-0.5">Developer mode requires explicit confirmation</p>
              </div>
            </div>

            <div className="bg-red-900/30 border border-red-500/30 rounded-2xl p-4 text-sm text-red-300 font-medium space-y-2">
              <p>⚠ Before enabling Developer Control Mode:</p>
              <ul className="list-disc list-inside space-y-1 opacity-80 text-xs">
                <li>Ensure a full system backup has been taken</li>
                <li>All STAFF/HOD sessions will inherit the developer theme</li>
                <li>Developer theme changes the entire UI to White/Black/Red</li>
                <li>This mode is intended for maintenance operations only</li>
              </ul>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-extrabold text-red-400 uppercase tracking-widest">
                Enter Backup Confirmation Code
              </label>
              <input
                type="text"
                placeholder="RITCONNECT-DEVMODE"
                value={backupCode}
                onChange={e => setBackupCode(e.target.value)}
                className="p-4 rounded-xl bg-[#1a1a1a] border border-red-500/50 text-white font-mono font-bold outline-none focus:border-red-500 transition-colors placeholder:opacity-20"
                onKeyDown={e => e.key === "Enter" && handleBackupConfirm()}
                autoFocus
              />
              <p className="text-[10px] text-red-400/60 font-medium">Hint: RITCONNECT-DEVMODE</p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => { setBackupGateOpen(false); setBackupCode(""); }}
                className="flex-1 py-3 rounded-xl border border-white/20 text-white font-bold text-sm hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleBackupConfirm}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-extrabold text-sm hover:bg-red-600 transition-all"
              >
                Confirm & Enable
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
