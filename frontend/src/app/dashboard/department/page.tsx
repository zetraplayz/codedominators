'use client';

import { useState, useEffect } from 'react';
import { Users, Mail, GraduationCap, Briefcase, BookOpen, FileText } from 'lucide-react';
import { useSession } from '@/context/session';

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  designation?: string;
  profile_photo?: string;
}

interface Resource {
  id: number;
  title: string;
  description: string;
  visibility: string;
  created_at: string;
  owner_id: string;
  owner_name: string;
  owner_photo: string | null;
}

export default function DepartmentPage() {
  const { user } = useSession();
  const [members, setMembers] = useState<Member[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/departments', { credentials: 'include' }).then(res => res.ok ? res.json() : []),
      fetch('/api/departments/resources', { credentials: 'include' }).then(res => res.ok ? res.json() : [])
    ])
      .then(([membersData, resourcesData]) => {
        setMembers(Array.isArray(membersData) ? membersData : []);
        setResources(Array.isArray(resourcesData) ? resourcesData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center bg-[var(--color-base-mint)] p-6 rounded-3xl shadow-clay-card border border-white/20">
        <div>
          <h1 className="text-3xl font-extrabold text-[var(--color-base-text)] tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 opacity-80" />
            {user?.department || 'Department'} Directory
          </h1>
          <p className="text-[var(--color-base-text)] opacity-60 mt-1 font-medium tracking-wide">
            Faculty network — {members.length} member{members.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-48 rounded-3xl bg-[var(--color-base-mint)] shadow-clay-card animate-pulse" />
          ))}
        </div>
      ) : members.length === 0 ? (
        <div className="bg-[var(--color-base-mint)] p-8 rounded-3xl shadow-clay-card border border-white/20 flex flex-col items-center justify-center min-h-[300px] gap-4">
          <Users className="w-16 h-16 text-[var(--color-base-text)] opacity-20" />
          <h2 className="text-xl font-bold text-[var(--color-base-text)]">No department members found</h2>
          <p className="text-[var(--color-base-text)] opacity-60 font-medium text-center max-w-sm">
            You are not assigned to a department yet. Update your department in{' '}
            <a href="/dashboard/settings" className="underline font-bold">Settings</a>.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map(member => (
            <div key={member.id} className="p-6 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card flex flex-col gap-4 hover:shadow-clay-pressed transition-all">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn flex items-center justify-center overflow-hidden flex-shrink-0">
                  {member.profile_photo ? (
                    <img src={member.profile_photo} alt={member.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl font-extrabold text-[var(--color-base-text)] opacity-40">
                      {member.name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base text-[var(--color-base-text)] truncate">{member.name}</h3>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-[var(--color-base-yellow)] shadow-clay-btn text-[10px] font-bold mt-1">
                    {member.role}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-4 border-t border-[var(--color-base-text)]/10">
                <div className="flex items-center gap-2 text-[var(--color-base-text)] opacity-70 text-sm font-medium">
                  <Mail size={14} />
                  <a href={`mailto:${member.email}`} className="truncate hover:underline">{member.email}</a>
                </div>
                {member.designation && (
                  <div className="flex items-center gap-2 text-[var(--color-base-text)] opacity-70 text-sm font-medium">
                    <Briefcase size={14} />
                    <span className="truncate">{member.designation}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Department Resources Section */}
      <div className="flex justify-between items-center bg-[var(--color-base-mint)] p-6 rounded-3xl shadow-clay-card border border-white/20 mt-12">
        <div>
          <h2 className="text-2xl font-extrabold text-[var(--color-base-text)] tracking-tight flex items-center gap-3">
            <BookOpen className="w-6 h-6 opacity-80" />
            Department Resources
          </h2>
          <p className="text-[var(--color-base-text)] opacity-60 mt-1 font-medium tracking-wide">
            Shared knowledge within {user?.department || 'the department'} — {resources.length} items
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map(i => (
            <div key={i} className="h-32 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-pressed animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-[var(--color-base-bg)] p-8 rounded-3xl shadow-clay-card border border-white/20 flex flex-col items-center justify-center min-h-[200px] gap-4">
          <BookOpen className="w-12 h-12 text-[var(--color-base-text)] opacity-20" />
          <h2 className="text-lg font-bold text-[var(--color-base-text)]">No resources found</h2>
          <p className="text-[var(--color-base-text)] opacity-60 font-medium text-center max-w-sm text-sm">
            Staff members haven't shared any resources with the department yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map(resource => (
            <a key={resource.id} href={`/dashboard/resources/${resource.id}`} className="p-6 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card flex flex-col gap-4 hover:shadow-clay-pressed transition-all">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-lg text-[var(--color-base-text)] truncate">{resource.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="w-6 h-6 rounded-full bg-[var(--color-base-mint)] shadow-clay-btn flex flex-shrink-0 items-center justify-center overflow-hidden">
                      {resource.owner_photo ? (
                        <img src={resource.owner_photo} alt={resource.owner_name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-[10px] font-extrabold text-[var(--color-base-text)] opacity-40">
                          {resource.owner_name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-medium text-[var(--color-base-text)] opacity-70 truncate">{resource.owner_name}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 bg-[var(--color-base-mint)] p-3 rounded-2xl shadow-clay-btn">
                  <FileText className="w-6 h-6 text-[var(--color-base-text)]" />
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
