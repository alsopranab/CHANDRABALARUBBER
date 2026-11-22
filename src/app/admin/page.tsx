import { requireRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function Admin() {
  await requireRole(["admin"]);
  const supabase = await createClient();
  const { data: members, error } = await supabase!
    .from("profiles")
    .select("id,full_name,company_name,role,status,email,phone,gstin,created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const pending = members?.filter((m) => m.status === "pending" || m.status === "under_review") ?? [];
  const others = members?.filter((m) => m.status !== "pending" && m.status !== "under_review") ?? [];

  function MemberRow({ m }: { m: NonNullable<typeof members>[number] }) {
    return <div key={m.id} style={{ padding: "18px 0", borderTop: "1px solid #e5e7df", display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <div style={{ minWidth: 240 }}>
        <b>{m.full_name || "Name not supplied"}</b>
        <div>{m.company_name || "Company not supplied"}</div>
        <div className="muted">{m.email || "No email"} · {m.role} · <strong>{m.status.replaceAll("_", " ")}</strong></div>
        {m.phone && <div className="muted">Phone: {m.phone}</div>}
        {m.gstin && <div className="muted">GSTIN: {m.gstin}</div>}
        <small className="muted">Registered: {new Date(m.created_at).toLocaleString("en-IN")} · ID: {m.id}</small>
      </div>
      {m.role !== "admin" && (m.status === "pending" || m.status === "under_review") && <form action="/admin/member-action" method="post" style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <input type="hidden" name="memberId" value={m.id} />
        <button className="btn" name="decision" value="approve">Approve</button>
        <button className="btn btn-outline-dark" name="decision" value="reject">Reject</button>
      </form>}
    </div>;
  }

  return <section className="portal-wrap"><div className="container"><div className="portal-card" style={{ maxWidth: "100%" }}>
    <span className="eyebrow">Administrator console</span><h1>Member approval</h1>
    <p className="muted">Review buyer and seller registrations. Only approved members can access the business portal. Passwords are managed by Supabase Auth and are never visible to administrators.</p>
    {error && <p className="notice">Could not load members: {error.message}</p>}
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "20px 0" }}>
      <div className="notice"><strong>{pending.length}</strong> awaiting review</div>
      <div className="notice"><strong>{members?.filter(m => m.status === "approved").length ?? 0}</strong> approved</div>
      <div className="notice"><strong>{members?.filter(m => m.status === "rejected").length ?? 0}</strong> rejected</div>
    </div>
    <h2 style={{ font: "26px Georgia,serif" }}>Awaiting review</h2>
    {pending.length === 0 ? <p className="muted">No members are awaiting approval.</p> : pending.map(m => <MemberRow key={m.id} m={m} />)}
    <h2 style={{ font: "26px Georgia,serif", marginTop: 32 }}>Previously reviewed / other accounts</h2>
    {others.length === 0 ? <p className="muted">No other accounts yet.</p> : others.map(m => <MemberRow key={m.id} m={m} />)}
    <p className="notice">Member approval actions are recorded in the database audit log.</p>
  </div></div></section>;
}
