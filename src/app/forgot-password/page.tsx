"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) { setMessage("Password recovery is not configured."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (error) setMessage(error.message);
    else router.push(`/reset-password?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <section className="section"><div className="form-shell">
      <span className="eyebrow">Account recovery</span><h1>Forgot your password?</h1>
      <p>Enter your registered email address. We'll send you a six-digit verification code.</p>
      <form onSubmit={submit}>
        <div className="field"><label htmlFor="recovery-email">Email address</label>
          <input id="recovery-email" type="email" autoComplete="email" required value={email} onChange={e=>setEmail(e.target.value)} /></div>
        <button className="btn" disabled={busy}>{busy ? "Sending code…" : "Send verification code"}</button>
      </form>
      {message && <p role="status" className="notice">{message}</p>}
    </div></section>
  );
}