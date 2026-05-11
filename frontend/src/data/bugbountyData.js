import idor from './bb/idor.json'
import xss from './bb/xss.json'
import ssrf from './bb/ssrf.json'
import rce from './bb/rce.json'
import sqli from './bb/sqli.json'
import auth from './bb/auth.json'
import logic from './bb/logic.json'
import upload from './bb/upload.json'
import cors from './bb/cors.json'
import csrf from './bb/csrf.json'
import redirect from './bb/redirect.json'
import info from './bb/info.json'
import xxe from './bb/xxe.json'
import privesc from './bb/privesc.json'

export const BB_REPORTS = [
  ...idor, ...xss, ...ssrf, ...rce, ...sqli,
  ...auth, ...logic, ...upload, ...cors, ...csrf,
  ...redirect, ...info, ...xxe, ...privesc
]

export const BB_CATEGORIES = [
  'IDOR', 'XSS', 'SSRF', 'RCE', 'SQLi',
  'Auth Bypass', 'Business Logic', 'File Upload',
  'CORS', 'CSRF', 'Open Redirect', 'Info Disclosure',
  'XXE', 'Privilege Escalation'
]
