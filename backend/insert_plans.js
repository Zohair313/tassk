require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  const { data, error } = await supabase
    .from('hosting_plans')
    .insert([
      { plan_name: 'Starter', storage_gb: 10, bandwidth_gb: 100, price_monthly: 5.00, is_active: true },
      { plan_name: 'Business', storage_gb: 50, bandwidth_gb: 500, price_monthly: 15.00, is_active: true },
      { plan_name: 'Enterprise', storage_gb: 200, bandwidth_gb: 2000, price_monthly: 45.00, is_active: true }
    ]);
  console.log(error || 'Success inserted plans');
}
run();
