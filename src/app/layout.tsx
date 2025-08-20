import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Website Builder",
  description: "AI-powered website builder with Replit-like UI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        style={{
          background: "var(--background, #f3f4f6)",
          color: "var(--foreground, #171717)",
          minHeight: "100vh",
          fontFamily: "var(--font-geist-sans), Arial, sans-serif",
        }}
      >
        <div style={{ minHeight: "100vh", width: "100vw", display: "flex", flexDirection: "column" }}>{children}</div>
      </body>
    </html>
  );
}
