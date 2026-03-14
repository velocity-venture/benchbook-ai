"use client";

import { motion } from "framer-motion";
import { Quote, Clock, Search, FileText } from "lucide-react";

const testimonials = [
  {
    quote:
      "I've spent 20 years on the bench. BenchBook.AI is the first tool that actually understands what juvenile court judges need — instant answers from the sources I trust.",
    author: "M.O. Eckel III",
    title: "Juvenile Court Judge",
    location: "Tipton County, TN",
  },
  {
    quote:
      "Before BenchBook.AI, I'd spend my lunch break flipping through statute books. Now I have every statute, rule, and DCS policy at my fingertips before the hearing starts.",
    author: "Placeholder",
    title: "Juvenile Court Judge",
    location: "Tennessee",
  },
  {
    quote:
      "The bench cards are game-changers. Walking into a TPR hearing with a formatted reference card that cites every relevant statute — that's the confidence this tool provides.",
    author: "Placeholder",
    title: "Juvenile Court Judge",
    location: "Tennessee",
  },
];

const dayInLife = [
  {
    icon: Clock,
    time: "8:15 AM",
    title: "Morning Docket Review",
    without: "45 minutes flipping through statute books and printed rules",
    with: "5 minutes — bench cards auto-generated for each hearing",
    saved: "40 min saved",
  },
  {
    icon: Search,
    time: "10:30 AM",
    title: "Mid-Hearing Statute Check",
    without: "Recess called, 15 minutes searching for the right TCA section",
    with: "30 seconds — type the issue, get the cited answer instantly",
    saved: "14 min saved",
  },
  {
    icon: FileText,
    time: "2:00 PM",
    title: "TPR Hearing Preparation",
    without: "2 hours cross-referencing grounds, best interest factors, and case law",
    with: "10 minutes — complete bench card with all 21 grounds and factors",
    saved: "110 min saved",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-32">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a] via-[#0d1220] to-[#0a0e1a]" />

      <div className="relative max-w-6xl mx-auto px-6">
        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Judges Trust BenchBook.AI
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Built by a sitting judge, refined by courtroom experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-32">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="relative group"
            >
              <div className="absolute -inset-px bg-gradient-to-b from-white/[0.08] to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#111827]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-8 h-full flex flex-col">
                <Quote className="w-8 h-8 text-amber-500/30 mb-4" />
                <blockquote className="text-slate-300 leading-relaxed flex-1 mb-6">
                  &ldquo;{testimonial.quote}&rdquo;
                </blockquote>
                <div className="border-t border-white/5 pt-4">
                  <p className="font-semibold text-sm">{testimonial.author}</p>
                  <p className="text-slate-500 text-sm">
                    {testimonial.title}, {testimonial.location}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Day in the Life */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h3 className="text-3xl font-bold tracking-tight mb-4">
            A Day on the Bench
          </h3>
          <p className="text-slate-400 max-w-lg mx-auto">
            See how BenchBook.AI transforms a typical day for a juvenile court
            judge — saving over 2.5 hours of research time.
          </p>
        </motion.div>

        <div className="space-y-6">
          {dayInLife.map((item, i) => (
            <motion.div
              key={item.time}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.5 }}
              className="bg-[#111827]/60 backdrop-blur-sm border border-white/[0.06] rounded-2xl p-6 md:p-8"
            >
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4 md:w-48 shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                    <item.icon className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">
                      {item.time}
                    </p>
                    <p className="font-semibold text-sm">{item.title}</p>
                  </div>
                </div>

                <div className="flex-1 grid sm:grid-cols-2 gap-4">
                  <div className="px-4 py-3 rounded-lg bg-red-500/5 border border-red-500/10">
                    <p className="text-xs text-red-400/70 uppercase tracking-wider mb-1">
                      Without BenchBook.AI
                    </p>
                    <p className="text-sm text-slate-400">{item.without}</p>
                  </div>
                  <div className="px-4 py-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                    <p className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">
                      With BenchBook.AI
                    </p>
                    <p className="text-sm text-slate-300">{item.with}</p>
                  </div>
                </div>

                <div className="md:w-24 shrink-0 text-right">
                  <span className="inline-block px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-semibold">
                    {item.saved}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Total saved */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-amber-500/10 border border-amber-500/20 rounded-full">
            <Clock className="w-5 h-5 text-amber-400" />
            <span className="text-amber-400 font-semibold">
              2+ hours saved every day
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
