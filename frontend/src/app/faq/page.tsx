"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, HelpCircle, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    q: "What is DHMS?",
    a: "DHMS (Domain & Hosting Management System) is a centralized platform for registering domains, linking hosting subscriptions, and monitoring expiry dates and usage from one dashboard.",
  },
  {
    q: "How do I add a domain?",
    a: "Sign in to your account, go to the Dashboard, fill in the domain name, registrar, and expiry date, then click 'Add Domain'. It will appear instantly in your list.",
  },
  {
    q: "How do I subscribe to a hosting plan?",
    a: "Navigate to the Hosting Plans page, choose a plan, and click 'Subscribe Now'. Select an existing domain and confirm to attach the subscription.",
  },
  {
    q: "Is there an admin role?",
    a: "Yes. Administrators get access to a global Admin Panel with platform-wide metrics, user counts, and subscription totals across the entire system.",
  },
  {
    q: "How are billing dates calculated?",
    a: "When you subscribe, the next billing date is automatically set to one month from the subscription date.",
  },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-50">
      <div className="p-8">
        <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl w-full space-y-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 mb-6">
              <HelpCircle className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-slate-400">Everything you need to know about managing domains and hosting.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl overflow-hidden">
                <button
                  onClick={() => setOpen(open === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-bold text-white">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${open === i ? "rotate-180" : ""}`} />
                </button>
                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="px-5 pb-5 text-slate-400">{faq.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="border-t border-slate-800/50 py-8 text-center text-slate-500">
        <p className="font-medium">© 2026 DHMS V2. All rights reserved.</p>
      </footer>
    </div>
  );
}
