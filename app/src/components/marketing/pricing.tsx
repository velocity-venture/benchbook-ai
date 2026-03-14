"use client";

import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import Link from "next/link";

const tiers = [
  {
    name: "Solo Judge",
    price: "$199",
    period: "/month",
    description: "For individual judges who want instant access to Tennessee law on the bench.",
    features: [
      "Unlimited AI-powered legal research",
      "Full TCA Title 36 & 37 access",
      "Complete TRJPP rules",
      "All DCS policies & procedures",
      "Formatted bench cards",
      "Offline mode",
      "Email support",
    ],
    cta: "Start Free Trial",
    highlighted: false,
  },
  {
    name: "Court Package",
    price: "$499",
    period: "/month",
    description: "For courts with multiple judges and support staff. Shared research library.",
    features: [
      "Everything in Solo Judge",
      "Up to 10 user seats",
      "Shared bench card library",
      "County local rules integration",
      "Document compliance analysis",
      "Usage analytics dashboard",
      "Priority support",
      "Custom onboarding",
    ],
    cta: "Start Free Trial",
    highlighted: true,
    badge: "Most Popular",
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For judicial districts and state-wide deployments. Full customization and support.",
    features: [
      "Everything in Court Package",
      "Unlimited user seats",
      "Multi-jurisdiction support",
      "Custom integrations (CMS, e-filing)",
      "Dedicated success manager",
      "SLA guarantee",
      "On-site training",
      "Custom data ingestion",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0d1220] to-[#0a0e1a]" />

      <div className="relative max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Every plan includes a 14-day free trial. No credit card required to start.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 items-stretch">
          {tiers.map((tier, i) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className={`relative rounded-2xl overflow-hidden ${
                tier.highlighted
                  ? "border-2 border-amber-500/30"
                  : "border border-white/[0.06]"
              }`}
            >
              {/* Background */}
              <div
                className={`absolute inset-0 ${
                  tier.highlighted
                    ? "bg-gradient-to-b from-amber-500/[0.08] via-[#111827]/80 to-[#111827]/80"
                    : "bg-[#111827]/60"
                }`}
              />

              {tier.badge && (
                <div className="absolute top-0 left-0 right-0 py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-center text-[#0a0e1a] text-xs font-bold uppercase tracking-wider">
                  {tier.badge}
                </div>
              )}

              <div
                className={`relative p-8 flex flex-col h-full ${
                  tier.badge ? "pt-14" : ""
                }`}
              >
                <h3 className="text-xl font-bold mb-2">{tier.name}</h3>
                <p className="text-slate-400 text-sm mb-6 min-h-[40px]">
                  {tier.description}
                </p>

                <div className="mb-8">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-slate-400">{tier.period}</span>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-slate-300"
                    >
                      <Check className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link
                  href="/login"
                  className={`w-full py-3.5 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2 transition-all ${
                    tier.highlighted
                      ? "bg-gradient-to-r from-amber-500 to-amber-600 text-[#0a0e1a] hover:from-amber-400 hover:to-amber-500 shadow-lg shadow-amber-500/20"
                      : "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20"
                  }`}
                >
                  {tier.cta}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
