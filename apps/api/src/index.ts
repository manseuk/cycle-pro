import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  FRONTEND_ORIGIN?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

type SupabaseStatus = 'connected' | 'not-configured' | 'unavailable'

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '*',
  cors({
    origin: (origin, context) => {
      const allowedOrigin = context.env.FRONTEND_ORIGIN
      return origin && origin === allowedOrigin ? origin : ''
    },
  }),
)

app.options('*', (context) => context.body(null, 204))

app.get('/healthz', async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = context.env
  let supabase: SupabaseStatus = 'not-configured'

  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    try {
      const response = await fetch(
        `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/health`,
        {
          headers: { apikey: SUPABASE_ANON_KEY },
          signal: AbortSignal.timeout(3_000),
        },
      )
      supabase = response.ok ? 'connected' : 'unavailable'
    } catch {
      supabase = 'unavailable'
    }
  }

  return context.json({ status: 'ok' as const, dependencies: { supabase } })
})

app.post('/auth/delete-account', async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = context.env
  const accessToken = context.req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return context.json({ error: 'Account deletion is not configured.' }, 503)
  }
  if (!accessToken) return context.json({ error: 'Sign in to delete your account.' }, 401)

  const supabaseUrl = SUPABASE_URL.replace(/\/$/, '')
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: SUPABASE_ANON_KEY, authorization: `Bearer ${accessToken}` },
  })
  if (!userResponse.ok) return context.json({ error: 'Your session is no longer valid.' }, 401)

  const user: unknown = await userResponse.json()
  if (typeof user !== 'object' || user === null || !('id' in user) || typeof user.id !== 'string') {
    return context.json({ error: 'Could not verify the signed-in account.' }, 401)
  }

  const deletionResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(user.id)}`, {
    method: 'DELETE',
    headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
  })
  if (!deletionResponse.ok) return context.json({ error: 'Account deletion failed. Please try again.' }, 502)
  return context.body(null, 204)
})

app.notFound((context) =>
  context.json({ error: 'Not found' }, 404),
)

export default app
