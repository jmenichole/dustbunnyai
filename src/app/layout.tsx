import type { Metadata } from "next";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc-provider";

// Use system fonts instead of Google Fonts to avoid network dependencies
// const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
// const sora = Sora({ subsets: ["latin"], variable: "--font-sora" });

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
      </head>
      <body className="font-sans bg-offwhite text-charcoal">
        <TRPCProvider>{children}</TRPCProvider>
      </body>
    </html>
  );
}
