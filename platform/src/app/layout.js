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

export const metadata = {
  title: "Unified Intelligent Blockchain Healthcare Platform",
  description: "A secure, blockchain-powered ecosystem unifying patients, doctors, hospitals, and emergency services.",
};

import QueryProvider from "@/components/providers/QueryProvider";

import { MedicalAccessibilityProvider } from "@/components/providers/MedicalAccessibilityProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <MedicalAccessibilityProvider>
            {children}
          </MedicalAccessibilityProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

