import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { isLikelyDuplicate } from './duplicates'

type Bindings = {
  FRONTEND_ORIGIN?: string
  SUPABASE_URL?: string
  SUPABASE_ANON_KEY?: string
  SUPABASE_SERVICE_ROLE_KEY?: string
}

type SupabaseStatus = 'connected' | 'not-configured' | 'unavailable'
type ImportedRide = {
  activity_name: string
  started_at: string
  duration_seconds: number | null
  elapsed_seconds: number | null
  total_distance_meters: number | null
  total_ascent_meters: number | null
  average_power_watts: number | null
  max_power_watts: number | null
  average_heart_rate: number | null
  max_heart_rate: number | null
  average_cadence: number | null
}

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

async function getAuthenticatedCyclistId(supabaseUrl: string, anonKey: string, accessToken: string) {
  const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: anonKey, authorization: `Bearer ${accessToken}` },
  })
  if (!userResponse.ok) return null
  const user: unknown = await userResponse.json()
  return typeof user === 'object' && user !== null && 'id' in user && typeof user.id === 'string'
    ? user.id
    : null
}

/** Reads at most maxBytes of the body, whatever content-length claims; null when the body is larger. */
async function readLimitedText(request: Request, maxBytes: number) {
  if (Number(request.headers.get('content-length') ?? 0) > maxBytes) return null
  if (!request.body) return ''
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) { await reader.cancel(); return null }
    chunks.push(value)
  }
  const bytes = new Uint8Array(total)
  let offset = 0
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength }
  return new TextDecoder().decode(bytes)
}

function authenticatedRestHeaders(anonKey: string, accessToken: string) {
  return { apikey: anonKey, authorization: `Bearer ${accessToken}`, 'content-type': 'application/json' }
}

app.post('/rides/import', async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = context.env
  const accessToken = context.req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) return context.json({ error: 'Ride import is not configured.' }, 503)
  if (!accessToken) return context.json({ error: 'Sign in before importing rides.' }, 401)
  const baseUrl = SUPABASE_URL.replace(/\/$/, '')
  let cyclistId: string | null
  try {
    cyclistId = await getAuthenticatedCyclistId(baseUrl, SUPABASE_ANON_KEY, accessToken)
  } catch {
    return context.json({ error: 'Could not verify your session. Please try again.' }, 502)
  }
  if (!cyclistId) return context.json({ error: 'Your session is no longer valid.' }, 401)

  const bodyText = await readLimitedText(context.req.raw, 64 * 1024)
  if (bodyText === null) return context.json({ error: 'The parsed ride data is too large.' }, 413)

  let body: unknown
  try { body = JSON.parse(bodyText) } catch {
    return context.json({ error: 'The parsed ride data could not be read.' }, 400)
  }
  if (typeof body !== 'object' || body === null) {
    return context.json({ error: 'The parsed ride data is incomplete.' }, 400)
  }
  const importPayload = body as Record<string, unknown>
  const candidate = importPayload.ride
  if (typeof importPayload.file_sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(importPayload.file_sha256)
    || typeof candidate !== 'object' || candidate === null
    || typeof (candidate as Record<string, unknown>).activity_name !== 'string'
    || ((candidate as Record<string, unknown>).activity_name as string).length < 1 || ((candidate as Record<string, unknown>).activity_name as string).length > 120
    || typeof (candidate as Record<string, unknown>).started_at !== 'string'
    || !Number.isFinite(Date.parse((candidate as Record<string, unknown>).started_at as string))) {
    return context.json({ error: 'The parsed ride data is invalid.' }, 400)
  }
  const candidateRecord = candidate as Record<string, unknown>
  // Mirrors the rides table: zeroForMissing columns require > 0, so a recorded 0 (e.g. indoor distance) is stored as missing.
  const metricLimits = {
    duration_seconds: { max: 2_147_483_647, integer: true, zeroForMissing: true },
    elapsed_seconds: { max: 2_147_483_647, integer: true, zeroForMissing: true },
    total_distance_meters: { max: 9_999_999_999.99, integer: false, zeroForMissing: true },
    total_ascent_meters: { max: 2_147_483_647, integer: true, zeroForMissing: false },
    average_power_watts: { max: 32_767, integer: true, zeroForMissing: false },
    max_power_watts: { max: 32_767, integer: true, zeroForMissing: false },
    average_heart_rate: { max: 32_767, integer: true, zeroForMissing: false },
    max_heart_rate: { max: 32_767, integer: true, zeroForMissing: false },
    average_cadence: { max: 32_767, integer: true, zeroForMissing: false },
  } as const
  for (const [name, limit] of Object.entries(metricLimits)) {
    const value = candidateRecord[name]
    if (!(name in candidateRecord) || (value !== null && (typeof value !== 'number' || !Number.isFinite(value) || value < 0))) {
      return context.json({ error: 'The parsed ride data is invalid.' }, 400)
    }
    if (value === null) continue
    if (value > limit.max || (limit.integer && !Number.isInteger(value))) {
      return context.json({ error: `The ride's ${name.replaceAll('_', ' ')} value is outside the supported range.` }, 400)
    }
    if (value === 0 && limit.zeroForMissing) candidateRecord[name] = null
  }
  if (candidateRecord.duration_seconds === null && candidateRecord.total_distance_meters === null
    && candidateRecord.average_power_watts === null && candidateRecord.average_heart_rate === null) {
    return context.json({ error: 'This FIT file has no usable ride duration, distance, or sensor measurements.' }, 400)
  }
  const importedRide = candidateRecord as unknown as ImportedRide
  const fileHash = importPayload.file_sha256
  const headers = authenticatedRestHeaders(SUPABASE_ANON_KEY, accessToken)
  const exactDuplicateUrl = new URL(`${baseUrl}/rest/v1/rides`)
  exactDuplicateUrl.search = new URLSearchParams({
    select: 'id,activity_name',
    cyclist_id: `eq.${cyclistId}`,
    file_sha256: `eq.${fileHash}`,
    limit: '1',
  }).toString()

  try {
    const duplicateResponse = await fetch(exactDuplicateUrl, { headers })
    if (!duplicateResponse.ok) return context.json({ error: 'Could not check for duplicate rides.' }, 502)
    const [existingRide] = await duplicateResponse.json() as Array<{ id: string; activity_name: string }>
    if (existingRide) return context.json({ status: 'duplicate' as const, ride: existingRide })
  } catch {
    return context.json({ error: 'Could not check for duplicate rides.' }, 502)
  }

  const nearbyRidesUrl = new URL(`${baseUrl}/rest/v1/rides`)
  const startedAt = Date.parse(importedRide.started_at)
  nearbyRidesUrl.search = new URLSearchParams({
    select: 'id,started_at,duration_seconds,total_distance_meters',
    cyclist_id: `eq.${cyclistId}`,
    and: `(started_at.gte.${new Date(startedAt - 2 * 60 * 1000).toISOString()},started_at.lte.${new Date(startedAt + 2 * 60 * 1000).toISOString()})`,
    order: 'started_at.desc',
    limit: '20',
  }).toString()

  let likelyDuplicate: { id: string } | undefined
  try {
    const nearbyResponse = await fetch(nearbyRidesUrl, { headers })
    if (!nearbyResponse.ok) return context.json({ error: 'Could not check for similar rides.' }, 502)
    const nearbyRides = await nearbyResponse.json() as Array<{
      id: string
      started_at: string
      duration_seconds: number | null
      total_distance_meters: number | null
    }>
    likelyDuplicate = nearbyRides.find((previousRide) => isLikelyDuplicate(importedRide, previousRide))
  } catch {
    return context.json({ error: 'Could not check for similar rides.' }, 502)
  }

  const rideToInsert = {
    activity_name: importedRide.activity_name,
    started_at: importedRide.started_at,
    duration_seconds: importedRide.duration_seconds,
    elapsed_seconds: importedRide.elapsed_seconds,
    total_distance_meters: importedRide.total_distance_meters,
    total_ascent_meters: importedRide.total_ascent_meters,
    average_power_watts: importedRide.average_power_watts,
    max_power_watts: importedRide.max_power_watts,
    average_heart_rate: importedRide.average_heart_rate,
    max_heart_rate: importedRide.max_heart_rate,
    average_cadence: importedRide.average_cadence,
    cyclist_id: cyclistId,
    file_sha256: fileHash,
    is_likely_duplicate: Boolean(likelyDuplicate),
    possible_duplicate_of: likelyDuplicate?.id ?? null,
  }
  let saveResponse: Response
  try {
    saveResponse = await fetch(`${baseUrl}/rest/v1/rides`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_SERVICE_ROLE_KEY,
        authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        'content-type': 'application/json',
        prefer: 'return=representation',
      },
      body: JSON.stringify(rideToInsert),
    })
  } catch {
    return context.json({ error: 'Could not save this Ride. Please try again.' }, 502)
  }
  if (!saveResponse.ok) {
    if (saveResponse.status === 409) return context.json({ error: 'This Ride was imported in another request. Refresh your ride list.' }, 409)
    return context.json({ error: 'Could not save this Ride. Please try again.' }, 502)
  }
  const [savedRide] = await saveResponse.json() as Array<Record<string, unknown>>
  return context.json({
    status: 'imported' as const,
    ride: savedRide,
    likelyDuplicate: Boolean(likelyDuplicate),
  }, 201)
})

app.post('/auth/delete-account', async (context) => {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = context.env
  const accessToken = context.req.header('authorization')?.match(/^Bearer\s+(.+)$/i)?.[1]

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
    return context.json({ error: 'Account deletion is not configured.' }, 503)
  }
  if (!accessToken) return context.json({ error: 'Sign in to delete your account.' }, 401)

  const supabaseUrl = SUPABASE_URL.replace(/\/$/, '')
  let cyclistId: string | null
  try {
    cyclistId = await getAuthenticatedCyclistId(supabaseUrl, SUPABASE_ANON_KEY, accessToken)
  } catch {
    return context.json({ error: 'Could not verify your session. Please try again.' }, 502)
  }
  if (!cyclistId) return context.json({ error: 'Your session is no longer valid.' }, 401)

  let deletionResponse: Response
  try {
    deletionResponse = await fetch(`${supabaseUrl}/auth/v1/admin/users/${encodeURIComponent(cyclistId)}`, {
      method: 'DELETE',
      headers: { apikey: SUPABASE_SERVICE_ROLE_KEY, authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}` },
    })
  } catch {
    return context.json({ error: 'Account deletion failed. Please try again.' }, 502)
  }
  if (!deletionResponse.ok) return context.json({ error: 'Account deletion failed. Please try again.' }, 502)
  return context.body(null, 204)
})

app.notFound((context) =>
  context.json({ error: 'Not found' }, 404),
)

export default app
