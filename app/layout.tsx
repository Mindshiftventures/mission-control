import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navigation } from "@/components/Navigation";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Mission Control - Agent Dashboard",
  description: "Real-time agent status and cost tracking dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <Navigation />
        {/* Responsive content wrapper - properly accounts for sidebar */}
        <div style={{
          marginLeft: '0',
          width: '100%',
          minHeight: '100vh',
          overflowX: 'hidden',
        }}
        className="lg:ml-16">
          <div style={{
            maxWidth: '100%',
            width: '100%',
            margin: '0 auto',
          }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
