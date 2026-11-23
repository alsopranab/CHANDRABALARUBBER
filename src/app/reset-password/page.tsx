"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [ready, setReady] = useState(false);
  const [valid, setValid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) {
      setMessage("Password recovery is not configured.");
      setReady(true);
      return;
    }
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setValid(!!session);
        if (session) setMessage("");
      }
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setValid(!!session);
      setReady(true);
      if (!session) setMessage("This recovery link is invalid or expired. Please request a new password reset email.");
    });
    return () => subscription.unsubscribe();
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) { setMessage("Password recovery is not configured."); return; }
    setBusy(true);
    setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMessage(error.message);
    else { setSuccess(true); setValid(false); setMessage("Password updated successfully. You can now sign in."); }
  }

  return (
    <section className="section">
      <div className="form-shell">
        <span className="eyebrow">Account recovery</span>
        <h1>Choose a new password.</h1>
        {!ready ? <p>Verifying your recovery link…</p> : success ? <p role="status" className="notice">{message}</p> : valid ? (
          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="new-password">New password</label>
              <input id="new-password" type="password" minLength={10} required value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" />
            </div>
            <button className="btn" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
            {message && <p role="status" className="notice">{message}</p>}
          </form>
        ) : <p role="status" className="notice">{message}</p>}
        {!valid && ready && !success && <Link className="inline-link" href="/forgot-password">Request another recovery link</Link>}
        {success && <Link className="inline-link" href="/login">Go to sign in</Link>}
      </div>
    </section>
  );
}