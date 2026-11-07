/**
 * Post-build: writes dist/_headers for Cloudflare Pages.
 *  - Content-Security-Policy with sha256 hashes of the inline scripts in index.html
 *  - long-lived immutable caching for content-hashed assets and fonts
 *  - revalidation for HTML and other un-hashed files
 */
import { createHash } from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const html = readFileSync('dist/index.html', 'utf8')
const hashes = [...html.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(
  ([, body]) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`,
)

const csp = [
  "default-src 'self'",
  `script-src 'self' ${hashes.join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
  "base-uri 'self'",
  "form-action 'self' mailto:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  'upgrade-insecure-requests',
].join('; ')

const headers = `/*
  Content-Security-Policy: ${csp}
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()
  Cross-Origin-Opener-Policy: same-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

/
  Cache-Control: public, max-age=0, must-revalidate

/index.html
  Cache-Control: public, max-age=0, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable

/fonts/*
  Cache-Control: public, max-age=31536000, immutable
  Access-Control-Allow-Origin: *

/images/*
  Cache-Control: public, max-age=2592000, stale-while-revalidate=86400

/og.png
  Cache-Control: public, max-age=604800

/favicon.svg
  Cache-Control: public, max-age=604800

/*.png
  Cache-Control: public, max-age=604800

/site.webmanifest
  Content-Type: application/manifest+json
  Cache-Control: public, max-age=86400

/robots.txt
  Cache-Control: public, max-age=3600

/sitemap.xml
  Cache-Control: public, max-age=3600
`

writeFileSync('dist/_headers', headers)
console.log(`_headers written (${hashes.length} inline script hash${hashes.length === 1 ? '' : 'es'})`)
