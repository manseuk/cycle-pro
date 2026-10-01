import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'

const statusOutput = execFileSync(
  'pnpm',
  [
    'exec',
    'supabase',
    'status',
    '--output',
    'env',
    '--override-name',
    'api.url=SUPABASE_URL',
    '--override-name',
    'anon_key=SUPABASE_ANON_KEY',
    '--override-name',
    'service_role_key=SUPABASE_SERVICE_ROLE_KEY',
  ],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
)

const values = new Map(
  [...statusOutput.matchAll(/^([A-Z_]+)="([^"]*)"$/gm)].map(([, name, value]) => [name, value]),
)

const supabaseUrl = values.get('SUPABASE_URL') ?? values.get('API_URL')
const anonymousKey = values.get('SUPABASE_ANON_KEY') ?? values.get('ANON_KEY')
const serviceRoleKey = values.get('SUPABASE_SERVICE_ROLE_KEY') ?? values.get('SERVICE_ROLE_KEY')

if (!supabaseUrl || !anonymousKey || !serviceRoleKey) {
  throw new Error('Supabase CLI did not return an API URL and required keys.')
}

writeFileSync(
  new URL('../apps/api/.dev.vars', import.meta.url),
  `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${anonymousKey}\nSUPABASE_SERVICE_ROLE_KEY=${serviceRoleKey}\n`,
  { mode: 0o600 },
)

writeFileSync(
  new URL('../apps/web/.env.local', import.meta.url),
  `VITE_SUPABASE_URL=${supabaseUrl}\nVITE_SUPABASE_ANON_KEY=${anonymousKey}\n`,
  { mode: 0o600 },
)

process.stdout.write('Local Worker credentials synchronized from Supabase CLI.\n')
