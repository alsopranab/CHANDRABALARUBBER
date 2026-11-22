"use client";
import { useState } from "react";
import { Moon } from "lucide-react";
import Link from "next/link";
export function SiteControls({children}:{children:React.ReactNode}) {
 const [mono,setMono]=useState(false);
 return <><div className={mono?"site-frame site-monochrome":"site-frame"}>{children}</div><div className={mono?"site-utility-rail site-utility-rail-mono":"site-utility-rail"}><button onClick={()=>setMono(v=>!v)} aria-label={mono?"Restore colour":"Toggle monochrome"} title={mono?"Restore colour":"Black & white"}><Moon size={19}/></button><Link href="/news" aria-label="News and insights" title="News & insights" className="site-utility-link">↗</Link></div></>;
}