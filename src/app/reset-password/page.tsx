"use client";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const params = useSearchParams();
  const [email, setEmail] = useState(params.get("email") || "");
  const [token, setToken] = useState("");
  const [password, setPassword] = useState("");
  const [verified, setVerified] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);

  async function verify(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) { setMessage("Password recovery is not configured."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.verifyOtp({ email: email.trim(), token: token.trim(), type: "recovery" });
    setBusy(false);
    if (error) setMessage(error.message);
    else { setVerified(true); setMessage("Email verified. Choose your new password."); }
  }

  async function updatePassword(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const supabase = createClient();
    if (!supabase) { setMessage("Password recovery is not configured."); return; }
    setBusy(true); setMessage("");
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setMessage(error.message);
    else { setSuccess(true); setMessage("Password updated successfully. You can now sign in."); }
  }

  return (
    <section className="section"><div className="form-shell">
      <span className="eyebrow">Account recovery</span><h1>{success ? "Password updated." : verified ? "Choose a new password." : "Verify your email."}</h1>
      {success ? <><p role="status" className="notice">{message}</p><Link className="inline-link" href="/login">Go to sign in</Link></> : verified ? (
        <form onSubmit={updatePassword}>
          <div className="field"><label htmlFor="new-password">New password</label><input id="new-password" type="password" minLength={10} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)} /></div>
          <button className="btn" disabled={busy}>{busy ? "Updating…" : "Update password"}</button>
          {message && <p role="status" className="notice">{message}</p>}
        </form>
      ) : (
        <form onSubmit={verify}>
          <p>Enter the six-digit recovery code sent to your email address.</p>
          <div className="field"><label htmlFor="recovery-email">Email address</label><input id="recovery-email" type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} /></div>
          <div className="field"><label htmlFor="recovery-code">Six-digit verification code</label><input id="recovery-code" type="text" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoComplete="one-time-code" value={token} onChange={e=>setToken(e.target.value.replace(/\\D/g,"").slice(0,6))} /></div>
          <button className="btn" disabled={busy}>{busy ? "Verifying…" : "Verify code"}</button>
          {message && <p role="status" className="notice">{message}</p>}
        </form>
      )}
      {!success && <Link className="inline-link" href="/forgot-password">Request another code</Link>}
    </div></section>
  );
}

export default function ResetPassword() {
  return <Suspense fallback={<section className="section"><div className="form-shell"><p>Loading password recovery…</p></div></section>}><ResetPasswordForm /></Suspense>;
}