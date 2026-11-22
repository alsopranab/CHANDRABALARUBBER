"use client";
import { useState } from "react";
import { Moon, Newspaper, X } from "lucide-react";
import Link from "next/link";
export function SiteControls({children}:{children:React.ReactNode}) {
 const [mono,setMono]=useState(false); const [news,setNews]=useState(false);
 return <><div className={mono?"site-frame site-monochrome":"site-frame"}>{children}</div><div className="site-utility-rail"><button onClick={()=>setMono(v=>!v)} aria-label={mono?"Restore colour":"Toggle monochrome"} title={mono?"Restore colour":"Black & white"}><Moon size={19}/></button><button onClick={()=>setNews(v=>!v)} aria-label="News and insiders" title="News & insiders"><Newspaper size={19}/></button></div>{news&&<aside className="insider-panel"><button className="insider-close" onClick={()=>setNews(false)} aria-label="Close"><X size={18}/></button><span className="eyebrow">News · insiders</span><h3>From the rubber trade.</h3><p>Company updates, sourcing notes and perspectives on natural rubber.</p><Link href="/news" className="btn" onClick={()=>setNews(false)}>News &amp; insights ↗</Link></aside>}</>}
