import Link from "next/link";
import { ClayButton } from "@/components/ui/ClayButton";

export default function Home() {
  return (
    <main className="h-screen bg-[var(--color-base-bg)] flex flex-col items-center justify-center overflow-hidden relative">
      
      {/* Subtle bg blobs */}
      <div className="absolute top-[-80px] left-[-80px] w-72 h-72 rounded-full bg-[var(--color-base-mint)] opacity-60 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-[-80px] right-[-80px] w-96 h-96 rounded-full bg-[var(--color-base-yellow)] opacity-40 blur-3xl pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center text-center gap-6 px-6 max-w-lg w-full">
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Connect Plus"
          className="w-24 h-24 drop-shadow-xl"
        />

        {/* Brand */}
        <div>
          <h1 className="text-5xl font-extrabold tracking-tight text-[var(--color-base-text)]">
            Connect<span className="opacity-60">+</span>
          </h1>
          <p className="mt-2 text-base text-[var(--color-base-text)] opacity-70 font-medium">
            The unified resource platform for HODs & Faculty.
          </p>
        </div>

        {/* CTA */}
        <Link href="/login" className="w-full max-w-xs">
          <ClayButton variant="primary" className="w-full py-4 text-base">
            Sign In
          </ClayButton>
        </Link>
      </div>
    </main>
  );
}
