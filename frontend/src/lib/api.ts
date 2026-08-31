// Local data layer for DHMS
// This mocks the former Express backend. All endpoints are served from
// hardcoded seed data persisted in localStorage. No network calls are made.

// ---------- helpers ----------
const wait = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const delay = () => wait(200 + Math.random() * 400);

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

// ---------- seed data ----------
const iso = (d: Date) => d.toISOString().split('T')[0];

function seedDomains() {
  const today = new Date();
  const inDays = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  return [
    { id: 'dm-001', domain_name: 'example.com', registrar: 'Namecheap', purchase_date: inDays(-200), expiry_date: inDays(160), status: 'Active' },
    { id: 'dm-002', domain_name: 'mybusiness.net', registrar: 'GoDaddy', purchase_date: inDays(-340), expiry_date: inDays(22), status: 'Active' },
    { id: 'dm-003', domain_name: 'devops-lab.io', registrar: 'Cloudflare', purchase_date: inDays(-30), expiry_date: inDays(15), status: 'Active' },
    { id: 'dm-004', domain_name: 'legacy-site.org', registrar: 'Namecheap', purchase_date: inDays(-730), expiry_date: inDays(-45), status: 'Expired' },
    { id: 'dm-005', domain_name: 'portfolio.dev', registrar: 'Porkbun', purchase_date: inDays(-90), expiry_date: inDays(300), status: 'Active' },
    { id: 'dm-006', domain_name: 'startup-app.co', registrar: 'GoDaddy', purchase_date: inDays(-400), expiry_date: inDays(8), status: 'Active' },
  ];
}

const seedPlans = () => [
  { id: 'pl-1', plan_name: 'Starter', storage_gb: 10, bandwidth_gb: 100, price_monthly: 5, is_active: true },
  { id: 'pl-2', plan_name: 'Business', storage_gb: 50, bandwidth_gb: 500, price_monthly: 15, is_active: true },
  { id: 'pl-3', plan_name: 'Enterprise', storage_gb: 200, bandwidth_gb: 2000, price_monthly: 40, is_active: true },
];

const seedUsers = () => [
  { id: 'u-1', email: 'demo.user@dhms.com', password: 'DemoUser123!', role: 'user', created_at: iso(new Date(Date.now() - 60 * 86400000)) },
  { id: 'u-2', email: 'demo.admin@dhms.com', password: 'DemoAdmin123!', role: 'admin', created_at: iso(new Date(Date.now() - 90 * 86400000)) },
  { id: 'u-3', email: 'mike.jordan@gmail.com', password: 'Pass@123', role: 'user', created_at: iso(new Date(Date.now() - 30 * 86400000)) },
  { id: 'u-4', email: 'sarah.lee@gmail.com', password: 'Pass@123', role: 'user', created_at: iso(new Date(Date.now() - 14 * 86400000)) },
];

const seedSubscriptions = () => {
  const plans = seedPlans();
  const domains = seedDomains();
  return [
    {
      id: 'sub-1',
      domain_id: domains[0].id,
      plan_id: plans[1].id,
      start_date: iso(new Date(Date.now() - 40 * 86400000)),
      next_billing_date: iso(new Date(Date.now() + 20 * 86400000)),
      status: 'Active',
      hosting_plans: plans[1],
      domains: domains[0],
    },
  ];
};

const seedMessages = () => [
  {
    id: 'msg-1',
    name: 'Mike Jordan',
    email: 'mike.jordan@gmail.com',
    subject: 'DNS not resolving',
    message: 'My domain example2.com stopped resolving this morning. Could you help me check my A records?',
    status: 'open',
    created_at: new Date(Date.now() - 2 * 3600000).toISOString(),
  },
  {
    id: 'msg-2',
    name: 'Sarah Lee',
    email: 'sarah.lee@gmail.com',
    subject: 'Upgrade to Business plan',
    message: 'I would like to upgrade my hosting to the Business plan. How do I get invoices?',
    status: 'closed',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

// ---------- store management ----------
function ensureStore() {
  if (!read('dhms_domains', null)) write('dhms_domains', seedDomains());
  if (!read('dhms_plans', null)) write('dhms_plans', seedPlans());
  if (!read('dhms_users', null)) write('dhms_users', seedUsers());
  if (!read('dhms_subs', null)) write('dhms_subs', seedSubscriptions());
  if (!read('dhms_msgs', null)) write('dhms_msgs', seedMessages());
}

const getDomains = () => read<any[]>('dhms_domains', []);
const getPlans = () => read<any[]>('dhms_plans', []);
const getUsers = () => read<any[]>('dhms_users', []);
const getSubs = () => read<any[]>('dhms_subs', []);
const getMsgs = () => read<any[]>('dhms_msgs', []);

const publicUser = (u: any) => ({ id: u.id, email: u.email, role: u.role });

// ---------- route parsing ----------
function parseRoute(endpoint: string) {
  const [pathPart, queryPart] = endpoint.split('?');
  const segs = pathPart.split('/').filter(Boolean); // e.g. ['domains','check'] or ['hosting','plans','pl-1']
  const query = new URLSearchParams(queryPart || '');
  return { segs, query };
}

// ---------- endpoint handlers ----------
async function handle(endpoint: string, options: RequestInit): Promise<any> {
  ensureStore();
  await delay();

  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};
  const { segs, query } = parseRoute(endpoint);

  // ---- AUTH ----
  if (segs[0] === 'auth') {
    if (segs[1] === 'login') {
      const found = getUsers().find((u) => u.email.toLowerCase() === String(body.email).toLowerCase() && u.password === body.password);
      if (!found) throw new Error('Invalid login credentials');
      const user = publicUser(found);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'local-token-' + uid());
      return { access_token: localStorage.getItem('token'), user };
    }
    if (segs[1] === 'register') {
      const users = getUsers();
      if (users.some((u) => u.email.toLowerCase() === String(body.email).toLowerCase())) {
        throw new Error('An account with this email already exists');
      }
      const newUser = { id: uid(), email: body.email, password: body.password, role: 'user', created_at: iso(new Date()) };
      write('dhms_users', [...users, newUser]);
      const user = publicUser(newUser);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', 'local-token-' + uid());
      return { access_token: localStorage.getItem('token'), user };
    }
    if (segs[1] === 'me') {
      const raw = localStorage.getItem('user');
      if (!raw) throw new Error('Not authenticated');
      return { user: JSON.parse(raw) };
    }
  }

  // ---- DOMAINS ----
  if (segs[0] === 'domains') {
    if (segs[1] === 'check') {
      const name = query.get('name') || 'example.com';
      return {
        resolvable: true,
        primary_ip: '192.0.2.10',
        ipv4: ['192.0.2.10'],
        ipv6: [],
        latency_ms: 32,
        nameservers: [`ns1.${name}`, `ns2.${name}`, 'dns1.registrar.com', 'dns2.registrar.com'],
      };
    }
    if (method === 'GET') {
      return { domains: getDomains() };
    }
    if (method === 'POST') {
      const domains = getDomains();
      const created = { id: uid(), ...body, status: body.status || 'Active' };
      write('dhms_domains', [created, ...domains]);
      return { domain: created };
    }
    // /domains/:id
    const id = segs[1];
    const domains = getDomains();
    const idx = domains.findIndex((d) => d.id === id);
    if (idx === -1) throw new Error('Domain not found');
    if (method === 'PUT') {
      domains[idx] = { ...domains[idx], ...body, id };
      write('dhms_domains', domains);
      return { domain: domains[idx] };
    }
    if (method === 'DELETE') {
      domains.splice(idx, 1);
      write('dhms_domains', domains);
      return { success: true };
    }
  }

  // ---- HOSTING ----
  if (segs[0] === 'hosting') {
    if (segs[1] === 'plans') {
      if (method === 'GET') return { plans: getPlans() };
      if (method === 'POST') {
        const plans = getPlans();
        const created = { id: uid(), ...body, is_active: body.is_active ?? true };
        write('dhms_plans', [...plans, created]);
        return { plan: created };
      }
      const id = segs[2];
      const plans = getPlans();
      const idx = plans.findIndex((p) => p.id === id);
      if (idx === -1) throw new Error('Plan not found');
      if (method === 'PUT') {
        plans[idx] = { ...plans[idx], ...body, id };
        write('dhms_plans', plans);
        return { plan: plans[idx] };
      }
      if (method === 'DELETE') {
        plans.splice(idx, 1);
        write('dhms_plans', plans);
        return { success: true };
      }
    }
    if (segs[1] === 'subscriptions') {
      if (method === 'GET') return { subscriptions: getSubs() };
    }
    if (segs[1] === 'subscribe') {
      const subs = getSubs();
      const plan = getPlans().find((p) => p.id === body.plan_id);
      const domain = getDomains().find((d) => d.id === body.domain_id);
      const created = {
        id: uid(),
        domain_id: body.domain_id,
        plan_id: body.plan_id,
        start_date: iso(new Date()),
        next_billing_date: body.next_billing_date || iso(new Date(Date.now() + 30 * 86400000)),
        status: 'Active',
        hosting_plans: plan || {},
        domains: domain || {},
      };
      write('dhms_subs', [...subs, created]);
      return { subscription: created };
    }
  }

  // ---- DASHBOARD ----
  if (segs[0] === 'dashboard') {
    if (segs[1] === 'admin' && segs[2] === 'users') {
      return { users: getUsers().map(publicUser) };
    }
    if (segs[1] === 'admin') {
      return {
        stats: {
          totalUsers: getUsers().length,
          totalDomains: getDomains().length,
          totalSubscriptions: getSubs().length,
        },
      };
    }
  }

  // ---- CONTACT ----
  if (segs[0] === 'contact') {
    if (method === 'GET') return { messages: getMsgs() };
    if (method === 'POST') {
      const msgs = getMsgs();
      const created = { id: uid(), ...body, status: 'open', created_at: new Date().toISOString() };
      write('dhms_msgs', [created, ...msgs]);
      return { message: created };
    }
    if (method === 'PUT' && segs[1]) {
      const msgs = getMsgs();
      const idx = msgs.findIndex((m) => m.id === segs[1]);
      if (idx === -1) throw new Error('Message not found');
      msgs[idx] = { ...msgs[idx], ...body, id: segs[1] };
      write('dhms_msgs', msgs);
      return { message: msgs[idx] };
    }
  }

  throw new Error(`Mock endpoint not implemented: ${method} ${endpoint}`);
}

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  return handle(endpoint, options);
};
