/**
 * One-time script to create the admin user in Supabase.
 * Run once after setting up your Supabase project:
 *
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 * ADMIN_EMAIL, and ADMIN_PASSWORD in .env.local
 */

import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey || !email || !password) {
  console.error("Missing required env vars. Check your .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  console.error("Failed to create admin user:", error.message);
  process.exit(1);
}

console.log(`Admin user created: ${data.user.email} (${data.user.id})`);
console.log("You can now sign in at /admin/login");
