import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Paprly",
  description: "Research made easy!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full bg-gray-50" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} 
                    min-h-dvh bg-gray-50 text-gray-900 antialiased overscroll-none`}
      >
        <Navbar />
        <main id="scroll-root" className="mx-auto max-w-7xl px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
