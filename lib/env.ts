/**
 * Validated environment variables — server-only.
 */
import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

function parseEnv() {
  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    const missing = result.error.issues
      .map((i) => `  ${i.path.join('.')}: ${i.message}`)
      .join('\n')
    throw new Error(`Missing / invalid environment variables:\n${missing}`)
  }
  return result.data
}

const globalForEnv = globalThis as unknown as { _env?: ReturnType<typeof parseEnv> }
export const env = globalForEnv._env ?? (globalForEnv._env = parseEnv())
