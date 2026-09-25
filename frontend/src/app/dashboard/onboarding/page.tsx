"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ClayButton } from "@/components/ui/ClayButton";

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    education: '',
    departmentId: '',
    jobProfile: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call to save profile details
    setTimeout(() => {
      setLoading(false);
      // Once done, redirect them back to the main dashboard
      router.push('/dashboard');
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-4">
      <div className="w-full max-w-2xl bg-[var(--color-base-bg)] p-8 md:p-12 rounded-[3rem] shadow-clay-card border border-white/30">
        <h1 className="text-3xl font-bold text-[var(--color-base-text)] text-center mb-2">Complete Your Profile</h1>
        <p className="opacity-70 text-center font-medium mb-8">
          Welcome to Connect Plus! Let's get your profile set up so you can start collaborating.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Full Name</label>
              <input 
                type="text" 
                required
                value={formData.fullName}
                onChange={e => setFormData({...formData, fullName: e.target.value})}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
                placeholder="Dr. Sarah Connor"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Education</label>
              <input 
                type="text" 
                required
                value={formData.education}
                onChange={e => setFormData({...formData, education: e.target.value})}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
                placeholder="Ph.D in AI"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Department</label>
              <select
                required
                value={formData.departmentId}
                onChange={e => setFormData({...formData, departmentId: e.target.value})}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium appearance-none"
              >
                <option value="" disabled>Select a department</option>
                <option value="1">Computer Science</option>
                <option value="2">Mechanical Engineering</option>
                <option value="3">Information Technology</option>
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="font-bold text-sm text-[var(--color-base-text)]">Job Profile / Designation</label>
              <input 
                type="text" 
                required
                value={formData.jobProfile}
                onChange={e => setFormData({...formData, jobProfile: e.target.value})}
                className="p-4 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-mint)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium"
                placeholder="Senior Lecturer"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-bold text-sm text-[var(--color-base-text)]">Profile Picture</label>
            <div className="p-8 rounded-2xl border-2 border-dashed border-[var(--color-base-text)] border-opacity-20 bg-[var(--color-base-mint)] text-center cursor-pointer hover:bg-[var(--color-base-bg)] transition-colors">
              <p className="font-bold">Click to upload photo (Optional)</p>
              <p className="text-xs opacity-70 mt-1">JPEG, PNG under 2MB</p>
            </div>
          </div>

          <div className="mt-4">
            <ClayButton type="submit" variant="primary" disabled={loading} className="w-full h-14 text-lg">
              {loading ? 'Saving Profile...' : 'Complete Setup'}
            </ClayButton>
          </div>
        </form>
      </div>
    </div>
  );
}
