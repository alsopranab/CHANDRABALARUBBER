"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const params = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "seller" ? "seller" : "buyer");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gstin, setGstin] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase configuration is missing. Please contact the site administrator.");
      return;
    }
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: { data: { full_name: name.trim(), company_name: company.trim(), role, phone: phone.trim(), gstin: gstin.trim() } },
      });
      if (error) {
        setMessage(error.message);
      } else if (data.user) {
        setMessage(data.session
          ? "Registration received. Your account is pending administrator approval."
          : "Registration submitted. Check your email for a confirmation link, if required, then wait for administrator approval.");
      } else {
        setMessage("Registration returned no account. Please try again or contact the administrator.");
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Registration failed unexpectedly. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="section"><div className="form-shell"><span className="eyebrow">Join the network</span><h1>Request membership.</h1><p>Buyer and seller accounts are reviewed by Chandrabala administrators before portal access is enabled.</p><form onSubmit={submit}><div className="field"><label>Membership type</label><select value={role} onChange={e=>setRole(e.target.value)}><option value="buyer">Buyer</option><option value="seller">Seller / Supplier</option></select></div><div className="field"><label>Full name</label><input required value={name} onChange={e=>setName(e.target.value)}/></div><div className="field"><label>Company name</label><input required value={company} onChange={e=>setCompany(e.target.value)}/></div><div className="field"><label>Business email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></div><div className="field"><label>Phone / WhatsApp</label><input value={phone} onChange={e=>setPhone(e.target.value)}/></div><div className="field"><label>GSTIN (if applicable)</label><input value={gstin} onChange={e=>setGstin(e.target.value)}/></div><div className="field"><label>Create password</label><input type="password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></div><div className="notice">Submitting this form does not grant portal access until an administrator approves the membership.</div><button className="btn" disabled={busy} type="submit">{busy?"Submitting…":"Submit registration"}</button></form>{message&&<p role="status" className="notice">{message}</p>}<p>Already registered? <Link className="inline-link" href="/login">Sign in</Link></p></div></section>;
}

export default function Register() {
  return <Suspense fallback={<section className="section"><div className="form-shell">Loading registration…</div></section>}><RegisterForm /></Suspense>;
}
