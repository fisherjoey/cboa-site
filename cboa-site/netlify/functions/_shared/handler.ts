/**
 * Shared Netlify Function handler
 *
 * Provides: Supabase admin client, CORS, Supabase Auth verification,
 * role-based access control, structured error handling, and logging.
 *
 * Usage:
 *   import { createHandler, supabase } from './_shared/handler'
 *
 *   export const handler = createHandler({
 *     name: 'announcements',
 *     auth: { GET: 'public', POST: 'admin', PUT: 'admin', DELETE: 'admin' },
 *     handler: async ({ event, supabase, logger, user }) => {
 *       // ... your logic, return { statusCode, body }
 *     }
 *   })
 */

import { Handler, HandlerEvent, HandlerContext as NetlifyContext } from '@netlify/functions'
import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Logger } from '../../../lib/logger'
import { SITE_URL } from '../../../lib/siteConfig'

// ---------------------------------------------------------------------------
// Shared Supabase admin client (service role — used by all functions)
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type UserRole = 'official' | 'executive' | 'admin' | 'evaluator' | 'mentor'

/**
 * Auth levels:
 *  - 'public'              — no auth required
 *  - 'authenticated'       — any logged-in user
 *  - 'admin'               — admin only
 *  - 'admin_or_executive'  — admin or executive
 *  - UserRole[]            — any of the listed roles
 */
export type AuthLevel = 'public' | 'authenticated' | 'admin' | 'admin_or_executive' | UserRole[]

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  raw: Record<string, any>
}

export interface RequestContext {
  event: HandlerEvent
  supabase: SupabaseClient
  logger: Logger
  user: AuthUser | null
}

export interface HandlerResponse {
  statusCode: number
  body: string
  headers?: Record<string, string>
}

export interface CreateHandlerOptions {
  /** Function name — used for logging */
  name: string

  /**
   * Auth requirement. Can be a single level for all methods,
   * or per-method: { GET: 'public', POST: 'admin', ... }
   * Defaults to 'admin' if omitted.
   */
  auth?: AuthLevel | Partial<Record<HttpMethod, AuthLevel>>

  /** Allowed HTTP methods. Defaults to ['GET','POST','PUT','DELETE'] */
  methods?: HttpMethod[]

  /** The actual function logic */
  handler: (ctx: RequestContext) => Promise<HandlerResponse>
}

// ---------------------------------------------------------------------------
// Role helpers (exported so functions can do fine-grained checks)
// ---------------------------------------------------------------------------

/** Extract the effective role from a Supabase user object */
export function getUserRole(user: Record<string, any>): UserRole {
  const appRole = user?.app_metadata?.role
  const userRole = user?.user_metadata?.role
  const appRoles: string[] = user?.app_metadata?.roles || []
  const userRoles: string[] = user?.user_metadata?.roles || []

  // Direct role field — app_metadata takes precedence
  const directRole = appRole || userRole
  if (directRole) {
    const normalized = directRole.toLowerCase()
    if (['admin', 'executive', 'evaluator', 'mentor', 'official'].includes(normalized)) {
      return normalized as UserRole
    }
  }

  // Check roles arrays (highest privilege wins)
  const allRoles = [...appRoles, ...userRoles].map(r => r.toLowerCase())
  if (allRoles.includes('admin')) return 'admin'
  if (allRoles.includes('executive')) return 'executive'
  if (allRoles.includes('evaluator')) return 'evaluator'
  if (allRoles.includes('mentor')) return 'mentor'

  return 'official'
}

/** Check whether a role satisfies a given auth level */
export function isAuthorized(role: UserRole, level: AuthLevel): boolean {
  if (level === 'public') return true
  if (level === 'authenticated') return true
  if (level === 'admin') return role === 'admin'
  if (level === 'admin_or_executive') return role === 'admin' || role === 'executive'
  if (Array.isArray(level)) return level.includes(role)
  return false
}

// ---------------------------------------------------------------------------
// CORS
// ---------------------------------------------------------------------------

const ALLOWED_ORIGINS: string[] = [
  SITE_URL,
  'http://localhost:3000',
  'http://localhost:8888',
  'http://localhost:9000',
].filter(Boolean) as string[]

/** Build CORS headers for a given request origin. Exported for functions that don't use createHandler. */
export function getCorsHeaders(requestOrigin: string | undefined, methods: string[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']): Record<string, string> {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': [...methods, 'OPTIONS'].join(', '),
    'Vary': 'Origin',
  }

  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    headers['Access-Control-Allow-Origin'] = requestOrigin
  }

  return headers
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function getAuthLevel(
  auth: CreateHandlerOptions['auth'],
  method: string
): AuthLevel {
  if (!auth) return 'admin'
  if (typeof auth === 'string' || Array.isArray(auth)) return auth
  return (auth as Record<string, AuthLevel>)[method] ?? 'admin'
}

// ---------------------------------------------------------------------------
// createHandler
// ---------------------------------------------------------------------------

export function createHandler(options: CreateHandlerOptions): Handler {
  const { name, auth, handler: handlerFn } = options
  const allowedMethods: HttpMethod[] = options.methods || ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']

  return async (event: HandlerEvent, _context: NetlifyContext) => {
    const logger = Logger.fromEvent(name, event)
    const origin = event.headers.origin || event.headers.Origin
    const corsHeaders = getCorsHeaders(origin, allowedMethods)

    // --- Preflight ---
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 204, headers: corsHeaders, body: '' }
    }

    // --- Method check ---
    if (!allowedMethods.includes(event.httpMethod as HttpMethod)) {
      return {
        statusCode: 405,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Method not allowed' })
      }
    }

    // --- Auth ---
    const authLevel = getAuthLevel(auth, event.httpMethod)
    let user: AuthUser | null = null

    if (authLevel !== 'public') {
      const authHeader = event.headers.authorization || event.headers.Authorization
      if (!authHeader?.startsWith('Bearer ')) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unauthorized' })
        }
      }

      const token = authHeader.replace('Bearer ', '')
      const { data: { user: authUser }, error: authError } = await supabase.auth.getUser(token)

      if (authError || !authUser) {
        return {
          statusCode: 401,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Unauthorized' })
        }
      }

      const role = getUserRole(authUser)
      user = {
        id: authUser.id,
        email: authUser.email || 'unknown',
        role,
        raw: authUser as unknown as Record<string, any>,
      }

      if (!isAuthorized(role, authLevel)) {
        return {
          statusCode: 403,
          headers: corsHeaders,
          body: JSON.stringify({ error: 'Forbidden' })
        }
      }
    }

    // --- Run handler ---
    try {
      const result = await handlerFn({ event, supabase, logger, user })

      return {
        ...result,
        headers: { ...corsHeaders, ...result.headers },
      }
    } catch (error) {
      logger.error(
        'api',
        `${name}_error`,
        `${name} API error`,
        error instanceof Error ? error : new Error(String(error))
      )
      return {
        statusCode: 500,
        headers: corsHeaders,
        body: JSON.stringify({ error: 'Internal server error' })
      }
    }
  }
}
