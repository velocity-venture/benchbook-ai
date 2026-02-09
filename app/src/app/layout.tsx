import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BenchBook AI | Legal Compliance Research for Juvenile Court",
  description:
    "AI-powered legal compliance research for Tennessee Juvenile Court Judges. Ask questions, get cited answers from TCA, TRJPP, and DCS policies.",
  keywords: [
    "legal tech",
    "juvenile court",
    "Tennessee law",
    "AI legal research",
    "compliance research",
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
