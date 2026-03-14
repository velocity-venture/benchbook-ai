import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "BenchBook.AI | AI-Powered Judicial Research Platform",
  description:
    "Instant access to Tennessee statutes, court rules, and DCS policies — formatted, cited, and ready for the bench. Built by a sitting judge, for judges.",
  keywords: [
    "legal tech",
    "judicial research",
    "juvenile court",
    "Tennessee law",
    "AI legal research",
    "bench cards",
    "TCA",
    "TRJPP",
    "BenchBook",
  ],
  openGraph: {
    title: "BenchBook.AI | AI-Powered Judicial Research Platform",
    description:
      "Instant access to Tennessee statutes, court rules, and DCS policies — formatted, cited, and ready for the bench.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} font-sans bg-[#0a0e1a] text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
