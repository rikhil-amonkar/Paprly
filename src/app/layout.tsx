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
    <html lang="en" className="bg-white overscroll-none">
      <body className="min-h-screen bg-gray-100 antialiased">

        {/* Navbar */}
        <Navbar />

        {/* Main page content */}
        <main id="scroll-root" className="max-w-3xl mx-auto px-4">{children}</main>

      </body>
    </html>
  );
}
