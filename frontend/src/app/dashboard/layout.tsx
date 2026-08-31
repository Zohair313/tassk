"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Server, LogOut, Settings, Users, CreditCard, Inbox, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      window.location.href = "/login";
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (!user) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
      <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const navItems = [
    { name: "My Domains", href: "/dashboard", icon: Globe },
    { name: "Domain Table", href: "/dashboard/domains", icon: Globe },
    { name: "Hosting Plans", href: "/dashboard/hosting", icon: Server },
  ];

  const adminItems = [
    { name: "Admin Panel", href: "/dashboard/admin", icon: Settings },
    { name: "User Directory", href: "/dashboard/admin/users", icon: Users },
    { name: "Plan Management", href: "/dashboard/admin/plans", icon: CreditCard },
    { name: "Support Queries", href: "/dashboard/admin/messages", icon: Inbox },
  ];

  const isAdmin = user?.role === "admin";

  const sidebarContent = (
    <>
      <div className="h-20 flex items-center px-6 border-b border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-xl shadow-[0_0_15px_rgba(13,148,136,0.5)] group-hover:scale-110 transition-transform">
            D
          </div>
          <span className="text-xl font-bold tracking-tight text-white">DHMS V2</span>
        </Link>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                isActive
                  ? "bg-teal-600 text-white shadow-[0_0_15px_rgba(13,148,136,0.3)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        {isAdmin && (
          <>
            <div className="px-4 pt-5 pb-2 text-xs font-bold uppercase tracking-wider text-slate-600">Admin</div>
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                    isActive
                      ? "bg-teal-600 text-white shadow-[0_0_15px_rgba(13,148,136,0.3)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/30">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sm font-bold border border-slate-700/50 shadow-inner">
            {user.email.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-200 truncate">{user.email}</p>
            <p className="text-xs text-slate-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors font-medium active:scale-95"
        >
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans flex relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-teal-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none animate-blob z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full mix-blend-screen filter blur-[100px] pointer-events-none animate-blob animation-delay-4000 z-0"></div>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/50 flex items-center justify-between px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center font-bold text-lg">D</div>
          <span className="text-lg font-bold text-white">DHMS V2</span>
        </Link>
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-slate-300 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 border-r border-slate-800/50 bg-slate-900/60 backdrop-blur-xl flex-col relative z-20 shadow-2xl">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="lg:hidden fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800/50 flex flex-col shadow-2xl"
            >
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative z-10 pt-16 lg:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
