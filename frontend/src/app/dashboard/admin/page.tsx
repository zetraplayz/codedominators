"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/context/session";
import { ClayButton } from "@/components/ui/ClayButton";
import { Building2, UserPlus, Shield, Mail, CreditCard } from "lucide-react";

export default function AdminControlPlane() {
  const { user } = useSession();
  const [activeTab, setActiveTab] = useState("users");

  // Departments State
  const [departments, setDepartments] = useState<any[]>([]);
  const [newDeptName, setNewDeptName] = useState("");

  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [newUser, setNewUser] = useState({
    full_name: "",
    email: "",
    employee_id: "",
    password: "",
    role: "STAFF",
    department_id: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (user?.role === "ADMIN") {
      fetchDepartments();
      fetchUsers();
    }
  }, [user]);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/admin/departments", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDepartments(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch("/api/admin/departments", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName })
      });
      if (res.ok) {
        setMessage({ type: "success", text: "Department created!" });
        setNewDeptName("");
        fetchDepartments();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail || "Error creating department" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });
    try {
      const body = {
        ...newUser,
        department_id: newUser.department_id ? parseInt(newUser.department_id) : null
      };
      const res = await fetch("/api/admin/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });
      if (res.ok) {
        setMessage({ type: "success", text: "User created!" });
        setNewUser({ full_name: "", email: "", employee_id: "", password: "", role: "STAFF", department_id: "" });
        fetchUsers();
      } else {
        const err = await res.json();
        setMessage({ type: "error", text: err.detail || "Error creating user" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
    setLoading(false);
  };

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <p className="font-bold text-[var(--color-base-text)]">Admin Access Required</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-extrabold text-[var(--color-base-text)]">Admin Control Plane</h1>
        <p className="opacity-70 mt-2 font-medium text-[var(--color-base-text)]">Manage departments and user access globally.</p>
      </div>

      <div className="flex gap-4 border-b border-[var(--color-base-text)]/10 pb-4">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-5 py-2 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
            activeTab === "users" ? "bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]" : "opacity-50 hover:opacity-100"
          }`}
        >
          <UserPlus size={16} /> Users
        </button>
        <button
          onClick={() => setActiveTab("departments")}
          className={`px-5 py-2 font-bold rounded-xl text-sm flex items-center gap-2 transition-all ${
            activeTab === "departments" ? "bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]" : "opacity-50 hover:opacity-100"
          }`}
        >
          <Building2 size={16} /> Departments
        </button>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl font-bold text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {message.text}
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && (
        <div className="flex flex-col gap-8">
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card">
            <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-6">Create New User</h2>
            <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Full Name</label>
                <input required type="text" value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Official Email</label>
                <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Employee ID</label>
                <input required type="text" value={newUser.employee_id} onChange={e => setNewUser({...newUser, employee_id: e.target.value})} className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Password</label>
                <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Role</label>
                <select required value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none font-bold">
                  <option value="STAFF">STAFF</option>
                  <option value="HOD">HOD</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Department</label>
                <select required={newUser.role !== "ADMIN"} value={newUser.department_id} onChange={e => setNewUser({...newUser, department_id: e.target.value})} className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none font-bold">
                  <option value="">-- None / Select --</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2 mt-2">
                <ClayButton type="submit" variant="primary" disabled={loading} className="w-full">
                  {loading ? 'Creating...' : 'Create User'}
                </ClayButton>
              </div>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--color-base-text)] mb-4">All Users ({users.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {users.map(u => (
                <div key={u.id} className="p-5 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-card flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-lg">{u.full_name}</p>
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-extrabold shadow-clay-pressed ${u.role === 'ADMIN' ? 'bg-[var(--color-base-yellow)]' : 'bg-[var(--color-base-mint)]'}`}>
                      {u.role}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-sm font-medium opacity-80">
                    <p className="flex items-center gap-2"><Mail size={14}/> {u.email}</p>
                    <p className="flex items-center gap-2"><CreditCard size={14}/> {u.employee_id}</p>
                    <p className="flex items-center gap-2"><Building2 size={14}/> {u.department_name || 'No Dept'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DEPARTMENTS TAB */}
      {activeTab === "departments" && (
        <div className="flex flex-col gap-8">
          <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card max-w-xl">
            <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-6">Create Department</h2>
            <form onSubmit={handleCreateDepartment} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider opacity-70">Department Name</label>
                <input required type="text" value={newDeptName} onChange={e => setNewDeptName(e.target.value)} placeholder="e.g. Computer Science" className="p-4 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-pressed outline-none font-bold" />
              </div>
              <ClayButton type="submit" variant="primary" disabled={loading}>
                {loading ? 'Creating...' : 'Create Department'}
              </ClayButton>
            </form>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[var(--color-base-text)] mb-4">All Departments ({departments.length})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {departments.map(d => (
                <div key={d.id} className="p-6 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-card flex items-center justify-between">
                  <span className="font-bold text-lg text-[var(--color-base-text)]">{d.name}</span>
                  <span className="px-3 py-1 rounded-xl bg-[var(--color-base-mint)] shadow-clay-pressed text-xs font-bold opacity-70">
                    ID: {d.id}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
