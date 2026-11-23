"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function ResetPassword(){
  const [password,setPassword]=useState("");
  const [message,setMessage]=useState("");
  const [ready,setReady]=useState(false);
  const [valid,setValid]=useState(false);
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    let mounted=true;
    async function checkRecovery(){
      const supabase=createClient();
      if(!supabase){if(mounted){setMessage("Password recovery is not configured.");setReady(true);}return;}
      // Supabase browser client processes the recovery token from the URL hash.
      const {data:{session}}=await supabase.auth.getSession();
      if(mounted){setValid(!!session);setReady(true);if(!session)setMessage("This recovery link is invalid or expired. Please request a new password reset email.");}
      const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
        if(mounted){setValid(!!session);if(session)setMessage("");}
      });
      return ()=>subscription.unsubscribe();
    }
    const cleanupPromise=checkRecovery();
    return ()=>{mounted=false;};
  },[]);

  async function submit(e:React.FormEvent){
    e.preventDefault();const supabase=createClient();if(!supabase){setMessage("Connect Supabase first.");return}
    setBusy(true);setMessage("");
    const {error}=await supabase.auth.updateUser({password});
    setBusy(false);setMessage(error?error.message:"Password updated successfully. You can now sign in.");
    if(!error)setValid(false);
  }
  return <section className="section"><div className="form-shell"><span className="eyebrow">Account recovery</span><h1>Choose a new password.</h1>
  {!ready?<p>Verifying your recovery link…</p>:valid?<form onSubmit={submit}><div className="field"><label>New password</label><input type="password" minLength={10} required value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></div><button className="btn" disabled={busy}>{busy?"Updating…":"Update password"}</button></form>:<p className="notice">{message}</p>}
  {message&&valid&&<p role="status" className="notice">{message}</p>}
  {!valid&&ready&&<Link className="inline-link" href="/forgot-password">Request another recovery link</Link>}
  {message.includes("successfully")&&<Link className="inline-link" href="/login">Go to sign in</Link>}
  </div></section>
}