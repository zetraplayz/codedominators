"use client";

import { useState } from "react";
import { Sparkles, Loader2, BookOpen, Layers, CheckCircle2 } from "lucide-react";
import { ClayButton } from "@/components/ui/ClayButton";
import { useRouter } from "next/navigation";

interface IntentResponse {
  course: string;
  unit: string;
  topics: string[];
  purpose: string;
  duration: string;
  difficulty: string;
  resource_types: string[];
  provider: string;
}

export default function TeachingIntentsPage() {
  const [requirement, setRequirement] = useState("");
  const [loading, setLoading] = useState(false);
  const [intent, setIntent] = useState<IntentResponse | null>(null);
  const [creatingKit, setCreatingKit] = useState(false);
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!requirement.trim()) return;
    setLoading(true);
    setIntent(null);

    try {
      const res = await fetch("/api/ai/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requirement })
      });

      if (res.ok) {
        const data = await res.json();
        setIntent(data);
      } else {
        alert("Failed to analyze intent");
      }
    } catch (e) {
      alert("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKit = async () => {
    if (!intent) return;
    setCreatingKit(true);

    try {
      const res = await fetch("/api/kits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${intent.unit || 'Unit'} - ${intent.topics[0] || 'Topics'}`,
          subject: intent.course || 'General'
        }),
        credentials: "include"
      });

      if (res.ok) {
        const kit = await res.json();
        router.push(`/dashboard/kits/${kit.id}`);
      } else {
        alert("Failed to create kit");
      }
    } catch (e) {
      alert("Network error");
    } finally {
      setCreatingKit(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-extrabold text-[var(--color-base-text)] tracking-tight">Teaching Intents</h1>
        <p className="text-[var(--color-base-text)] opacity-60 font-medium mt-1">
          Describe what you plan to teach, and MESH AI will structure a curriculum and prepare a kit.
        </p>
      </div>

      {/* Input Section */}
      <div className="bg-[var(--color-base-mint)] p-6 rounded-[2rem] shadow-clay-card flex flex-col gap-4">
        <div className="flex items-center gap-3 text-[var(--color-base-text)]">
          <Sparkles size={24} className="opacity-80" />
          <h2 className="text-xl font-bold">What are you planning to teach?</h2>
        </div>
        <form onSubmit={handleAnalyze} className="flex flex-col gap-4 mt-2">
          <textarea
            value={requirement}
            onChange={(e) => setRequirement(e.target.value)}
            placeholder="e.g., I want to teach a 2-hour lecture on Machine Learning covering Decision Trees and Random Forests for beginners. I'll need lecture notes and a lab manual."
            className="w-full min-h-[120px] p-5 rounded-2xl border-none outline-none shadow-clay-pressed bg-[var(--color-base-bg)] focus:ring-2 focus:ring-[var(--color-base-text)] text-[var(--color-base-text)] font-medium resize-none placeholder:opacity-40"
          />
          <div className="flex justify-end">
            <ClayButton type="submit" variant="primary" disabled={loading || !requirement.trim()} className="flex items-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
              {loading ? "Analyzing Intent..." : "Analyze Intent"}
            </ClayButton>
          </div>
        </form>
      </div>

      {/* Results Section */}
      {intent && (
        <div className="bg-[var(--color-base-yellow)] p-8 rounded-[2rem] shadow-clay-card animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-[var(--color-base-text)]/10 pb-6">
            <div>
              <h2 className="text-2xl font-extrabold text-[var(--color-base-text)] tracking-tight">Structured Intent</h2>
              <p className="text-[var(--color-base-text)] opacity-70 font-medium mt-1 text-sm">
                Generated via {intent.provider}
              </p>
            </div>
            <ClayButton onClick={handleCreateKit} disabled={creatingKit} className="flex items-center gap-2 bg-[var(--color-base-text)] text-[var(--color-base-yellow)] hover:scale-105 transition-transform font-bold px-6 py-3 rounded-2xl shadow-clay-btn">
              {creatingKit ? <Loader2 size={18} className="animate-spin" /> : <BookOpen size={18} />}
              Build Teaching Kit
            </ClayButton>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[var(--color-base-text)]">Course</span>
              <p className="font-extrabold text-lg text-[var(--color-base-text)]">{intent.course || 'N/A'}</p>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[var(--color-base-text)]">Unit</span>
              <p className="font-extrabold text-lg text-[var(--color-base-text)]">{intent.unit || 'N/A'}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[var(--color-base-text)]">Duration & Difficulty</span>
              <div className="flex items-center gap-3">
                <span className="bg-[var(--color-base-mint)] px-3 py-1 rounded-xl shadow-clay-btn text-sm font-bold text-[var(--color-base-text)]">{intent.duration || 'N/A'}</span>
                <span className="bg-[var(--color-base-bg)] px-3 py-1 rounded-xl shadow-clay-btn text-sm font-bold text-[var(--color-base-text)]">{intent.difficulty || 'N/A'}</span>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[var(--color-base-text)]">Purpose</span>
              <p className="font-bold text-[var(--color-base-text)]">{intent.purpose || 'N/A'}</p>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[var(--color-base-text)]">Extracted Topics</span>
              <div className="flex flex-wrap gap-2">
                {intent.topics.length > 0 ? intent.topics.map((t, idx) => (
                  <span key={idx} className="bg-[var(--color-base-text)]/10 px-3 py-1.5 rounded-xl font-bold text-sm text-[var(--color-base-text)] flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="opacity-50" />
                    {t}
                  </span>
                )) : <span className="opacity-50 font-medium">None extracted</span>}
              </div>
            </div>

            <div className="col-span-1 md:col-span-2 flex flex-col gap-2 mt-2">
              <span className="text-[10px] font-bold opacity-50 uppercase tracking-wider text-[var(--color-base-text)]">Recommended Resources</span>
              <div className="flex flex-wrap gap-2">
                {intent.resource_types.length > 0 ? intent.resource_types.map((rt, idx) => (
                  <span key={idx} className="bg-white/40 px-3 py-1.5 rounded-xl font-bold text-sm text-[var(--color-base-text)] flex items-center gap-1.5 shadow-clay-pressed">
                    <Layers size={14} className="opacity-50" />
                    {rt}
                  </span>
                )) : <span className="opacity-50 font-medium">None specified</span>}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
