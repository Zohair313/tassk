"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Inbox, Mail, CheckCircle2, RotateCcw, Filter } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const loadMessages = async () => {
    try {
      const data = await apiFetch("/contact");
      setMessages(data.messages || []);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const setStatus = async (id: string, status: string) => {
    const toastId = toast.loading("Updating status...");
    try {
      await apiFetch(`/contact/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
      toast.success(status === "closed" ? "Marked as resolved" : "Reopened", { id: toastId });
      loadMessages();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const filtered = messages.filter((m) => (filter === "all" ? true : m.status === filter));
  const openCount = messages.filter((m) => m.status === "open").length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const filters: { key: "all" | "open" | "closed"; label: string }[] = [
    { key: "all", label: `All (${messages.length})` },
    { key: "open", label: `Open (${openCount})` },
    { key: "closed", label: "Resolved" },
  ];

  return (
    <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Inbox className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" /> Support Queries
        </h1>
        <p className="text-slate-400">Track and resolve incoming contact requests</p>
      </motion.div>

      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="flex items-center gap-1.5 text-sm text-slate-400 mr-2"><Filter className="w-4 h-4" /> Filter:</span>
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              filter === f.key ? "bg-teal-600 text-white" : "bg-slate-800/70 text-slate-300 hover:bg-slate-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-slate-900/40 rounded-2xl border border-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500">No messages here.</div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
          {filtered.map((m) => (
            <motion.div
              key={m.id}
              variants={itemVariants}
              className="p-5 rounded-2xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center text-sm font-bold border border-slate-700/50">
                    {(m.name || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-white">{m.subject}</p>
                    <p className="text-xs text-slate-400 flex items-center gap-1 truncate">
                      <Mail className="w-3 h-3 shrink-0" /> {m.name} · {m.email}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${
                  m.status === "closed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {m.status === "closed" ? "Resolved" : "Open"}
                </span>
              </div>
              <p className="text-slate-300 text-sm mb-3 whitespace-pre-wrap">{m.message}</p>
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">{m.created_at ? new Date(m.created_at).toLocaleString() : ""}</span>
                <button
                  onClick={() => setStatus(m.id, m.status === "closed" ? "open" : "closed")}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all active:scale-95 ${
                    m.status === "closed"
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "bg-emerald-600 hover:bg-emerald-500 text-white"
                  }`}
                >
                  {m.status === "closed" ? <><RotateCcw className="w-4 h-4" /> Reopen</> : <><CheckCircle2 className="w-4 h-4" /> Mark Resolved</>}
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
