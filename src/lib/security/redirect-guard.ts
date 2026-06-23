/**
 * Open-redirect guard — validates redirect paths to prevent
 * attackers from redirecting users to malicious sites after login.
 *
 * Defense-in-depth (C2): only allow same-origin relative paths.
 */

const DEFAULT_REDIRECT = '/dashboard'

/**
 * Validates and sanitizes a redirect path.
 * Returns the path if safe, or the default redirect if not.
 *
 * Safe paths:
 * - Start with '/'
 * - Do NOT start with '//' (protocol-relative URL)
 * - Do NOT contain '://' (absolute URL)
 * - Do NOT contain backslashes (Windows path traversal)
 */
export function sanitizeRedirectPath(
  next: string | null | undefined,
  fallback: string = DEFAULT_REDIRECT
): string {
  if (!next || typeof next !== 'string') return fallback

  // Must start with /
  if (!next.startsWith('/')) return fallback

  // Block protocol-relative URLs (//evil.com)
  if (next.startsWith('//')) return fallback

  // Block absolute URLs (https://evil.com)
  if (next.includes('://')) return fallback

  // Block backslash paths (Windows path traversal)
  if (next.includes('\\')) return fallback

  // Block null bytes
  if (next.includes('\0')) return fallback

  return next
}
