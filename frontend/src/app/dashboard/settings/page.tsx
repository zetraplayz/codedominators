"use client";

import { useState } from "react";
import { ClayButton } from "@/components/ui/ClayButton";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);

  // Mock states for now (to be wired to Supabase later)
  const [fullName, setFullName] = useState('John Doe');
  const [role, setRole] = useState('STAFF');
  const [education, setEducation] = useState('Ph.D in Computer Science');
  const [department, setDepartment] = useState('Computer Science');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      alert('Settings saved successfully!');
    }, 1000);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--color-base-text)]">Settings</h1>
        <p className="opacity-70 mt-2 font-medium text-[var(--color-base-text)]">Manage your profile and platform preferences.</p>
      </div>

      <div className="flex gap-4 border-b border-black/10 pb-4">
        <button 
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'profile' ? 'bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]' : 'opacity-60 hover:opacity-100 text-[var(--color-base-text)]'}`}
        >
          Profile
        </button>
        <button 
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'notifications' ? 'bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]' : 'opacity-60 hover:opacity-100 text-[var(--color-base-text)]'}`}
        >
          Notifications
        </button>
        <button 
          onClick={() => setActiveTab('security')}
          className={`px-4 py-2 font-bold rounded-xl transition-all ${activeTab === 'security' ? 'bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]' : 'opacity-60 hover:opacity-100 text-[var(--color-base-text)]'}`}
        >
          Security
        </button>
      </div>

      {activeTab === 'profile' && (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-2">Personal Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Full Name</label>
              <input 
                type="text" 
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Role</label>
              <input 
                type="text" 
                value={role}
                disabled
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] opacity-70 text-[var(--color-base-text)] font-medium cursor-not-allowed"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Education</label>
              <input 
                type="text" 
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Department</label>
              <input 
                type="text" 
                value={department}
                disabled
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] opacity-70 text-[var(--color-base-text)] font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <ClayButton onClick={handleSave} disabled={saving} variant="primary">
              {saving ? 'Saving...' : 'Save Profile Settings'}
            </ClayButton>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-2">Notification Preferences</h2>
          
          <div className="flex items-center justify-between p-4 bg-[var(--color-base-mint)] rounded-2xl shadow-clay-pressed">
            <div>
              <p className="font-bold text-[var(--color-base-text)]">Email Notifications</p>
              <p className="text-sm opacity-70 font-medium">Receive permission requests via email</p>
            </div>
            <button 
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-14 h-8 rounded-full flex items-center p-1 transition-all ${notificationsEnabled ? 'bg-green-400' : 'bg-[var(--color-base-mint)] border border-black/10 shadow-clay-pressed inner'}`}
            >
              <div className={`w-6 h-6 bg-[var(--color-base-bg)] rounded-full shadow-clay-btn transition-all ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
            </button>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)] mb-2">Security</h2>
          <p className="opacity-70 font-medium text-sm">Security settings are managed by your institution administrator.</p>
        </div>
      )}

    </div>
  );
}
