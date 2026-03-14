"use client";

import Link from "next/link";

const footerLinks = {
  Product: [
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Demo", href: "#demo" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Contact", href: "mailto:contact@benchbook.ai" },
    { label: "Support", href: "mailto:support@benchbook.ai" },
  ],
  Legal: [
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
    { label: "Security", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="relative border-t border-white/5">
      <div className="absolute inset-0 bg-[#060a14]" />

      <div className="relative max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center font-bold text-[#0a0e1a] text-sm">
                B
              </div>
              <span className="font-semibold tracking-tight">
                BenchBook<span className="text-amber-400">.AI</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered judicial research for the modern bench.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
                {category}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-slate-600">
            &copy; {new Date().getFullYear()} Velocity Venture Holdings, LLC. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">
            Made in Tennessee
          </p>
        </div>
      </div>
    </footer>
  );
}
