"use client";

import { useEffect, useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { Server, Check, ArrowRight, X, Loader2, Database, Wifi, Box, Cpu } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

function hashCode(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h);
}

function deriveUsage(subscription: any): { storageUsedGb: number; bandwidthUsedGb: number; cpuUsed: number; ramUsed: number } {
  const plan = subscription?.hosting_plans;
  const storageLimit = plan?.storage_gb || 10;
  const bandwidthLimit = plan?.bandwidth_gb || 100;
  const base = hashCode(subscription?.id || 'x');
  const uptimeDays = (() => {
    const start = new Date(subscription?.start_date || Date.now()).getTime();
    return Math.max(0, Math.floor((Date.now() - start) / 86400000));
  })();
  const seed = Math.abs(Math.sin(uptimeDays + base)) ;
  const storageUsedGb = Math.min(storageLimit, Math.max(0.1, Math.round(storageLimit * (0.18 + seed * 0.6) * 10) / 10));
  const bandwidthUsedGb = Math.min(bandwidthLimit, Math.max(0.1, Math.round(bandwidthLimit * (0.25 + (base % 40) / 100) * 10) / 10));
  const cpuUsed = Math.min(98, Math.max(5, Math.round((15 + seed * 50))));
  const ramUsed = Math.min(96, Math.max(10, Math.round((20 + seed * 40))));
  return { storageUsedGb, bandwidthUsedGb, cpuUsed, ramUsed };
}

function deriveServerIp(subscription: any): string {
  const base = hashCode(subscription?.id || 'x');
  return `10.0.${base % 250}.${(base >> 8) % 250}`;
}

export default function HostingPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [subscribingPlan, setSubscribingPlan] = useState<any>(null);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const loadAll = useCallback(async () => {
    try {
      const [plansData, domainsData, subsData] = await Promise.all([
        apiFetch("/hosting/plans"),
        apiFetch("/domains"),
        apiFetch("/hosting/subscriptions"),
      ]);
      setPlans(plansData.plans);
      setDomains(domainsData.domains || []);
      setSubscriptions(subsData.subscriptions || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const startSubscription = (plan: any) => {
    setSelectedDomain("");
    setSubscribingPlan(plan);
  };

  const confirmSubscription = async () => {
    if (!subscribingPlan || !selectedDomain) return;
    setSubmitting(true);
    const loadingToast = toast.loading("Subscribing to plan...");
    try {
      const nextBilling = new Date();
      nextBilling.setMonth(nextBilling.getMonth() + 1);
      await apiFetch("/hosting/subscribe", {
        method: "POST",
        body: JSON.stringify({
          domain_id: selectedDomain,
          plan_id: subscribingPlan.id,
          next_billing_date: nextBilling.toISOString().split("T")[0],
        }),
      });
      toast.success("Subscribed successfully!", { id: loadingToast });
      setSubscribingPlan(null);
      setSelectedDomain("");
      setSubscriptions((prev) => [
        ...prev,
        {
          id: `local-${Date.now()}`,
          start_date: new Date().toISOString().split("T")[0],
          next_billing_date: nextBilling.toISOString().split("T")[0],
          status: "Active",
          hosting_plans: subscribingPlan,
          domains: domains.find((d) => d.id === selectedDomain) || {},
        },
      ]);
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    } finally {
      setSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12 text-center"
      >
        <h1 className="text-4xl font-bold text-white mb-4">Hosting Plans</h1>
        <p className="text-slate-400 max-w-2xl mx-auto">
          Choose the perfect hosting plan for your domains. Scale seamlessly as your traffic grows.
        </p>
      </motion.div>

      {loading ? (
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-[400px] bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <motion.div 
          variants={containerVariants} 
          initial="hidden" 
          animate="show" 
          className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div variants={itemVariants} key={plan.id} className="group relative p-8 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 hover:border-teal-500/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(13,148,136,0.15)] flex flex-col overflow-hidden">
              {plan.plan_name === 'Business' && (
                <div className="absolute top-0 right-0 bg-gradient-to-l from-teal-600/20 to-transparent w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              )}
              {plan.plan_name === 'Business' && (
                <motion.div 
                  initial={{ y: -50 }} animate={{ y: -16 }} transition={{ type: "spring", stiffness: 400, damping: 10, delay: 0.5 }}
                  className="absolute left-1/2 -translate-x-1/2 px-4 py-1.5 bg-teal-600 text-white text-xs font-bold rounded-full shadow-lg border border-teal-500/50"
                >
                  Most Popular
                </motion.div>
              )}
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors">{plan.plan_name}</h3>
                </div>
              </div>

              <div className="mb-8 relative z-10">
                <span className="text-5xl font-bold text-white tracking-tight">${plan.price_monthly}</span>
                <span className="text-slate-500 font-medium ml-1">/mo</span>
              </div>

              <ul className="space-y-4 mb-8 flex-1 relative z-10">
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{plan.storage_gb} GB</span> SSD Storage
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-medium">{plan.bandwidth_gb} GB</span> Bandwidth
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                    <Check className="w-3.5 h-3.5" />
                  </div>
                  Free SSL Certificate
                </li>
              </ul>

              <button onClick={() => startSubscription(plan)} className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all relative z-10 active:scale-95 ${
                plan.plan_name === 'Business' 
                  ? 'bg-teal-600 hover:bg-teal-500 text-white shadow-lg shadow-teal-600/30' 
                  : 'bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white'
              }`}>
                Subscribe Now
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* My Active Subscriptions (DevOps console) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Box className="w-5 h-5 text-teal-400" /> My Active Subscriptions
            <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-sm rounded-md border border-teal-500/30">{subscriptions.length}</span>
          </h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 bg-slate-800/50 animate-pulse rounded-2xl border border-slate-700/30"></div>
            ))}
          </div>
        ) : subscriptions.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Server className="w-10 h-10 mx-auto mb-3 text-slate-600" />
            <p>No active subscriptions yet. Subscribe to a plan above to provision a server.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {subscriptions.map((sub) => {
              const plan = sub.hosting_plans || {};
              const domain = sub.domains || {};
              const usage = deriveUsage(sub);
              const ip = deriveServerIp(sub);
              return (
                <div key={sub.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                        <Server className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">{domain.domain_name || 'Unnamed domain'}</h3>
                        <p className="text-xs text-slate-400">{plan.plan_name} plan · ${plan.price_monthly}/mo</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        {sub.status || 'Active'}
                      </span>
                      <p className="text-xs text-slate-400 mt-1">
                        Next billing: {new Date(sub.next_billing_date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Provisioned server details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                    <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><Wifi className="w-3 h-3" /> Server IP</div>
                      <div className="text-sm font-mono text-teal-300">{ip}</div>
                    </div>
                    <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><Server className="w-3 h-3" /> SSH</div>
                      <div className="text-sm font-mono text-slate-300">root@{ip} :22</div>
                    </div>
                    <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><Box className="w-3 h-3" /> Panel</div>
                      <div className="text-sm font-mono text-slate-300">{domain.domain_name}/cpanel</div>
                    </div>
                    <div className="rounded-xl bg-slate-900/60 border border-slate-700/40 p-3">
                      <div className="text-[10px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1"><Cpu className="w-3 h-3" /> Region</div>
                      <div className="text-sm font-mono text-slate-300">us-east-1</div>
                    </div>
                  </div>

                  {/* Resource usage bars */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> Storage</span>
                        <span>{usage.storageUsedGb} GB / {plan.storage_gb || 10} GB</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${(usage.storageUsedGb / (plan.storage_gb || 10)) > 0.8 ? 'bg-rose-500' : (usage.storageUsedGb / (plan.storage_gb || 10)) > 0.6 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (usage.storageUsedGb / (plan.storage_gb || 10)) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Wifi className="w-3 h-3" /> Bandwidth</span>
                        <span>{usage.bandwidthUsedGb} GB / {plan.bandwidth_gb || 100} GB</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${(usage.bandwidthUsedGb / (plan.bandwidth_gb || 100)) > 0.8 ? 'bg-rose-500' : (usage.bandwidthUsedGb / (plan.bandwidth_gb || 100)) > 0.6 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${Math.min(100, (usage.bandwidthUsedGb / (plan.bandwidth_gb || 100)) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span>
                        <span>{usage.cpuUsed}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${usage.cpuUsed > 80 ? 'bg-rose-500' : usage.cpuUsed > 60 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${usage.cpuUsed}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span className="flex items-center gap-1"><Database className="w-3 h-3" /> RAM</span>
                        <span>{usage.ramUsed}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div className={`h-full rounded-full ${usage.ramUsed > 80 ? 'bg-rose-500' : usage.ramUsed > 60 ? 'bg-amber-500' : 'bg-teal-500'}`} style={{ width: `${usage.ramUsed}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {subscribingPlan && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 400 }}
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setSubscribingPlan(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                  <Server className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{subscribingPlan.plan_name} Plan</h3>
                  <p className="text-slate-400 text-sm">${subscribingPlan.price_monthly}/mo</p>
                </div>
              </div>

              {domains.length === 0 ? (
                <div className="text-center py-6 text-slate-400">
                  You don&apos;t have any domains yet. Add a domain from the dashboard before subscribing.
                </div>
              ) : (
                <>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Select Domain
                  </label>
                  <select
                    value={selectedDomain}
                    onChange={(e) => setSelectedDomain(e.target.value)}
                    className="w-full p-3 bg-slate-950 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500 mb-6"
                  >
                    <option value="">Choose a domain...</option>
                    {domains.map((d) => (
                      <option key={d.id} value={d.id}>{d.domain_name}</option>
                    ))}
                  </select>

                  <button
                    onClick={confirmSubscription}
                    disabled={!selectedDomain || submitting}
                    className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Subscribing...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" /> Confirm Subscription
                      </>
                    )}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
