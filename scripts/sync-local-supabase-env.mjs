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
  ],
  { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] },
)

const values = new Map(
  [...statusOutput.matchAll(/^([A-Z_]+)="([^"]*)"$/gm)].map(([, name, value]) => [name, value]),
)

const supabaseUrl = values.get('SUPABASE_URL') ?? values.get('API_URL')
const anonymousKey = values.get('SUPABASE_ANON_KEY') ?? values.get('ANON_KEY')

if (!supabaseUrl || !anonymousKey) {
  throw new Error('Supabase CLI did not return an API URL and anonymous key.')
}

writeFileSync(
  new URL('../apps/api/.dev.vars', import.meta.url),
  `SUPABASE_URL=${supabaseUrl}\nSUPABASE_ANON_KEY=${anonymousKey}\n`,
  { mode: 0o600 },
)

process.stdout.write('Local Worker credentials synchronized from Supabase CLI.\n')
