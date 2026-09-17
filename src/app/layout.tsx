import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AssessmentProvider } from "@/context/AssessmentContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SCHEMORA AI — Intelligence Platform",
  description: "AI-driven scheme matching for marginalized entrepreneurs. Rule-based eligibility, explainable matching, and source-aware guidance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AssessmentProvider>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </AssessmentProvider>
      </body>
    </html>
  );
}
