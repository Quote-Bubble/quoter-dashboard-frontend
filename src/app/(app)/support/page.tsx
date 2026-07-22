"use client";

import { useState } from "react";

import PageHeader from "@/components/PageHeader";
import FaqAccordion from "@/components/FaqAccordion";
import Toast from "@/components/Toast";

const SUPPORT_EMAIL = "support@quoter.com";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const canSend = subject.trim() !== "" && message.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;
    setSending(true);
    // Mock send — no real email.
    setTimeout(() => {
      setSending(false);
      setSubject("");
      setMessage("");
      setToast("Message sent — we'll reply by email");
    }, 700);
  };

  return (
    <>
      <PageHeader
        title="Support"
        subtitle="Questions about your quotes, pricing or setup? We're here to help."
      />

      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        {/* Left: contact + FAQ */}
        <div className="space-y-6">
          <div className="glass rounded-2xl p-5 sm:p-6">
            <p className="section-label">Get in touch</p>
            <h2 className="font-display mt-2 text-lg font-semibold text-ink">
              Talk to a human
            </h2>
            <p className="mt-1 text-sm text-ink-soft">
              Email us any time and we&apos;ll get back to you within one working
              day.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="btn-ghost mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
            >
              <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="5" width="18" height="14" rx="2.5" />
                <path d="M4 7l8 6 8-6" />
              </svg>
              {SUPPORT_EMAIL}
            </a>
          </div>

          <div>
            <h2 className="font-display mb-3 text-lg font-semibold text-ink">
              Common questions
            </h2>
            <FaqAccordion />
          </div>
        </div>

        {/* Right: contact form */}
        <form onSubmit={handleSubmit} className="surface rounded-2xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-semibold text-ink">
            Send us a message
          </h2>
          <p className="mt-1 text-sm text-muted">
            We&apos;ll reply to {" "}
            <span className="font-medium text-ink-soft">your account email</span>.
          </p>

          <div className="mt-5 space-y-4">
            <div>
              <label
                htmlFor="subject"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Subject
              </label>
              <input
                id="subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="What do you need help with?"
                className="field w-full px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block text-sm font-medium text-ink"
              >
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={6}
                placeholder="Tell us a bit more…"
                className="field w-full resize-y px-3 py-2.5 text-sm text-ink outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSend || sending}
            className="btn-primary mt-5 w-full rounded-full px-4 py-2.5 text-sm font-semibold"
          >
            {sending ? "Sending…" : "Send message"}
          </button>
        </form>
      </div>

      <Toast message={toast} onDone={() => setToast(null)} />
    </>
  );
}
