import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc-provider";

export const metadata: Metadata = {
  title: "DustBunny AI - Smart Email Cleanup",
  description: "AI-powered email cleanup and privacy management tool",
  icons: {
    icon: "/brand/logo.png",
    shortcut: "/brand/logo.png",
    apple: "/brand/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/brand/logo.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&family=Sora:wght@100..800&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans bg-offwhite text-charcoal">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
