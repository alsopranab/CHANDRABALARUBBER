"use client";
import { useState } from "react";
import { Contrast, Newspaper } from "lucide-react";
import Link from "next/link";
export function SiteControls({children}:{children:React.ReactNode}) {
 const [mono,setMono]=useState(false);
 return <><div className={mono?"site-frame site-monochrome":"site-frame"}>{children}</div><nav aria-label="Website utilities" className={mono?"site-utility-rail site-utility-rail-mono":"site-utility-rail"}><button onClick={()=>setMono(v=>!v)} aria-label={mono?"Restore colour":"Toggle black and white"} title={mono?"Restore colour":"Black & white"}><Contrast size={20}/><span className="utility-tooltip">{mono?"Restore colour":"Black & white"}</span></button><Link href="/news" aria-label="News and insights" title="News & insights" className="site-utility-link"><Newspaper size={20}/><span className="utility-tooltip">News & insights</span></Link></nav></>;
}