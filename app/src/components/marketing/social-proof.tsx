"use client";

import { motion } from "framer-motion";
import { Shield, Scale, Users, Award } from "lucide-react";

const stats = [
  { icon: Scale, label: "Tennessee Statutes", value: "6,325+", sublabel: "Legal provisions indexed" },
  { icon: Users, label: "Target Users", value: "100+", sublabel: "Juvenile Court Judges" },
  { icon: Shield, label: "Security", value: "FERPA", sublabel: "Compliant by design" },
  { icon: Award, label: "Built By", value: "Judges", sublabel: "For the bench" },
];

export function SocialProof() {
  return (
    <section id="social-proof" className="relative py-20 border-y border-white/5">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/[0.03] to-transparent" />
      <div className="relative max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm uppercase tracking-[0.2em] text-slate-500 mb-12"
        >
          Trusted by judges across Tennessee
        </motion.p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-center group"
            >
              <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 group-hover:bg-amber-500/5 transition-all duration-300">
                <stat.icon className="w-5 h-5 text-slate-400 group-hover:text-amber-400 transition-colors" />
              </div>
              <p className="text-3xl font-bold bg-gradient-to-b from-white to-slate-300 bg-clip-text text-transparent">
                {stat.value}
              </p>
              <p className="text-sm text-slate-400 mt-1">{stat.sublabel}</p>
            </motion.div>
          ))}
        </div>

        {/* Placeholder for judicial association logos */}
        <div className="mt-16 flex justify-center items-center gap-12 opacity-30">
          <div className="h-8 w-32 rounded bg-slate-700/50" />
          <div className="h-8 w-28 rounded bg-slate-700/50" />
          <div className="h-8 w-36 rounded bg-slate-700/50" />
          <div className="hidden sm:block h-8 w-28 rounded bg-slate-700/50" />
        </div>
      </div>
    </section>
  );
}
