"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X, Send, Bot, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Msg {
  from: "bot" | "user";
  text: string;
}

const KNOWLEDGE: { keywords: string[]; answer: string }[] = [
  // --- Greetings ---
  {
    keywords: ["hi", "hello", "hey", "salam", "assalam", "good morning", "good evening", "good afternoon"],
    answer: "Hello! 👋 I'm the DHMS assistant. Ask me about adding domains, hosting plans, billing, login, admin panel, or anything about the platform."
  },
  { keywords: ["how are you", "kya haal", "kaise ho"], answer: "I'm doing great, thanks for asking! 😊 How can I help you with DHMS today?" },
  { keywords: ["thank", "thanks", "shukriya", "thank you"], answer: "You're welcome! 😊 If you need anything else, just ask." },
  { keywords: ["bye", "goodbye", "khuda hafiz", "see you"], answer: "Goodbye! 👋 Feel free to come back anytime if you have more questions about DHMS." },
  { keywords: ["who are you", "what are you", "your name", "tum kon"], answer: "I'm the DHMS Assistant 🤖 — a built-in helper that answers questions about the Domain & Hosting Management System. Ask me anything about the platform!" },
  { keywords: ["what can you do", "help me", "capabilities", "features", "what do you know"], answer: "I can answer questions about: adding/editing/deleting domains, hosting plans and pricing, billing dates, login & registration, the admin panel, roles, statuses, and more. Just ask!" },

  // --- About / platform ---
  {
    keywords: ["what is this", "about", "what is dhms", "platform", "software", "website", "system", "app"],
    answer: "DHMS (Domain & Hosting Management System) is a centralized web platform to register domains, link hosting subscriptions (Starter, Business, Enterprise), and monitor expiry dates, billing cycles, and platform growth — all from one dashboard."
  },
  { keywords: ["who made", "developer", "created", "built by", "team"], answer: "DHMS was built as a full-stack web application (Next.js frontend + Express backend with Supabase) to make domain and hosting management simple for users and admins." },
  { keywords: ["is it free", "free to use", "cost", "price", "pricing", "kitne ka", "charges"], answer: "DHMS is free to sign up and use. The paid hosting plans (optional) cost: Starter $5/mo, Business $15/mo, Enterprise $45/mo." },
  { keywords: ["technology", "tech stack", "built with", "backend", "frontend", "framework"], answer: "DHMS uses Next.js (React) on the frontend, Express on the backend, and Supabase for the database and authentication. It's responsive and works on mobile and desktop." },
  { keywords: ["secure", "security", "safe", "private", "data safe"], answer: "Yes — authentication is handled securely via Supabase, and your data is protected by role-based access control (only you see your domains, admins see global stats)." },

  // --- Get started / navigation ---
  { keywords: ["get started", "start", "begin", "first step", "kaise shuru"], answer: "Start by creating an account on the homepage ('Get Started'), sign in, then go to your Dashboard to add your first domain." },
  { keywords: ["nav", "navigation", "where", "location", "find"], answer: "After signing in, use the sidebar on the left: Dashboard (My Domains), Hosting Plans, Contact, and — for admins — Admin Panel." },
  { keywords: ["dashboard", "my domains", "domain list", "home page after login"], answer: "Your Dashboard lists all your domains with status, registrar, expiry date, and actions (edit/delete/CSV). It also shows summary stats and lets you add new domains." },

  // --- Login / account ---
  {
    keywords: ["login", "sign in", "log in", "login problem", "not login", "can't login", "cant login", "login loop"],
    answer: "Use the 'Sign In' button on the homepage with your email and password. If you just signed up, check your inbox and confirm your email first — otherwise you'll be stuck in a login loop. Once confirmed, you can sign in normally."
  },
  { keywords: ["register", "sign up", "create account", "new account", "join"], answer: "Click 'Get Started' or 'Create Account' on the homepage, enter your email and password, and you're in. New accounts get the 'user' role by default." },
  { keywords: ["forgot password", "reset password", "password change", "change password"], answer: "Currently, password reset is managed through your Supabase sign-in flow. If you need help resetting it, contact support and we'll assist you." },
  { keywords: ["logout", "sign out", "log out"], answer: "Click 'Sign Out' at the bottom of the dashboard sidebar to securely log out." },
  { keywords: ["account delete", "delete account", "deactivate"], answer: "If you'd like to delete your account, please contact support and we'll take care of it for you." },

  // --- Domains ---
  {
    keywords: ["add domain", "register domain", "how to add", "new domain", "add new"],
    answer: "To add a domain: sign in, go to Dashboard (My Domains), fill in the Domain Name, Registrar, and Expiry Date, then click 'Add Domain'. It appears in your list instantly."
  },
  { keywords: ["edit domain", "change domain", "update domain", "modify"], answer: "On the Dashboard, click the edit (pencil) icon next to a domain, update the name, registrar, or expiry date, then save." },
  { keywords: ["delete domain", "remove domain", "trash", "delete"], answer: "On the Dashboard, click the trash icon next to a domain and confirm. Note: deleting a domain also removes its associated hosting subscriptions. This cannot be undone." },
  { keywords: ["how many domains", "multiple domains", "limit", "max domains"], answer: "There's no fixed limit on how many domains you can add — add as many as you need! The Dashboard paginates the list 5 per page." },
  { keywords: ["csv", "export", "download", "backup", "import"], answer: "You can export your domain list as a CSV file directly from the Dashboard to back up or share your data." },
  { keywords: ["domain status", "status", "expiry", "expire", "expiring", "renewal", "expired"], answer: "Each domain shows a status: Active, Expiring Soon, or Expired — based on its expiry date. Keep an eye on the Dashboard and renew before expiry." },
  { keywords: ["registrar", "namecheap", "godaddy", "where bought"], answer: "The Registrar field just records where you bought the domain (e.g., Namecheap, GoDaddy) so you can track it. You edit it from the Dashboard." },
  { keywords: ["domain expire", "domain expiring soon", "renew domain"], answer: "Domains near their expiry date get an 'Expiring Soon' status. Renew them with your registrar before the expiry date so they don't expire or get lost." },
  { keywords: ["how to renew", "renew", "extension"], answer: "Renewal happens with your domain registrar (where you bought the domain). DHMS tracks the expiry date so you know when to renew." },

  // --- Hosting / subscription ---
  {
    keywords: ["hosting", "plan", "subscribe", "subscription", "buy hosting", "hosting plan"],
    answer: "Go to 'Hosting Plans' in the sidebar, pick Starter, Business, or Enterprise, click 'Subscribe Now', choose one of your domains, and confirm. Your next billing date is set one month ahead automatically."
  },
  { keywords: ["starter", "basic", "small plan"], answer: "The Starter plan costs $5/mo — best for a single small site. It includes 10GB SSD storage and 100GB bandwidth." },
  { keywords: ["business", "pro", "medium plan"], answer: "The Business plan costs $15/mo — great for growing sites. It includes 50GB SSD storage and 500GB bandwidth." },
  { keywords: ["enterprise", "premium", "large plan", "biggest"], answer: "The Enterprise plan costs $45/mo — for high-traffic sites. It includes 200GB SSD storage and 2000GB bandwidth." },
  { keywords: ["billing", "billing date", "next billing", "renewal date", "charged"], answer: "When you subscribe to hosting, your next billing date is set one month after signup automatically, so you always know when you'll be charged." },
  { keywords: ["cancel subscription", "cancel hosting", "unsubscribe", "stop subscription"], answer: "To cancel a hosting subscription, contact support and request cancellation for the specific domain. We'll handle it." },
  { keywords: ["storage", "bandwidth", "disk space", "traffic"], answer: "Starter: 10GB SSD + 100GB bandwidth. Business: 50GB SSD + 500GB. Enterprise: 200GB SSD + 2000GB. All plans come with free SSL." },
  { keywords: ["ssl", "https", "secure connection", "certificate"], answer: "All DHMS hosting plans include a free SSL certificate, so your sites run over secure HTTPS." },
  { keywords: ["speed", "performance", "fast", "uptime"], answer: "DHMS monitors platform uptime and performance, and its dashboards include real-time metrics so you can track growth and reliability." },
  { keywords: ["email hosting", "email plan", "custom email"], answer: "Currently DHMS focuses on domain and web hosting management. For email hosting, please contact support." },

  // --- Admin / roles ---
  { keywords: ["admin", "admin panel", "admin login", "control panel"], answer: "Admins get a dedicated Admin Control Panel (in their sidebar) showing global stats: total users, total domains, total subscriptions, and a platform growth chart." },
  { keywords: ["role", "rbac", "roles", "permission", "access control"], answer: "DHMS has two roles: 'user' (personal dashboard) and 'admin' (global platform visibility). Only admins can see platform-wide metrics." },
  { keywords: ["become admin", "make me admin", "admin role", "change role"], answer: "Roles are assigned by the system. New accounts start as 'user'. If you need admin access, contact support to request it." },
  { keywords: ["how many users", "user count", "how many domains total", "how many subscriptions"], answer: "Admins can see these numbers in the Admin Panel: total users, total domains, and total subscriptions, plus a growth chart." },
  { keywords: ["admin dashboard", "what does admin see"], answer: "Admins see global metrics (users, domains, subscriptions) and a platform growth chart — the big-picture view of all activity." },

  // --- Metrics / stats ---
  { keywords: ["metrics", "statistics", "stats", "analytics", "chart", "graph"], answer: "The Admin Panel shows live metrics: total users, domains, subscriptions, and a growth chart. Users see their own domain summary stats on the Dashboard." },

  // --- Contact / support ---
  { keywords: ["contact", "support", "reach", "email us", "message", "report"], answer: "Use the 'Contact Us' page (linked in the footer) to send a message. Our team responds within 24 hours. You can also reach us from the Contact link in the dashboard sidebar." },
  { keywords: ["bug", "problem", "error", "issue", "not working", "broken"], answer: "I'm sorry to hear that! Please describe the issue and use the 'Contact Us' page to report it so our team can fix it quickly." },
  { keywords: ["response time", "how fast", "reply time", "24 hours"], answer: "Our support team aims to respond to every message within 24 hours." },

  // --- FAQ / misc ---
  { keywords: ["faq", "question", "common questions", "q a"], answer: "I'm here to help! Ask me about adding/editing/deleting domains, hosting plans, billing, login, admin panel, roles, or contact support. You can also visit the FAQ page in the footer." },
  { keywords: ["mobile", "phone", "responsive", "android", "iphone"], answer: "Yes! DHMS is fully responsive — the whole site (homepage, dashboard, chat) works smoothly on mobile and desktop. The chat box resizes to fit your screen." },
  { keywords: ["language", "urdu", "hindi", "english"], answer: "The DHMS interface is in English. If you'd like help in Urdu or Hindi, just ask me here — I can explain anything in simple terms." },

  // --- Fallback help ---
  { keywords: ["i don't know", "nothing", "bad", "no"], answer: "No problem! Try asking about: how to add a domain, hosting plans and prices, billing dates, login, or the admin panel." }
];

const FALLBACK =
  "Sorry, I didn't quite catch that. 🤔 Try asking about: adding a domain, hosting plans, billing, login, admin panel, roles, or how to contact support.";

function getAnswer(input: string): string {
  const q = input.toLowerCase();
  let best: string | null = null;
  let bestLen = 0;
  for (const item of KNOWLEDGE) {
    for (const k of item.keywords) {
      if (q.includes(k.toLowerCase()) && k.length > bestLen) {
        best = item.answer;
        bestLen = k.length;
      }
    }
  }
  return best ?? FALLBACK;
}

const QUICK_SUGGESTIONS = [
  "How do I add a domain?",
  "How do I delete a domain?",
  "What are the hosting plans?",
  "Is DHMS free to use?",
  "How does billing work?",
  "What can the admin do?"
];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { from: "bot", text: "Hi! 👋 I'm the DHMS assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open, typing]);

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;
    setMessages((m) => [...m, { from: "user", text: trimmed }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      setMessages((m) => [...m, { from: "bot", text: getAnswer(trimmed) }]);
      setTyping(false);
    }, 700);
  };

  return (
    <>
      {/* Floating button */}
      <motion.button
        onClick={() => setOpen((v) => !v)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-5 right-5 z-[60] w-14 h-14 rounded-full bg-teal-500 text-slate-950 shadow-[0_0_25px_rgba(13,148,136,0.6)] flex items-center justify-center"
        aria-label="Chat support"
      >
        {(open ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />)}
      </motion.button>

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-4 sm:right-5 z-[60] w-[calc(100vw-2rem)] max-w-sm rounded-3xl border border-teal-500/30 bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-teal-600 to-emerald-500 text-slate-950">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm">DHMS Assistant</p>
                <p className="text-[11px] font-medium opacity-80">Online · replies instantly</p>
              </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto px-4 py-4 space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`flex gap-2 max-w-[85%] ${m.from === "user" ? "flex-row-reverse" : ""}`}>
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${m.from === "user" ? "bg-teal-500 text-slate-950" : "bg-slate-700 text-teal-400"}`}>
                      {m.from === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${m.from === "user" ? "bg-teal-600 text-white rounded-tr-sm" : "bg-slate-800 text-slate-100 rounded-tl-sm"}`}>
                      {m.text}
                    </div>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="flex justify-start">
                  <div className="flex gap-2">
                    <div className="w-7 h-7 rounded-full bg-slate-700 text-teal-400 flex items-center justify-center">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="px-3.5 py-2.5 rounded-2xl bg-slate-800 text-slate-100 text-sm">
                      <span className="inline-flex gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:150ms]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce [animation-delay:300ms]" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {QUICK_SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="text-xs px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-300 hover:bg-teal-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2 border-t border-slate-800 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about DHMS..."
                className="flex-1 bg-slate-800/70 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="w-11 h-11 rounded-xl bg-teal-600 hover:bg-teal-500 text-white flex items-center justify-center transition-colors disabled:opacity-50"
                disabled={!input.trim() || typing}
                aria-label="Send"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
