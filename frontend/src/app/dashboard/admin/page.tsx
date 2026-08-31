'use client';
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Users, Globe, Server, Activity, TrendingUp, Check } from "lucide-react";
import Link from "next/link";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';

const mockChartData = [
  { name: 'Jan', users: 120, domains: 40 },
  { name: 'Feb', users: 210, domains: 80 },
  { name: 'Mar', users: 380, domains: 150 },
  { name: 'Apr', users: 500, domains: 290 },
  { name: 'May', users: 780, domains: 450 },
  { name: 'Jun', users: 1100, domains: 720 },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await apiFetch("/dashboard/admin");
        setStats(data.stats);
      } catch (err) {
        console.error(err);
        window.location.href = "/dashboard";
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    { name: "Total Users", value: stats?.totalUsers || 0, icon: Users, color: "text-teal-400", bg: "bg-teal-500/10" },
    { name: "Total Domains", value: stats?.totalDomains || 0, icon: Globe, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { name: "Total Subscriptions", value: stats?.totalSubscriptions || 0, icon: Server, color: "text-emerald-400", bg: "bg-emerald-500/10" },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    show: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="p-8 w-full max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-500 animate-[pulse_3s_ease-in-out_infinite]" />
            Admin Control Panel
          </h1>
          <p className="text-slate-400">Global system metrics and management</p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-slate-900/40 backdrop-blur-xl rounded-3xl border border-slate-800/50 animate-pulse"></div>
            ))}
          </div>
        ) : (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="show" 
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div variants={itemVariants} key={stat.name} className="p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>
                  <h3 className="text-4xl font-bold text-white mb-1">{stat.value}</h3>
                  <p className="text-sm text-slate-400 font-medium">{stat.name}</p>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 300, damping: 30 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-lg">
            <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5 text-teal-400" />
              Platform Growth
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2dd4bf" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#2dd4bf" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDomains" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34d399" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#34d399" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    itemStyle={{ color: '#e2e8f0' }}
                  />
                  <Area type="monotone" dataKey="users" stroke="#2dd4bf" strokeWidth={3} fillOpacity={1} fill="url(#colorUsers)" />
                  <Area type="monotone" dataKey="domains" stroke="#34d399" strokeWidth={3} fillOpacity={1} fill="url(#colorDomains)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl p-6 shadow-lg flex flex-col group">
            <h3 className="text-xl font-bold mb-4 text-white">System Alerts</h3>
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-8">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-500 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <p className="font-bold text-emerald-400">All systems operational</p>
              <p className="text-sm mt-1">No active alerts or issues</p>
            </div>
          </div>
        </motion.div>
      </div>
  );
}
