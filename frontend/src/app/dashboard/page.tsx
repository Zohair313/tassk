'use client';
import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import toast from 'react-hot-toast';
import { Globe, Plus, Trash2, AlertTriangle, ChevronLeft, ChevronRight, Activity, Loader2, Server, Gauge, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const PER_PAGE = 5;

function computeDomainStatus(expiryDate: string): { status: string; daysLeft: number; statusColor: string; statusBg: string; statusBorder: string; barColor: string } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  const daysLeft = Math.floor((exp.getTime() - today.getTime()) / 86400000);

  if (daysLeft < 0) {
    return { status: 'Expired', daysLeft, statusColor: 'text-rose-400', statusBg: 'bg-rose-500/10', statusBorder: 'border-rose-500/30', barColor: 'bg-rose-500' };
  }
  if (daysLeft <= 30) {
    return { status: 'Expiring Soon', daysLeft, statusColor: 'text-amber-400', statusBg: 'bg-amber-500/10', statusBorder: 'border-amber-500/30', barColor: 'bg-amber-500' };
  }
  return { status: 'Active', daysLeft, statusColor: 'text-emerald-400', statusBg: 'bg-emerald-500/10', statusBorder: 'border-emerald-500/30', barColor: 'bg-emerald-500' };
}

export default function DashboardPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [domainName, setDomainName] = useState('');
  const [registrar, setRegistrar] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [domainToDelete, setDomainToDelete] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [healthResults, setHealthResults] = useState<Record<string, any>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const totalPages = Math.max(1, Math.ceil(domains.length / PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * PER_PAGE;
  const pagedDomains = domains.slice(startIndex, startIndex + PER_PAGE);

  const loadDomains = async () => {
    try {
      const data = await apiFetch('/domains');
      setDomains(data.domains || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    if (currentPage !== page) setPage(currentPage);
  }, [currentPage, page]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    const loadingToast = toast.loading('Adding domain...');
    try {
      await apiFetch('/domains', {
        method: 'POST',
        body: JSON.stringify({ domain_name: domainName, registrar, expiry_date: expiryDate, status: 'Active' }),
      });
      setDomainName('');
      setRegistrar('');
      setExpiryDate('');
      toast.success('Domain added successfully!', { id: loadingToast });
      loadDomains();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const confirmDelete = async () => {
    if (!domainToDelete) return;
    const loadingToast = toast.loading('Deleting domain...');
    try {
      await apiFetch(`/domains/${domainToDelete}`, { method: 'DELETE' });
      toast.success('Domain deleted!', { id: loadingToast });
      setDomainToDelete(null);
      loadDomains();
    } catch (err: any) {
      toast.error(err.message, { id: loadingToast });
    }
  };

  const runHealthCheck = async (domain: any) => {
    setCheckingId(domain.id);
    try {
      const data = await apiFetch(`/domains/check?name=${encodeURIComponent(domain.domain_name)}`);
      setHealthResults((prev) => ({ ...prev, [domain.id]: data }));
      setExpandedId(domain.id);
      toast[data.resolvable ? 'success' : 'error'](
        data.resolvable ? `${domain.domain_name} resolves to ${data.primary_ip}` : `${domain.domain_name} is not resolvable`
      );
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCheckingId(null);
    }
  };

  const liveStats = (() => {
    const counted = domains.map((d) => computeDomainStatus(d.expiry_date).status);
    const active = counted.filter((s) => s === 'Active').length;
    const expiring = counted.filter((s) => s === 'Expiring Soon').length;
    const expired = counted.filter((s) => s === 'Expired').length;
    return { active, expiring, expired };
  })();

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto space-y-6 sm:space-y-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
          <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" />
          DevOps Domain Console
        </h1>
        <p className="text-slate-400 mt-1 text-sm sm:text-base">Monitor, resolve and manage your domains like an ops engineer</p>
      </motion.div>

        {/* Stats Summary */}
        {domains.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Total Domains", value: domains.length, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
              { label: "Healthy / Active", value: liveStats.active, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
              { label: "Expiring Soon", value: liveStats.expiring, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
              { label: "Expired", value: liveStats.expired, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" }
            ].map((s) => (
              <motion.div key={s.label} className={`rounded-2xl border ${s.border} ${s.bg} p-5`}>
                <div className={`text-3xl font-black ${s.color} mb-1`}>{s.value}</div>
                <div className="text-xs sm:text-sm text-slate-400 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Domain Addition Form */}
        <motion.form 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ delay: 0.1 }}
          onSubmit={handleAddDomain} 
          className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-end relative overflow-hidden group"
        >
          <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12 animate-[shimmer_3s_infinite] pointer-events-none"></div>

          <div className="space-y-2 relative z-10">
            <label className="text-xs font-medium text-slate-400 ml-1">Domain Name</label>
            <input
              placeholder="e.g. example.com"
              value={domainName}
              onChange={(e) => setDomainName(e.target.value)}
              required
              className="w-full p-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all hover:border-slate-600"
            />
          </div>
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-medium text-slate-400 ml-1">Registrar</label>
            <input
              placeholder="e.g. Namecheap"
              value={registrar}
              onChange={(e) => setRegistrar(e.target.value)}
              required
              className="w-full p-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all hover:border-slate-600"
            />
          </div>
          <div className="space-y-2 relative z-10">
            <label className="text-xs font-medium text-slate-400 ml-1">Expiry Date</label>
            <input
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
              className="w-full p-3 bg-slate-950/50 border border-slate-700/50 rounded-xl text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all hover:border-slate-600"
            />
          </div>
          <button type="submit" className="relative z-10 w-full h-[50px] flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all hover:shadow-[0_0_20px_rgba(13,148,136,0.4)] active:scale-95 overflow-hidden">
            <span className="relative z-10 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Add Domain
            </span>
          </button>
        </motion.form>

        {/* Domain List */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg min-h-[300px]"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              Registered Domains 
              <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 text-sm rounded-md border border-teal-500/30">{domains.length}</span>
            </h2>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-800/50 animate-pulse rounded-2xl border border-slate-700/30"></div>
              ))}
            </div>
          ) : domains.length === 0 ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-700/50">
                <Globe className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No domains found</h3>
              <p className="text-slate-400 max-w-sm px-4">You haven't registered any domains yet. Add your first domain using the form above to get started.</p>
            </motion.div>
          ) : (
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-3">
              {pagedDomains.map((domain) => {
                const info = computeDomainStatus(domain.expiry_date);
                const health = healthResults[domain.id];
                const isChecking = checkingId === domain.id;
                const isExpanded = expandedId === domain.id;
                return (
                  <motion.div variants={itemVariants} key={domain.id} className="group bg-slate-800/30 hover:bg-slate-800/60 p-5 rounded-2xl border border-slate-700/30 hover:border-teal-500/30 transition-all duration-300 hover:shadow-lg">
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-wrap justify-between items-center gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-11 h-11 shrink-0 bg-slate-900/80 rounded-xl flex items-center justify-center border border-slate-700/50 group-hover:border-teal-500/50 transition-colors group-hover:scale-110 duration-300">
                            <Globe className="w-6 h-6 text-teal-400" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-bold text-white mb-0.5 truncate">{domain.domain_name}</h3>
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                {domain.registrar}
                              </span>
                              <span className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                                Expires: {new Date(domain.expiry_date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-3 py-1 text-xs font-bold rounded-lg ${info.statusBg} ${info.statusColor} border ${info.statusBorder}`}>
                            {info.status}
                          </span>
                          <button 
                            onClick={() => runHealthCheck(domain)} 
                            disabled={isChecking}
                            className="p-2 bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 rounded-lg transition-colors border border-transparent hover:border-teal-500/30 active:scale-90"
                            title="Run DNS health check"
                          >
                            {isChecking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => setExpandedId(isExpanded ? null : domain.id)}
                            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors border border-slate-700 active:scale-90"
                            title="DevOps details"
                          >
                            {isExpanded ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button 
                            onClick={() => setDomainToDelete(domain.id)} 
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors border border-transparent hover:border-red-500/30 active:scale-90"
                            title="Delete Domain"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Expiry progress bar */}
                      <div className="w-full">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Health uses days remaining until expiry</span>
                          <span className={info.statusColor}>
                            {info.daysLeft < 0 ? `${Math.abs(info.daysLeft)}d overdue` : `${info.daysLeft}d left`}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(0, Math.min(100, (info.daysLeft / 365) * 100))}%` }}
                            transition={{ duration: 0.6 }}
                            className={`h-full rounded-full ${info.barColor}`}
                          ></motion.div>
                        </div>
                      </div>

                      {/* DevOps details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 rounded-xl border border-slate-700/40 bg-slate-950/40 p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                  <Gauge className="w-3.5 h-3.5" /> DNS / Resolution
                                </div>
                                {health ? (
                                  <div className="space-y-1.5 text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${health.resolvable ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                      <span className="text-slate-300">{health.resolvable ? 'Resolvable' : 'Not resolvable'}</span>
                                    </div>
                                    <p className="text-slate-400">A record: <span className="text-teal-300 font-mono">{health.primary_ip || '—'}</span></p>
                                    <p className="text-slate-400">IPv4: <span className="font-mono">{health.ipv4?.length ? health.ipv4.join(', ') : '—'}</span></p>
                                    <p className="text-slate-400">IPv6: <span className="font-mono">{health.ipv6?.length ? health.ipv6.join(', ') : '—'}</span></p>
                                    <p className="text-slate-400">Latency: <span className="font-mono">{health.latency_ms}ms</span></p>
                                  </div>
                                ) : isChecking ? (
                                  <p className="text-slate-400 text-sm animate-pulse">Resolving DNS...</p>
                                ) : (
                                  <p className="text-slate-400 text-sm">Run a health check to see DNS resolution and A record.</p>
                                )}
                              </div>
                              <div>
                                <div className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1.5">
                                  <Server className="w-3.5 h-3.5" /> Nameservers
                                </div>
                                {health?.nameservers?.length ? (
                                  <ul className="space-y-1.5 text-sm">
                                    {health.nameservers.slice(0, 4).map((ns: string) => (
                                      <li key={ns} className="text-slate-300 font-mono text-xs">{ns}</li>
                                    ))}
                                  </ul>
                                ) : (
                                  <p className="text-slate-400 text-sm">Nameservers unavailable. Run a health check.</p>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between border-t border-slate-800/50 pt-4 flex-col sm:flex-row gap-3">
              <p className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                  className="flex items-center gap-1 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-white rounded-xl font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                <button
                  onClick={() => setPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="flex items-center gap-1 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>

      {/* Custom Delete Modal */}
      <AnimatePresence>
        {domainToDelete && (
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
              className="bg-slate-900 border border-slate-800 p-8 rounded-3xl max-w-md w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full mix-blend-screen filter blur-3xl pointer-events-none"></div>

              <div className="flex flex-col items-center text-center gap-4 mb-8 relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Delete Domain?</h3>
                  <p className="text-slate-400 text-sm">
                    Are you sure you want to delete this domain? This action cannot be undone and you will lose all associated data.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 justify-center relative z-10 flex-col sm:flex-row">
                <button 
                  onClick={() => setDomainToDelete(null)} 
                  className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium active:scale-95"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete} 
                  className="flex-1 px-4 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all shadow-[0_0_15px_rgba(220,38,38,0.3)] font-medium active:scale-95"
                >
                  Yes, Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
