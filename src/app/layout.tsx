import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";\nimport { CookieConsent } from "@/components/cookie-consent";
export const metadata: Metadata = { title: "Chandrabala Rubber Industries | Natural Rubber Trading", description: "B2B natural rubber sourcing, trading and supply across India." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Header/><main>{children}</main><Footer/><CookieConsent/></body></html>; }
