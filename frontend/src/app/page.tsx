import Link from "next/link";
import { ClayButton } from "@/components/ui/ClayButton";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 gap-8">
      <div className="text-center space-y-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[var(--color-base-text)]">
          Connect Plus
        </h1>
        <p className="text-xl opacity-80 max-w-2xl">
          The unified intelligence and resource sharing platform for HODs, Faculty, and Administrators.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
        <Link href="/login">
          <ClayButton variant="primary">Login as Faculty</ClayButton>
        </Link>
        <Link href="/login">
          <ClayButton variant="solid">Admin Portal</ClayButton>
        </Link>
      </div>

      <div className="mt-16 p-8 rounded-3xl bg-[var(--color-base-bg)] shadow-clay-card w-full max-w-5xl">
        <h2 className="text-3xl font-semibold mb-8 text-center text-[var(--color-base-text)]">
          Platform Capabilities
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 rounded-2xl bg-[var(--color-base-mint)] shadow-clay-btn flex flex-col gap-3">
            <h3 className="text-xl font-bold">Resource Vault</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Centralized, departmental question banks, notes, and previous year papers categorized automatically.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-[var(--color-base-yellow)] shadow-solid border-2 border-[var(--color-base-text)] flex flex-col gap-3">
            <h3 className="text-xl font-bold">AI Curriculum Builder</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Auto-generate and review curriculum plans, bridging industry requirements and academic rigor in seconds.
            </p>
          </div>
          
          <div className="p-8 rounded-2xl bg-[var(--color-base-bg)] shadow-clay-pressed flex flex-col gap-3">
            <h3 className="text-xl font-bold">HOD Approvals</h3>
            <p className="text-sm opacity-90 leading-relaxed">
              Seamless workflow for faculty leave requests, resource uploads, and syllabus approval tracking.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
