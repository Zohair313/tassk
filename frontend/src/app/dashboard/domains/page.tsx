"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import toast from "react-hot-toast";
import { Plus, Trash2, Pencil, Globe, X, Loader2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FormState {
  domain_name: string;
  registrar: string;
  purchase_date: string;
  expiry_date: string;
}

const EMPTY: FormState = { domain_name: "", registrar: "", purchase_date: "", expiry_date: "" };

function computeStatus(expiryDate: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);
  const days = Math.floor((exp.getTime() - today.getTime()) / 86400000);
  if (days < 0) return { label: "Expired", cls: "bg-red-500/10 text-red-400 border-red-500/30" };
  if (days <= 30) return { label: "Expiring Soon", cls: "bg-amber-500/10 text-amber-400 border-amber-500/30" };
  return { label: "Active", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" };
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");

  const loadDomains = async () => {
    try {
      setLoading(true);
      const data = await apiFetch("/domains");
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

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowModal(true);
  };

  const openEdit = (d: any) => {
    setEditing(d);
    setForm({
      domain_name: d.domain_name,
      registrar: d.registrar,
      purchase_date: d.purchase_date || "",
      expiry_date: d.expiry_date,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading(editing ? "Updating domain..." : "Adding domain...");
    try {
      if (editing) {
        await apiFetch(`/domains/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
      } else {
        await apiFetch("/domains", { method: "POST", body: JSON.stringify({ ...form, status: "Active" }) });
      }
      toast.success(editing ? "Domain updated!" : "Domain added!", { id: toastId });
      setShowModal(false);
      loadDomains();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this domain? This cannot be undone.")) return;
    const toastId = toast.loading("Deleting...");
    try {
      await apiFetch(`/domains/${id}`, { method: "DELETE" });
      toast.success("Domain deleted", { id: toastId });
      loadDomains();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const filtered = domains.filter((d) =>
    d.domain_name.toLowerCase().includes(search.toLowerCase()) ||
    (d.registrar || "").toLowerCase().includes(search.toLowerCase())
  );

  const field = "px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white w-full";
  const label = "block text-sm font-medium text-slate-300 mb-1";

  return (
    <div className="p-4 sm:p-8 w-full max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
            <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" /> Domain Registry
          </h1>
          <p className="text-slate-400 mt-1 text-sm sm:text-base">Full CRUD table for your domains</p>
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full sm:w-56"
            />
          </div>
          <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all active:scale-95">
            <Plus className="w-4 h-4" /> Add Domain
          </button>
        </div>
      </motion.div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-slate-900/40 rounded-2xl border border-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 rounded-3xl shadow-lg overflow-hidden">
          {/* Desktop table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 text-slate-300">
                <tr>
                  <th className="px-6 py-4 font-medium">Domain Name</th>
                  <th className="px-6 py-4 font-medium">Registrar</th>
                  <th className="px-6 py-4 font-medium">Purchased</th>
                  <th className="px-6 py-4 font-medium">Expires</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-500">No domains found.</td></tr>
                ) : (
                  filtered.map((d) => {
                    const s = computeStatus(d.expiry_date);
                    return (
                      <tr key={d.id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="px-6 py-4 font-medium text-white">{d.domain_name}</td>
                        <td className="px-6 py-4 text-slate-400">{d.registrar}</td>
                        <td className="px-6 py-4 text-slate-400">{d.purchase_date ? new Date(d.purchase_date).toLocaleDateString() : "—"}</td>
                        <td className="px-6 py-4 text-slate-400">{new Date(d.expiry_date).toLocaleDateString()}</td>
                        <td className="px-6 py-4"><span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>{s.label}</span></td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openEdit(d)} className="p-2 text-slate-400 hover:text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors" title="Edit">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(d.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors" title="Delete">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden divide-y divide-slate-800/60">
            {filtered.length === 0 ? (
              <div className="px-6 py-10 text-center text-slate-500">No domains found.</div>
            ) : (
              filtered.map((d) => {
                const s = computeStatus(d.expiry_date);
                return (
                  <div key={d.id} className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0">
                        <p className="font-bold text-white truncate">{d.domain_name}</p>
                        <p className="text-xs text-slate-400">{d.registrar}</p>
                      </div>
                      <span className={`shrink-0 inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <p className="text-xs text-slate-500">Purchased: {d.purchase_date ? new Date(d.purchase_date).toLocaleDateString() : "—"} · Expires: {new Date(d.expiry_date).toLocaleDateString()}</p>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(d)} className="p-2 text-teal-300 hover:bg-teal-500/10 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(d.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
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
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-6">{editing ? `Edit ${editing.domain_name}` : "Add New Domain"}</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className={label}>Domain Name</label>
                  <input required type="text" className={field} value={form.domain_name} onChange={(e) => setForm({ ...form, domain_name: e.target.value })} placeholder="example.com" />
                </div>
                <div>
                  <label className={label}>Registrar</label>
                  <input required type="text" className={field} value={form.registrar} onChange={(e) => setForm({ ...form, registrar: e.target.value })} placeholder="Namecheap" />
                </div>
                <div>
                  <label className={label}>Purchase Date</label>
                  <input type="date" className={field} value={form.purchase_date} onChange={(e) => setForm({ ...form, purchase_date: e.target.value })} />
                </div>
                <div>
                  <label className={label}>Expiry Date</label>
                  <input required type="date" className={field} value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors active:scale-95">Cancel</button>
                  <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? "Save Changes" : "Add Domain"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
