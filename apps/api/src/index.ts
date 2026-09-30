import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  FRONTEND_ORIGIN?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
}

type SupabaseStatus = 'connected' | 'not-configured' | 'unavailable'

const app = new Hono<{ Bindings: Bindings }>()

app.use(
  '/healthz',
  cors({
    origin: (origin, context) => {
      const allowedOrigin = context.env.FRONTEND_ORIGIN
      return origin && origin === allowedOrigin ? origin : ''
    },
  }),
)

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

app.notFound((context) =>
  context.json({ error: 'Not found' }, 404),
)

export default app
