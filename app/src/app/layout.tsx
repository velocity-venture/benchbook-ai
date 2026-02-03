import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BenchBook AI | Legal Intelligence for Juvenile Court",
  description:
    "AI-powered legal research, case management, and document generation for Tennessee Juvenile Court Judges.",
  keywords: [
    "legal tech",
    "juvenile court",
    "Tennessee law",
    "AI legal research",
    "court management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-slate-950 text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
