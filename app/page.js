import Link from "next/link";
import StarField from "@/components/StarField";

export default function LandingPage() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      {/* interactive candlelight dust — purely decorative, static for reduced-motion users */}
      <StarField />

      <div className="relative flex flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-mist">
          Future Letter
        </span>

        <h1 className="mt-6 max-w-2xl font-display text-4xl leading-tight text-paper sm:text-5xl">
          Write something your future self will thank you for.
        </h1>

        <p className="mt-5 max-w-md text-base text-mist">
          A quiet place to leave a letter for the person you&apos;re becoming.
        </p>

        <Link
          href="/write"
          className="group mt-10 flex h-28 w-28 items-center justify-center rounded-full bg-seal text-midnight shadow-[0_0_0_6px_rgba(232,185,88,0.12)] transition-transform duration-150 ease-out hover:scale-105 active:animate-seal"
        >
          <span className="px-4 text-center font-display text-sm font-medium leading-snug">
            Write a letter
          </span>
        </Link>
      </div>

      <footer className="relative pb-8 text-center font-mono text-[11px] text-mist/70">
        Private by default. Only you can read what you write.
      </footer>
    </main>
  );
}