"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { Server, Plus, Pencil, Trash2, Power, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

interface PlanForm {
  plan_name: string;
  storage_gb: string;
  bandwidth_gb: string;
  price_monthly: string;
}

const EMPTY_FORM: PlanForm = { plan_name: "", storage_gb: "", bandwidth_gb: "", price_monthly: "" };

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [form, setForm] = useState<PlanForm>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadPlans = async () => {
    try {
      const data = await apiFetch("/hosting/plans");
      setPlans(data.plans);
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (plan: any) => {
    setEditing(plan);
    setForm({
      plan_name: plan.plan_name,
      storage_gb: String(plan.storage_gb),
      bandwidth_gb: String(plan.bandwidth_gb),
      price_monthly: String(plan.price_monthly),
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading(editing ? "Updating plan..." : "Creating plan...");
    const payload = {
      plan_name: form.plan_name,
      storage_gb: Number(form.storage_gb),
      bandwidth_gb: Number(form.bandwidth_gb),
      price_monthly: Number(form.price_monthly),
    };
    try {
      if (editing) {
        await apiFetch(`/hosting/plans/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/hosting/plans", { method: "POST", body: JSON.stringify(payload) });
      }
      toast.success(editing ? "Plan updated!" : "Plan created!", { id: toastId });
      setShowModal(false);
      loadPlans();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const togglePlan = async (plan: any) => {
    const toastId = toast.loading(plan.is_active ? "Deactivating..." : "Activating...");
    try {
      await apiFetch(`/hosting/plans/${plan.id}`, {
        method: "PUT",
        body: JSON.stringify({ is_active: !plan.is_active }),
      });
      toast.success(plan.is_active ? "Plan deactivated" : "Plan activated", { id: toastId });
      loadPlans();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

  const deletePlan = async (plan: any) => {
    if (!confirm(`Delete the "${plan.plan_name}" plan?`)) return;
    const toastId = toast.loading("Deleting plan...");
    try {
      await apiFetch(`/hosting/plans/${plan.id}`, { method: "DELETE" });
      toast.success("Plan deleted", { id: toastId });
      loadPlans();
    } catch (err: any) {
      toast.error(err.message, { id: toastId });
    }
  };

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
        className="mb-8 bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-800/50 shadow-lg flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Server className="w-7 h-7 sm:w-8 sm:h-8 text-teal-400" /> Plan Management
          </h1>
          <p className="text-slate-400">Create, edit, activate or remove hosting tiers</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" /> New Plan
        </button>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 bg-slate-900/40 rounded-3xl border border-slate-800/50 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              variants={itemVariants}
              className={`p-6 rounded-3xl bg-slate-900/40 backdrop-blur-xl border shadow-lg ${plan.is_active ? "border-slate-800/50" : "border-slate-800/30 opacity-60"}`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">{plan.plan_name}</h3>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border ${
                  plan.is_active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "bg-slate-800/60 text-slate-400 border-slate-700/40"
                }`}>
                  <Power className="w-3 h-3" /> {plan.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mb-5">
                <span className="text-4xl font-bold text-white">${plan.price_monthly}</span>
                <span className="text-slate-500 font-medium ml-1">/mo</span>
              </div>

              <ul className="space-y-2 text-sm text-slate-300 mb-6">
                <li className="flex justify-between"><span className="text-slate-500">Storage</span><span>{plan.storage_gb} GB</span></li>
                <li className="flex justify-between"><span className="text-slate-500">Bandwidth</span><span>{plan.bandwidth_gb} GB</span></li>
                <li className="flex justify-between"><span className="text-slate-500">SSL</span><span className="text-emerald-400">Free</span></li>
              </ul>

              <div className="flex gap-2">
                <button
                  onClick={() => openEdit(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors active:scale-95"
                >
                  <Pencil className="w-4 h-4" /> Edit
                </button>
                <button
                  onClick={() => togglePlan(plan)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 font-medium transition-colors active:scale-95"
                >
                  <Power className="w-4 h-4" /> {plan.is_active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deletePlan(plan)}
                  className="p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors active:scale-95"
                  aria-label="Delete plan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
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
              className="bg-slate-900 border border-slate-800 p-6 sm:p-8 rounded-3xl max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-bold text-white mb-6">{editing ? `Edit ${editing.plan_name}` : "Create New Plan"}</h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Plan Name</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white"
                    value={form.plan_name}
                    onChange={(e) => setForm({ ...form, plan_name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Storage (GB)</label>
                    <input required type="number" min="1" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white" value={form.storage_gb} onChange={(e) => setForm({ ...form, storage_gb: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Bandwidth (GB)</label>
                    <input required type="number" min="1" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white" value={form.bandwidth_gb} onChange={(e) => setForm({ ...form, bandwidth_gb: e.target.value })} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">Price (USD/mo)</label>
                  <input required type="number" min="0" step="0.01" className="w-full px-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-white" value={form.price_monthly} onChange={(e) => setForm({ ...form, price_monthly: e.target.value })} />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : editing ? "Save Changes" : "Create Plan"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
