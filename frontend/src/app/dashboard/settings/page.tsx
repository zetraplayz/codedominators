"use client";

import { useState, useEffect, useRef } from "react";
import { ClayButton } from "@/components/ui/ClayButton";
import { useSession } from "@/context/session";
import { Camera, Check, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const { user, refresh } = useSession();

  const [fullName, setFullName] = useState('');
  const [education, setEducation] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [jobProfile, setJobProfile] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [assignedCourses, setAssignedCourses] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState('');

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line
      setFullName(user.name || '');
      // eslint-disable-next-line
      setEducation(user.education || '');
      // eslint-disable-next-line
      setDesignation(user.designation || '');
      // eslint-disable-next-line
      setDepartment(user.department || '');
      // eslint-disable-next-line
      setJobProfile(user.job_profile || '');
      // eslint-disable-next-line
      setSpecialization(user.specialization || '');
      // eslint-disable-next-line
      setAssignedCourses(user.assigned_courses || '');
      // eslint-disable-next-line
      setMobileNumber(user.mobile_number || '');
      // eslint-disable-next-line
      setShortBio(user.short_bio || '');
      // eslint-disable-next-line
      setPhotoPreview(user.profile_photo || null);
    }
  }, [user]);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = ev => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(f);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const body: Record<string, string> = { full_name: fullName };
      if (education) body.education = education;
      if (designation) body.designation = designation;
      if (department) body.department = department;
      if (jobProfile) body.job_profile = jobProfile;
      if (specialization) body.specialization = specialization;
      if (assignedCourses) body.assigned_courses = assignedCourses;
      if (mobileNumber) body.mobile_number = mobileNumber;
      if (shortBio) body.short_bio = shortBio;
      if (photoPreview && photoPreview.startsWith('data:')) body.profile_photo = photoPreview;

      const res = await fetch('/api/auth/me', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await refresh();
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        const error = await res.json().catch(() => ({}));
        setSaveError('Failed: ' + (error.detail || 'Unknown error'));
      }
    } catch {
      setSaveError('Network error while saving');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError('');
    if (!oldPassword) {
      setPwError('Please enter your current password');
      return;
    }
    if (newPassword.length < 6) {
      setPwError('New password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('New passwords do not match');
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
      });
      if (res.ok) {
        setPwSaved(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPwSaved(false), 4000);
      } else {
        const error = await res.json().catch(() => ({}));
        setPwError(error.detail || 'Failed to update password');
      }
    } catch {
      setPwError('Network error while updating password');
    } finally {
      setPwSaving(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-4xl font-bold text-[var(--color-base-text)]">Settings</h1>
        <p className="opacity-70 mt-2 font-medium text-[var(--color-base-text)]">Manage your profile and preferences.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 border-b border-[var(--color-base-text)]/10 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-bold rounded-xl text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-[var(--color-base-mint)] shadow-clay-pressed text-[var(--color-base-text)]'
                : 'opacity-50 hover:opacity-100 text-[var(--color-base-text)]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Personal Information</h2>

          {/* Profile Photo */}
          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn overflow-hidden flex items-center justify-center">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-4xl font-extrabold text-[var(--color-base-text)] opacity-40 select-none">
                    {fullName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-[var(--color-base-yellow)] shadow-clay-btn flex items-center justify-center hover:shadow-clay-pressed transition-all"
              >
                <Camera size={14} className="text-[var(--color-base-text)]" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-lg text-[var(--color-base-text)]">{fullName || 'Your Name'}</p>
                {user?.member_number && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-[var(--color-base-yellow)] text-[var(--color-base-text)] shadow-clay-btn">
                    {user.member_number}
                  </span>
                )}
              </div>
              <p className="text-sm text-[var(--color-base-text)] opacity-60 font-medium">
                {user?.role} · {user?.email}
              </p>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-xs font-bold text-[var(--color-base-text)] opacity-50 hover:opacity-100 transition-opacity mt-1 underline"
              >
                Change photo
              </button>
            </div>
          </div>

          {/* Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)] flex items-center justify-between">
                <span>Member Number</span>
                <span className="text-[10px] uppercase font-black text-green-700 bg-green-100 px-2 py-0.5 rounded-full">Permanent Institutional ID</span>
              </label>
              <input
                type="text"
                value={user?.member_number || 'RCP-PENDING'}
                disabled
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-yellow)]/30 text-[var(--color-base-text)] font-black tracking-wide cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Employee ID</label>
              <input
                type="text"
                value={user?.employee_id || ''}
                disabled
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] opacity-50 text-[var(--color-base-text)] font-medium cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] opacity-50 text-[var(--color-base-text)] font-medium cursor-not-allowed"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Department</label>
              <input
                type="text"
                value={department}
                onChange={e => setDepartment(e.target.value)}
                placeholder="e.g. Computer Science"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Designation</label>
              <input
                type="text"
                value={designation}
                onChange={e => setDesignation(e.target.value)}
                placeholder="e.g. Associate Professor"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Education / Qualification</label>
              <input
                type="text"
                value={education}
                onChange={e => setEducation(e.target.value)}
                placeholder="e.g. Ph.D. Computer Science"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Job Profile</label>
              <input
                type="text"
                value={jobProfile}
                onChange={e => setJobProfile(e.target.value)}
                placeholder="e.g. Senior Researcher"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Specialization</label>
              <input
                type="text"
                value={specialization}
                onChange={e => setSpecialization(e.target.value)}
                placeholder="e.g. Artificial Intelligence"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Mobile Number</label>
              <input
                type="tel"
                value={mobileNumber}
                onChange={e => setMobileNumber(e.target.value)}
                placeholder="e.g. +1 234 567 890"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Assigned Courses</label>
              <input
                type="text"
                value={assignedCourses}
                onChange={e => setAssignedCourses(e.target.value)}
                placeholder="e.g. CS101, CS201"
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium"
              />
            </div>

            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Short Bio</label>
              <textarea
                value={shortBio}
                onChange={e => setShortBio(e.target.value)}
                placeholder="Tell us a bit about yourself..."
                rows={3}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium resize-y"
              />
            </div>
          </div>

          {/* Save */}
          <div className="mt-2 flex justify-end items-center gap-4">
            {saveError && <span className="text-sm font-bold text-red-500">{saveError}</span>}
            {saved && (
              <span className="flex items-center gap-1.5 text-sm font-bold text-green-600">
                <Check size={15} /> Saved!
              </span>
            )}
            <ClayButton onClick={handleSave} disabled={saving} variant="primary" className="flex items-center gap-2 min-w-[160px] justify-center">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Saving...' : 'Save Changes'}
            </ClayButton>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Notification Preferences</h2>

          <div className="flex items-center justify-between p-5 bg-[var(--color-base-mint)] rounded-2xl shadow-clay-pressed">
            <div>
              <p className="font-bold text-[var(--color-base-text)]">In-App Notifications</p>
              <p className="text-sm opacity-60 font-medium text-[var(--color-base-text)] mt-0.5">
                Alerts for access requests, approvals, and activity
              </p>
            </div>
            <button
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              className={`w-14 h-8 rounded-full flex items-center p-1 transition-all ${
                notificationsEnabled ? 'bg-green-400' : 'bg-[var(--color-base-bg)] shadow-clay-pressed'
              }`}
            >
              <div className={`w-6 h-6 bg-white rounded-full shadow-clay-btn transition-all ${notificationsEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
            </button>
          </div>

          <p className="text-xs text-[var(--color-base-text)] opacity-40 font-medium">
            Email delivery requires SMTP configuration by your administrator.
          </p>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-[2rem] shadow-clay-card flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-[var(--color-base-text)]">Security & Password</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-[var(--color-base-mint)] rounded-2xl shadow-clay-pressed">
              <p className="text-xs font-bold text-[var(--color-base-text)] opacity-50 uppercase tracking-widest mb-1">Account Email</p>
              <p className="font-bold text-[var(--color-base-text)]">{user?.email}</p>
            </div>

            <div className="p-5 bg-[var(--color-base-mint)] rounded-2xl shadow-clay-pressed">
              <p className="text-xs font-bold text-[var(--color-base-text)] opacity-50 uppercase tracking-widest mb-1">Institutional Member Number</p>
              <p className="font-black text-[var(--color-base-text)]">{user?.member_number || 'RCP-PENDING'}</p>
            </div>
          </div>

          <div className="mt-4 pt-6 border-t border-[var(--color-base-text)]/10">
            <h3 className="text-lg font-bold text-[var(--color-base-text)] mb-2">Change Password</h3>
            <p className="opacity-70 text-sm font-medium mb-6">
              Update your account password. For newly provisioned accounts, replace your initial date-of-birth password with a strong custom credential.
            </p>

            <form onSubmit={handlePasswordChange} className="flex flex-col gap-4 max-w-lg">
              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--color-base-text)] opacity-70">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={e => setOldPassword(e.target.value)}
                  placeholder="Enter current or default DOB password"
                  className="p-3.5 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--color-base-text)] opacity-70">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="p-3.5 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium text-sm"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-bold text-xs uppercase tracking-wider text-[var(--color-base-text)] opacity-70">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="p-3.5 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)]/30 text-[var(--color-base-text)] font-medium text-sm"
                  required
                />
              </div>

              {pwError && (
                <div className="p-3.5 bg-red-100 border border-red-200 text-red-700 text-xs font-bold rounded-xl shadow-sm">
                  {pwError}
                </div>
              )}

              {pwSaved && (
                <div className="p-3.5 bg-green-100 border border-green-200 text-green-700 text-xs font-bold rounded-xl shadow-sm flex items-center gap-2">
                  <Check size={16} /> Password updated successfully!
                </div>
              )}

              <div className="mt-2">
                <ClayButton
                  type="submit"
                  disabled={pwSaving}
                  variant="primary"
                  className="flex items-center gap-2 px-6 py-3 font-bold text-sm justify-center"
                >
                  {pwSaving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  {pwSaving ? 'Updating Password...' : 'Update Password'}
                </ClayButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
