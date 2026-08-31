"use client";
import Link from "next/link";
import { ArrowRight, Server, Globe, ShieldCheck, ChevronRight, Rocket, Gauge, RefreshCw, Headset, CheckCircle2, TrendingUp, DollarSign, BarChart3, Clock, Lock, Zap, Layers } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.12 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 25 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const features = [
    { icon: Globe, title: "Domain Management", desc: "Register, track, and manage all your domains. Get automatic expiry warnings and registrar details in one elegant view.", color: "text-teal-400", bg: "bg-teal-500/10", border: "hover:border-teal-500/30", glow: "hover:shadow-[0_10px_40px_-10px_rgba(13,148,136,0.25)]" },
    { icon: Server, title: "Hosting Plans", desc: "Attach Starter, Business, or Enterprise hosting plans to any domain instantly with zero configuration hassle.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", glow: "hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)]" },
    { icon: ShieldCheck, title: "Role Based Access", desc: "Enterprise-grade RBAC. Users get a personalized dashboard while admins monitor platform activity globally.", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", glow: "hover:shadow-[0_10px_40px_-10px_rgba(16,185,129,0.25)]" },
    { icon: Gauge, title: "Real-time Metrics", desc: "Live dashboards with platform-wide growth charts, subscription counts, and performance analytics at a glance.", color: "text-amber-400", bg: "bg-amber-500/10", border: "hover:border-amber-500/30", glow: "hover:shadow-[0_10px_40px_-10px_rgba(245,158,11,0.25)]" },
    { icon: RefreshCw, title: "Auto Billing Cycles", desc: "Subscriptions automatically track billing dates each month — no manual renewal tracking required.", color: "text-cyan-400", bg: "bg-cyan-500/10", border: "hover:border-cyan-500/30", glow: "hover:shadow-[0_10px_40px_-10px_rgba(6,182,212,0.25)]" },
    { icon: Headset, title: "Priority Support", desc: "Direct contact support for every domain and hosting issue. Our team responds within 24 hours.", color: "text-rose-400", bg: "bg-rose-500/10", border: "hover:border-rose-500/30", glow: "hover:shadow-[0_10px_40px_-10px_rgba(244,63,94,0.25)]" }
  ];

  const steps = [
    { num: "01", icon: Rocket, title: "Create Account", desc: "Sign up in seconds and get instant access to your personal dashboard." },
    { num: "02", icon: Globe, title: "Add Your Domains", desc: "Log domain names, registrars, and expiry dates to centralize everything." },
    { num: "03", icon: Server, title: "Pick Hosting Plan", desc: "Subscribe Starter, Business, or Enterprise to any existing domain." },
    { num: "04", icon: TrendingUp, title: "Monitor & Scale", desc: "Track renewals and growth with real-time metrics and admin insights." }
  ];

  const stats = [
    { value: "+500", label: "Domains Managed", icon: Globe },
    { value: "99.9%", label: "Uptime Guarantee", icon: Zap },
    { value: "+1200", label: "Active Subscriptions", icon: Layers },
    { value: "24/7", label: "Support Available", icon: Headset }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-teal-500/30 relative overflow-hidden">
      {/* Background glowing orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none animate-blob"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full mix-blend-screen filter blur-[120px] pointer-events-none animate-blob animation-delay-4000"></div>
      <div className="absolute top-[40%] left-[50%] w-[30%] h-[30%] bg-teal-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none animate-blob animation-delay-2000"></div>

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-0 w-full z-50 border-b border-white/5 bg-slate-950/50 backdrop-blur-xl"
      >
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(13,148,136,0.5)] group-hover:scale-110 transition-transform">
              D
            </div>
            <span className="text-2xl font-bold tracking-tight">DHMS V2</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#how" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">How it Works</a>
            <a href="#pricing" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Pricing</a>
            <a href="/contact" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Contact</a>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-6 py-2.5 text-sm font-bold rounded-xl bg-white text-black hover:bg-slate-200 transition-all active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
              Get Started
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <main className="pt-40 pb-20 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200, damping: 20 }}
            className="text-center max-w-4xl mx-auto mt-10 mb-16 flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-teal-500/10 text-teal-400 text-sm font-bold mb-8 border border-teal-500/20 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-[pulse_2s_ease-in-out_infinite]"></span>
              DHMS V2 Platform is Live
            </div>
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-br from-white via-slate-200 to-slate-500 bg-clip-text text-transparent leading-[1.1]">
              Manage Domains & Hosting with Elegance.
            </h1>
            <p className="text-lg sm:text-2xl text-slate-400 mb-12 max-w-2xl font-medium">
              A scalable, production-grade platform to register domains, link hosting subscriptions, and access real-time metrics in one centralized dashboard.
            </p>
            <div className="flex flex-col sm:flex-row gap-5 w-full sm:w-auto justify-center">
              <Link
                href="/register"
                className="group px-8 py-4 rounded-2xl bg-teal-600 text-white font-bold text-lg hover:bg-teal-500 transition-all flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(13,148,136,0.3)] hover:shadow-[0_0_40px_rgba(13,148,136,0.5)] active:scale-95"
              >
                Start for Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="#features"
                className="group px-8 py-4 rounded-2xl bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 text-white font-bold text-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 hover:border-slate-600 active:scale-95"
              >
                Explore Features
                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </motion.div>

          {/* Stats Band */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32"
          >
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div key={stat.label} variants={itemVariants} className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 hover:border-teal-500/30 transition-all text-center">
                  <Icon className="w-8 h-8 text-teal-400 mx-auto mb-3" />
                  <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-slate-400 font-medium">{stat.label}</div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Features */}
          <section id="features" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Powerful Tools, One Platform</h2>
              <p className="text-slate-400 text-lg">Everything you need to run your domains and hosting from a single, beautiful dashboard.</p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <motion.div key={f.title} variants={itemVariants} className={`p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 ${f.border} transition-all duration-300 group hover:-translate-y-2 ${f.glow}`}>
                    <div className={`w-14 h-14 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 border border-slate-700/30`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-white">{f.title}</h3>
                    <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* How it Works */}
          <section id="how" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Get Started in Minutes</h2>
              <p className="text-slate-400 text-lg">Four simple steps from signup to full control of your online presence.</p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <motion.div key={s.num} variants={itemVariants} className="relative p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 hover:border-emerald-500/30 transition-all group hover:-translate-y-2">
                    <span className="text-6xl font-black text-slate-800 absolute top-4 right-6 group-hover:text-slate-700 transition-colors">{s.num}</span>
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-6">
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">{s.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{s.desc}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </section>

          {/* Pricing Preview */}
          <section id="pricing" className="mb-32">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-16"
            >
              <h2 className="text-4xl md:text-5xl font-black text-white mb-4">Simple, Transparent Pricing</h2>
              <p className="text-slate-400 text-lg">Scalable hosting plans that grow with your traffic.</p>
            </motion.div>

            <motion.div variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { name: "Starter", price: "$5", tag: "For personal sites", features: ["10 GB SSD Storage", "100 GB Bandwidth", "1 Domain", "Free SSL"], popular: false },
                { name: "Business", price: "$15", tag: "For growing businesses", features: ["50 GB SSD Storage", "500 GB Bandwidth", "5 Domains", "Free SSL", "Priority Support"], popular: true },
                { name: "Enterprise", price: "$45", tag: "For large-scale platforms", features: ["200 GB SSD Storage", "2000 GB Bandwidth", "Unlimited Domains", "Free SSL", "Dedicated Manager"], popular: false }
              ].map((p) => (
                <motion.div key={p.name} variants={itemVariants} className={`relative p-8 rounded-3xl border backdrop-blur-xl transition-all hover:-translate-y-2 ${p.popular ? "bg-teal-600/10 border-teal-500/40" : "bg-slate-900/40 border-slate-800/50 hover:border-slate-700"}`}>
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-teal-600 text-white text-xs font-bold rounded-full">Most Popular</span>
                  )}
                  <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                  <p className="text-sm text-slate-400 mb-6">{p.tag}</p>
                  <div className="mb-6">
                    <span className="text-5xl font-black text-white">{p.price}</span>
                    <span className="text-slate-500 font-medium ml-1">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-3 text-slate-300 text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Link href="/register" className={`w-full block text-center py-3 rounded-xl font-bold transition-all active:scale-95 ${p.popular ? "bg-teal-600 hover:bg-teal-500 text-white" : "bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white"}`}>
                    Get Started
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* Trust / Metrics Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-br from-teal-600/20 via-emerald-600/10 to-slate-900/40 border border-teal-500/20 backdrop-blur-xl p-10 md:p-16 mb-32 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-600/30 text-teal-300 flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="w-8 h-8" />
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white mb-4">Your Entire Online Presence, Under One Roof</h2>
            <p className="text-slate-300 text-lg max-w-3xl mx-auto mb-8">
              From domain expiry reminders to hosting billing and admin-level analytics, DHMS keeps every detail organized so you can focus on building.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { icon: Clock, label: "Expiry Alerts" },
                { icon: DollarSign, label: "Billing Tracking" },
                { icon: Lock, label: "Secure Auth" },
                { icon: TrendingUp, label: "Growth Charts" }
              ].map((m) => {
                const Icon = m.icon;
                return (
                  <div key={m.label} className="flex flex-col items-center gap-2">
                    <Icon className="w-6 h-6 text-teal-400" />
                    <span className="text-sm text-slate-300 font-medium">{m.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Final CTA */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-24"
          >
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to Take Control?</h2>
            <p className="text-slate-400 text-xl mb-10">Join DHMS today and manage your domains & hosting like a pro.</p>
            <Link href="/register" className="group px-10 py-5 rounded-2xl bg-white text-black font-bold text-xl hover:bg-slate-200 transition-all flex items-center justify-center gap-2 mx-auto max-w-xs shadow-[0_0_40px_rgba(255,255,255,0.2)] active:scale-95">
              Create Free Account
              <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-16 relative z-10 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-xl">D</div>
              <span className="text-xl font-bold tracking-tight">DHMS V2</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Your one-stop platform to register domains, link hosting plans, and monitor everything from a single dashboard.
            </p>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Platform</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link href="/dashboard/hosting" className="hover:text-white transition-colors">Hosting Plans</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Account</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/register" className="hover:text-white transition-colors">Create Account</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4">Support</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/50 text-center text-slate-500">
          <p className="font-medium">© 2026 DHMS V2. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
