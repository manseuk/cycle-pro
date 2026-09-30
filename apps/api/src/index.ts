import { Hono } from 'hono'
import { cors } from 'hono/cors'

type Bindings = {
  FRONTEND_ORIGIN?: string
}

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

app.get('/healthz', (context) =>
  context.json({ status: 'ok' as const }),
)

app.notFound((context) =>
  context.json({ error: 'Not found' }, 404),
)

export default app
