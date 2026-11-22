"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function RegisterForm() {
  const params = useSearchParams();
  const [role, setRole] = useState(params.get("role") === "seller" ? "seller" : "buyer");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("Preparing registration…");
    const form = e.currentTarget;
    const values = new FormData(form);
    const name = String(values.get("name") || "").trim();
    const company = String(values.get("company") || "").trim();
    const email = String(values.get("email") || "").trim();
    const phone = String(values.get("phone") || "").trim();
    const gstin = String(values.get("gstin") || "").trim();
    const password = String(values.get("password") || "");
    const supabase = createClient();
    if (!supabase) {
      setMessage("Supabase configuration is missing. Please contact the site administrator.");
      return;
    }
    setBusy(true);
    setMessage("Submitting registration…");
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name, company_name: company, role, phone, gstin } },
      });
      if (error) setMessage("Registration failed: " + error.message);
      else if (data.user) setMessage(data.session
        ? "Registration received. Your account is pending administrator approval."
        : "Registration submitted. Check your email for a confirmation link, if required, then wait for administrator approval.");
      else setMessage("Registration returned no account. Please try again or contact the administrator.");
    } catch (err) {
      setMessage("Registration failed: " + (err instanceof Error ? err.message : "Unexpected error. Please try again."));
    } finally {
      setBusy(false);
    }
  }

  return <section className="section"><div className="form-shell"><span className="eyebrow">Join the network</span><h1>{role === "seller" ? "Let’s discuss your rubber supply." : "Let’s discuss your rubber requirements."}</h1><p>{role === "seller" ? "Tell us about your available stock and business. We’ll review your membership request to explore a supply partnership." : "Tell us what your business needs. We’ll review your membership request and help you get started."}</p><form onSubmit={submit}><div className="field"><label htmlFor="membership-role">Membership type</label><select id="membership-role" value={role} onChange={e=>setRole(e.target.value)}><option value="buyer">Buyer</option><option value="seller">Seller / Supplier</option></select></div><div className="field"><label htmlFor="reg-name">Full name</label><input id="reg-name" name="name" required autoComplete="name"/></div><div className="field"><label htmlFor="reg-company">Company name</label><input id="reg-company" name="company" required autoComplete="organization"/></div><div className="field"><label htmlFor="reg-email">Business email</label><input id="reg-email" name="email" required type="email" autoComplete="email"/></div><div className="field"><label htmlFor="reg-phone">Phone / WhatsApp</label><input id="reg-phone" name="phone" autoComplete="tel"/></div><div className="field"><label htmlFor="reg-gstin">GSTIN (if applicable)</label><input id="reg-gstin" name="gstin"/></div><div className="field"><label htmlFor="reg-password">Create password</label><input id="reg-password" name="password" type="password" minLength={10} required autoComplete="new-password"/></div><div className="registration-note">Membership requests are reviewed before portal access is granted.</div><button className="btn" disabled={busy} type="submit">{busy?"Submitting…":"Submit registration"}</button></form>{message&&<p role="status" aria-live="polite" className="notice">{message}</p>}<p>Already registered? <Link className="inline-link" href="/login">Sign in</Link></p></div></section>;
}

export default function Register() {
  return <Suspense fallback={<section className="section"><div className="form-shell">Loading registration…</div></section>}><RegisterForm /></Suspense>;
}
