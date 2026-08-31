"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Users, Mail, Shield, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    try {
      const data = await apiFetch("/dashboard/admin/users");
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
        className="mb-8 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" /> User Directory
        </h1>
        <p className="text-slate-400">Registered users and their roles</p>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900/40 rounded-2xl border border-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12 text-rose-400">{error}</div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-lg overflow-hidden"
        >
          <div className="divide-y divide-slate-800/60">
            {users.length === 0 ? (
              <div className="py-16 text-center text-slate-500">No users registered yet.</div>
            ) : (
              users.map((u) => (
                <motion.div
                  key={u.id}
                  variants={itemVariants}
                  className="flex flex-wrap items-center gap-4 p-5 hover:bg-slate-800/30 transition-colors"
                >
                  <div className="w-11 h-11 shrink-0 bg-slate-800 rounded-xl flex items-center justify-center text-sm font-bold border border-slate-700/50">
                    {(u.email || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-white font-semibold truncate">
                      <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Joined {u.created_at ? new Date(u.created_at).toLocaleDateString() : '—'}</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg border ${
                    u.role === 'admin'
                      ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                      : 'bg-slate-800/60 text-slate-300 border-slate-700/40'
                  }`}>
                    <Shield className="w-3.5 h-3.5" />
                    {u.role}
                  </span>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
