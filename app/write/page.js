"use client";

import { useState } from "react";
import Link from "next/link";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function todayStamp() {
  return new Date()
    .toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase();
}

export default function WritePage() {
  const [email, setEmail] = useState("");
  const [letter, setLetter] = useState("");
  const [deliverOn, setDeliverOn] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sealed | error
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();

    if (!EMAIL_PATTERN.test(email)) {
      setErrorMessage("Add a valid email so we know this letter is yours.");
      return;
    }
    if (letter.trim().length === 0) {
      setErrorMessage("Write something before you seal it.");
      return;
    }

    setErrorMessage("");
    setStatus("sending");

    try {
      const res = await fetch("/api/submit-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, letter, deliverOn: deliverOn || null }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "That didn't save. Try again.");
      }

      setStatus("sealed");
    } catch (err) {
      setStatus("error");
      setErrorMessage(err.message || "Something went wrong. Try again.");
    }
  }

  if (status === "sealed") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-midnight px-6 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-seal text-midnight">
          <svg viewBox="0 0 24 24" fill="none" className="h-8 w-8">
            <path
              d="M4 7l8 6 8-6M4 7v10a1 1 0 001 1h14a1 1 0 001-1V7M4 7l8-4 8 4"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="mt-6 font-display text-2xl text-paper">Sealed.</h1>
        <p className="mt-2 max-w-sm text-sm text-mist">
          Your future self has mail. It&apos;s saved safely until you go looking for it.
        </p>
        <Link
          href="/write"
          onClick={() => {
            setEmail("");
            setLetter("");
            setDeliverOn("");
            setStatus("idle");
          }}
          className="mt-8 font-mono text-xs uppercase tracking-[0.2em] text-seal underline-offset-4 hover:underline"
        >
          Write another
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-midnight px-4 py-12">
      <form
        onSubmit={handleSubmit}
        className="relative w-full max-w-xl rounded-2xl bg-paper p-8 text-midnight shadow-2xl sm:p-10"
      >
        <span className="absolute right-6 top-6 font-mono text-[11px] tracking-widest text-midnight/50">
          {todayStamp()}
        </span>

        <h1 className="font-display text-2xl text-midnight">Dear future me,</h1>

        <div className="mt-8">
          <label htmlFor="email" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-midnight/60">
            Your email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            className="mt-2 w-full border-b border-midnight/20 bg-transparent pb-2 font-body text-base text-midnight placeholder:text-midnight/30 focus:border-seal focus:outline-none"
          />
        </div>

        <div className="mt-8">
          <label htmlFor="letter" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-midnight/60">
            Your letter
          </label>
          <textarea
            id="letter"
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="Whatever you want them to remember..."
            rows={10}
            className="mt-2 w-full resize-none border-b border-midnight/20 bg-transparent pb-2 font-body text-base leading-relaxed text-midnight placeholder:text-midnight/30 focus:border-seal focus:outline-none"
          />
        </div>

        <div className="mt-8">
          <label htmlFor="deliverOn" className="block font-mono text-[11px] uppercase tracking-[0.15em] text-midnight/60">
            Read again on (optional)
          </label>
          <input
            id="deliverOn"
            type="date"
            value={deliverOn}
            onChange={(e) => setDeliverOn(e.target.value)}
            className="mt-2 w-full border-b border-midnight/20 bg-transparent pb-2 font-mono text-sm text-midnight focus:border-seal focus:outline-none"
          />
          <p className="mt-1 font-body text-xs text-midnight/45">
            This just gets saved with the letter as a reminder date — no automatic email is sent yet.
          </p>
        </div>

        {errorMessage && (
          <p role="alert" className="mt-5 font-body text-sm text-rose-700">
            {errorMessage}
          </p>
        )}

        <button
          type="submit"
          disabled={status === "sending"}
          className="mt-9 flex h-16 w-16 items-center justify-center rounded-full bg-seal text-midnight transition-transform duration-150 ease-out hover:scale-105 active:animate-seal disabled:opacity-60 disabled:hover:scale-100"
        >
          <span className="font-display text-xs font-medium leading-tight">
            {status === "sending" ? "…" : "Seal"}
          </span>
        </button>
      </form>
    </main>
  );
}
