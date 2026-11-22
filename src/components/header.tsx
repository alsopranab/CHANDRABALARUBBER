"use client";
import Link from "next/link";
import { useState } from "react";
import { Menu, X, ArrowUpRight } from "lucide-react";
const links=[["/about","About"],["/products","Products"],["/process","Our process"],["/buyers","Buyers"],["/sellers","Sellers"],["/careers","Careers"],["/contact","Contact"]];
export function Header(){const [open,setOpen]=useState(false);return <header className="site-header"><div className="container nav-wrap"><Link href="/" className="brand" onClick={()=>setOpen(false)}><span className="brand-mark">C</span><span><b>CHANDRABALA</b><small>RUBBER INDUSTRIES</small></span></Link><nav className={open?"nav-links is-open":"nav-links"}>{links.map(([href,label])=><Link key={href} href={href} onClick={()=>setOpen(false)}>{label}</Link>)}<Link className="nav-login" href="/login" onClick={()=>setOpen(false)}>Member login <ArrowUpRight size={15}/></Link></nav><button className="menu-toggle" aria-label="Toggle navigation" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button></div></header>}
