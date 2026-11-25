"use client";

import { modules } from "../config/modules";

export default function Dashboard() {
  const groups = ["Core", "Operations", "Commercial", "Finance", "Insights", "System"];
  const href = (id: string) => {
    const routes: Record<string, string> = {
      dashboard: "/", inventory: "/inventory", settings: "/settings", masters: "/masters",
      suppliers: "/suppliers", procurement: "/procurement", sorting: "/sorting",
    };
    return routes[id] ?? "#";
  };

  const kpis = [
    { label: "Physical Inventory", value: "Demo", foot: "Not connected to ledger", icon: "▦" },
    { label: "Available to Sell", value: "Demo", foot: "Physical less reservations", icon: "◉" },
    { label: "Procurement Today", value: "—", foot: "Pending module", icon: "⇩" },
    { label: "Sales Today", value: "—", foot: "Pending module", icon: "⇧" },
  ];

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">CHANDRABALA<small>RUBBER ERP · OPERATIONS</small></div>
        <nav>
          {groups.map((group) => (
            <div key={group}>
              <div className="navgroup">{group}</div>
              {modules.filter((module) => module.group === group && module.enabled).map((module) => (
                <a className={"navitem " + (module.id === "dashboard" ? "active" : "")} href={href(module.id)} key={module.id}>
                  <span className="symbol">{module.icon}</span>{module.label}
                </a>
              ))}
            </div>
          ))}
        </nav>
        <div className="navgroup">Quick access</div>
        <a className="navitem" href="/warehouses">▦ Warehouses</a>
        <a className="navitem" href="/login">⇥ Account access</a>
        <div className="sidebar-foot">Operational intelligence<br /><strong>Built around the rubber trade.</strong></div>
      </aside>
      <main className="main">
        <header className="top">
          <div><div className="eyebrow">Management overview / 01</div><h1 className="h1">Operations at a glance.</h1><div className="sub">A modular control room for inventory, procurement and performance.</div></div>
          <div className="topright"><span className="pill">Foundation · Demo data</span><div className="avatar">C</div></div>
        </header>
        <div className="grid4">
          {kpis.map((kpi) => (
            <div className="kpi" key={kpi.label}><span className="kpi-icon">{kpi.icon}</span><div className="kpi-label">{kpi.label}</div><div className="kpi-value">{kpi.value}</div><div className="kpi-foot">{kpi.foot}</div></div>
          ))}
        </div>
        <div className="sectiongrid">
          <section className="panel">
            <div className="panel-title">Inventory composition</div><div className="panel-sub">Composition visualization awaits ledger integration.</div>
            {["Natural Rubber", "Rubber Chemicals", "Industrial Supplies"].map((item, index) => (
              <div key={item}><div className="barrow"><span>{item}</span><span>Illustrative</span></div><div className="bar"><span style={{ width: [70, 22, 10][index] + "%" }} /></div></div>
            ))}
          </section>
          <section className="panel">
            <div className="panel-title">Operational pulse</div><div className="panel-sub">Illustrative · no transaction feed yet</div>
            <div className="chartbars">{[48, 66, 42, 78, 60, 92, 55].map((height, index) => <div key={index} className={"chartbar " + (index === 5 ? "current" : "")} style={{ height: height + "%" }} />)}</div>
            <div className="chartlabels"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div>
          </section>
        </div>
        <section className="panel" style={{ marginTop: 16 }}>
          <div className="panel-title">Inventory taxonomy</div><div className="panel-sub">Assortment Group → Family → Item → Lot</div>
          <table className="table"><thead><tr><th>Assortment Group</th><th>Families</th><th>Workspace</th></tr></thead>
            <tbody><tr><td><strong>Natural Rubber</strong></td><td>Rubber Sheets · Scrap</td><td><a href="/inventory">Explore inventory →</a></td></tr><tr><td>Rubber Chemicals</td><td>Configurable</td><td>Master data phase</td></tr><tr><td>Industrial Supplies</td><td>Configurable</td><td>Master data phase</td></tr></tbody>
          </table>
        </section>
        <div className="modulecards">
          {modules.filter((module) => module.enabled && module.id !== "dashboard").slice(0, 6).map((module) => (
            <a href={href(module.id)} className="modulecard" key={module.id}><h4>{module.icon} &nbsp;{module.label}</h4><p>{module.description}</p></a>
          ))}
        </div>
        <div className="footer-note">Prototype stage · Figures and visuals are illustrative until transaction workflows and Supabase are connected.</div>
      </main>
    </div>
  );
}
