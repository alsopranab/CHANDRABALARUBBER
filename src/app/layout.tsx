import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CookieConsent } from "@/components/cookie-consent";
import { SiteControls } from "@/components/site-controls";
export const metadata: Metadata = { title: "Chandrabala Rubber Industries | Natural Rubber Trading", description: "B2B natural rubber sourcing, trading and supply across India.", icons: { icon: "/favicon.svg", shortcut: "/favicon.svg" } };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><SiteControls><Header/><main>{children}</main><Footer/><CookieConsent/></SiteControls></body></html>; }
