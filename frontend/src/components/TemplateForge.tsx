// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import { SEVERITIES, COMMON_TAGS, STARTER_TEMPLATES, GF_STARTERS } from '../data/forgeData'
import { generateYAML, generateGF, validateTemplate, defaultRequest, defaultState } from './forge/yamlGen'
import { RegexPanel, Section, Inp, Sel, Btn, Label } from './forge/ForgeComponents'
import RequestBuilder from './forge/RequestBuilder'

const neon = 'var(--neon)'
const dim  = 'var(--neon-dim)'

// ── Sandbox: test matchers against pasted response ────────────────────────────
function Sandbox({ state }) {
  const [response, setResponse] = useState('')
  const [results, setResults] = useState([])

  const test = () => {
    const out = []
    state.requests.forEach((req, ri) => {
      req.matchers?.forEach((m, mi) => {
        if (m.type === 'word') {
          const words = m.words?.filter(Boolean) || []
          const part = response
          const matched = m.condition === 'and'
            ? words.every(w => part.toLowerCase().includes(w.toLowerCase()))
            : words.some(w => part.toLowerCase().includes(w.toLowerCase()))
          out.push({ label: `Req${ri+1} Matcher${mi+1} [word]`, matched, detail: words.join(', ') })
        }
        if (m.type === 'regex') {
          const patterns = m.regex?.filter(Boolean) || []
          const part = response
          let matched = false
          let errMsg = null
          for (const p of patterns) {
            try {
              if (new RegExp(p, 'i').test(part)) { matched = true; break }
            } catch (err) {
              errMsg = `invalid regex: ${err.message}`
              break
            }
          }
          out.push({ label: `Req${ri+1} Matcher${mi+1} [regex]`, matched: errMsg ? null : matched, detail: errMsg || patterns.join(' | ') })
        }
        if (m.type === 'status') {
          out.push({ label: `Req${ri+1} Matcher${mi+1} [status]`, matched: null, detail: `codes: ${m.status?.join(',')} — paste full response with status line to test` })
        }
      })
      req.extractors?.forEach((e, ei) => {
        if (e.type === 'regex') {
          const patterns = e.regex?.filter(Boolean) || []
          const matches = []
          let errMsg = null
          for (const p of patterns) {
            try {
              const m2 = response.match(new RegExp(p, 'gi'))
              if (m2) matches.push(...m2.slice(0, 3))
            } catch (err) {
              errMsg = `invalid regex: ${err.message}`
              break
            }
          }
          out.push({ label: `Req${ri+1} Extractor${ei+1} [regex:${e.name||'unnamed'}]`, matched: errMsg ? null : matches.length > 0, detail: errMsg || (matches.length ? `extracted: ${matches.join(', ')}` : 'no match') })
        }
      })
    })
    setResults(out)
  }

  return (
    <div>
      <div style={{ marginBottom: '0.5rem' }}>
        <Label>PASTE RESPONSE BODY / HEADERS TO TEST AGAINST</Label>
        <textarea value={response} onChange={e => setResponse(e.target.value)}
          placeholder="Paste HTTP response here..."
          style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: neon,
            fontFamily: 'inherit', fontSize: '0.68rem', padding: '0.5rem', outline: 'none',
            resize: 'vertical', minHeight: '120px' }} />
      </div>
      <Btn onClick={test} variant="primary" style={{ marginBottom: '0.75rem' }}>▶ RUN TESTS</Btn>
      {results.map((r, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.35rem 0.5rem', marginBottom: '0.25rem',
          background: '#050505', border: `1px solid ${r.matched === true ? '#1a3a1a' : r.matched === false ? '#3a1a1a' : '#1a1a1a'}` }}>
          <span style={{ color: r.matched === true ? neon : r.matched === false ? 'var(--red)' : '#888', fontSize: '0.65rem', flexShrink: 0 }}>
            {r.matched === true ? '✓' : r.matched === false ? '✗' : '?'}
          </span>
          <span style={{ fontSize: '0.65rem', color: '#aaa', flexShrink: 0 }}>{r.label}</span>
          <span style={{ fontSize: '0.62rem', color: '#666' }}>{r.detail}</span>
        </div>
      ))}
      {!results.length && <div style={{ fontSize: '0.65rem', color: '#555' }}>paste a response and click RUN TESTS</div>}
    </div>
  )
}

// ── GF Builder ────────────────────────────────────────────────────────────────
function GFBuilder({ gf, onChange, onRegexInsert }) {
  const update = (k, v) => onChange({ ...gf, [k]: v })
  const updateList = (k, i, v) => { const a = [...(gf[k] || [])]; a[i] = v; update(k, a) }
  const addToList = (k) => update(k, [...(gf[k] || []), ''])
  const removeFromList = (k, i) => update(k, (gf[k] || []).filter((_, j) => j !== i))

  return (
    <div>
      <Section title="GF PATTERN CONFIG">
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
          <div style={{ flex: 1 }}>
            <Label hint="grep flags passed to the gf tool. -H = show filename, -i = case-insensitive, -E = extended regex. Keep -HiE for most cases.">GREP FLAGS</Label>
            <Inp value={gf.flags || '-HiE'} onChange={v => update('flags', v)} placeholder="-HiE" />
          </div>
        </div>
        <Label hint="Regex patterns gf will grep for. Click ⚡ to pick from the regex library instead of typing manually.">REGEX PATTERNS</Label>
        {(gf.patterns || ['']).map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
            <Inp value={p} onChange={v => updateList('patterns', i, v)} placeholder="(api_key|apikey)\\s*=  — or click ⚡ to pick from library" />
            <Btn onClick={() => onRegexInsert(v => updateList('patterns', i, v))}
              style={{ padding: '2px 8px', fontSize: '0.6rem', flexShrink: 0, borderColor: 'var(--neon-dim)', color: 'var(--neon-dim)' }}
              title="Open regex library to pick a pattern">⚡</Btn>
            <Btn onClick={() => removeFromList('patterns', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
          </div>
        ))}
        <Btn onClick={() => addToList('patterns')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD PATTERN</Btn>
      </Section>

      <Section title="FILE EXTENSIONS" defaultOpen={false}>
        {(gf.extensions || []).map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
            <Inp value={e} onChange={v => updateList('extensions', i, v)} placeholder=".php" />
            <Btn onClick={() => removeFromList('extensions', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
          </div>
        ))}
        <Btn onClick={() => addToList('extensions')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD EXTENSION</Btn>
      </Section>

      <Section title="EXCLUDE PATTERNS" defaultOpen={false}>
        {(gf.exclude || []).map((e, i) => (
          <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
            <Inp value={e} onChange={v => updateList('exclude', i, v)} placeholder="node_modules" />
            <Btn onClick={() => removeFromList('exclude', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
          </div>
        ))}
        <Btn onClick={() => addToList('exclude')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD EXCLUDE</Btn>
      </Section>

      <div style={{ marginTop: '0.75rem' }}>
        <Label>GF STARTERS</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
          {GF_STARTERS.map(s => {
            const sevColor = { critical: 'var(--red)', high: '#ff6600', medium: '#ff9900', low: '#00ccff', info: '#aaa' }
            return (
              <div key={s.name} style={{ position: 'relative', display: 'inline-block' }}>
                <Btn onClick={() => onChange({ flags: '-HiE', patterns: [...s.patterns], extensions: [...(s.extensions||[])], exclude: [] })}
                  style={{ fontSize: '0.55rem', borderColor: sevColor[s.severity] || '#1a1a1a', color: sevColor[s.severity] || '#888' }}
                  title={`${s.desc}\nFP risk: ${s.fp}`}>{s.name}</Btn>
              </div>
            )
          })}
        </div>
        <div style={{ fontSize: '0.55rem', color: '#555', marginTop: '0.4rem', lineHeight: 1.5 }}>
          Color = severity. Hover for description and false-positive risk.
        </div>
      </div>
    </div>
  )
}

// ── Usage Guide Panel ─────────────────────────────────────────────────────────
const USAGE_GUIDE = [
  {
    vuln: 'SQL Injection (Error-Based)',
    icon: '💉',
    steps: [
      'Set METHOD to GET, PATH to {{BaseURL}}/?id=1\'',
      'Add a word matcher on BODY with condition OR',
      'Add words: "you have an error in your sql syntax", "warning: mysql_", "ORA-", "syntax error"',
      'Add a status matcher: 200',
      'Set matchers-condition to AND',
    ],
    tip: 'Use the SQLi Error starter template as a base. Low false positives — these strings only appear on real SQL errors.',
    severity: 'high',
  },
  {
    vuln: 'XSS (Reflected — Body Context)',
    icon: '🔥',
    steps: [
      'Set METHOD to GET, PATH to {{BaseURL}}/?q=xsstest<script>alert(1)</script>',
      'Add a word matcher on BODY: "xsstest<script>alert(1)</script>" (condition: AND)',
      'Add a NEGATIVE word matcher on BODY: "&lt;script&gt;" — if the app encodes it, it\'s NOT vulnerable',
      'Add a status matcher: 200',
      'Set matchers-condition to AND',
    ],
    tip: 'The negative matcher is critical — it prevents false positives when the app HTML-encodes the payload. Always include it.',
    severity: 'medium',
  },
  {
    vuln: 'XSS (Reflected — Attribute Context)',
    icon: '🔥',
    steps: [
      'Identify that the param is reflected inside an HTML attribute (e.g. id="YOUR_INPUT")',
      'Use payload: xsstest%22%3E%3Ciframe+onload%3Dalert%281%29%3E (URL-encoded "><iframe onload=alert(1)>)',
      'Add a word matcher on BODY: "<iframe onload=alert(1)>" — this is what appears after the breakout',
      'Add a NEGATIVE word matcher: "&lt;iframe" — prevents FP when app encodes the payload',
      'Add a status matcher: 200',
    ],
    tip: 'The "> breaks out of the attribute. The iframe is then injected as raw HTML. Use the "XSS Reflected (Attribute Breakout)" starter template.',
    severity: 'medium',
  },
  {
    vuln: 'Open Redirect',
    icon: '↪',
    steps: [
      'Set METHOD to GET, enable FOLLOW REDIRECTS',
      'Add multiple paths: /?next=https://evil.com, /?redirect=https://evil.com, /?url=https://evil.com',
      'Add a word matcher on HEADER: "evil.com"',
      'Add a status matcher: 301,302,303,307,308',
      'Set matchers-condition to AND',
    ],
    tip: 'Match on the Location header, not the body. The redirect must point to your domain.',
    severity: 'medium',
  },
  {
    vuln: 'SSRF (Out-of-Band)',
    icon: '📡',
    steps: [
      'Set PATH to {{BaseURL}}/?url=https://{{interactsh-url}}',
      'Add a word matcher on interactsh_protocol: "dns" or "http"',
      'Run with nuclei -interact-server to catch callbacks',
    ],
    tip: 'Use interactsh for blind SSRF. If you get a DNS/HTTP ping back, the server is making outbound requests.',
    severity: 'high',
  },
  {
    vuln: 'Exposed .git / Source Code',
    icon: '📁',
    steps: [
      'Set METHOD to GET, PATH to {{BaseURL}}/.git/config',
      'Add a word matcher on BODY: "[core]"',
      'Add a status matcher: 200',
      'Set matchers-condition to AND',
    ],
    tip: 'Also try /.git/HEAD (should contain "ref: refs/heads/"), /.env, /config.php.bak',
    severity: 'medium',
  },
  {
    vuln: 'CORS Misconfiguration',
    icon: '🌐',
    steps: [
      'Set METHOD to GET, add header: Origin = https://evil.com',
      'Add a word matcher on HEADER: "Access-Control-Allow-Origin: https://evil.com"',
      'Add a status matcher: 200',
      'Set matchers-condition to AND',
    ],
    tip: 'If the server echoes back your Origin in the ACAO header, it\'s misconfigured. Also check for "Access-Control-Allow-Credentials: true".',
    severity: 'medium',
  },
  {
    vuln: 'Secrets / API Keys in Response',
    icon: '🔑',
    steps: [
      'Set METHOD to GET, PATH to {{BaseURL}} or a JS file path',
      'Add a regex matcher on BODY',
      'Click ⚡ and pick from Secrets & Keys category',
      'Add a status matcher: 200',
      'Set matchers-condition to AND',
    ],
    tip: 'Target .js files, /api/config, /env.js, /config.json. Use the regex library for AWS keys, GitHub tokens, JWT patterns.',
    severity: 'critical',
  },
  {
    vuln: 'Debug / Admin Panel Exposure',
    icon: '🐛',
    steps: [
      'Add multiple paths: /debug, /actuator/env, /phpinfo.php, /_debug, /admin',
      'Add a word matcher on BODY with OR condition',
      'Add words: "PHP Version", "spring.datasource", "phpinfo()", "DEBUG"',
      'Add a status matcher: 200',
    ],
    tip: 'Spring Boot actuator at /actuator/env leaks environment variables including DB passwords. Always check this on Java apps.',
    severity: 'medium',
  },
  {
    vuln: 'JWT None Algorithm',
    icon: '🔐',
    steps: [
      'Set METHOD to GET, PATH to an authenticated endpoint like /api/user',
      'Add header: Authorization = Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIn0.',
      'Add a status matcher: 200',
      'Add a negative word matcher on BODY: "unauthorized", "invalid token", "forbidden"',
      'Set matchers-condition to AND',
    ],
    tip: 'The base64 payload eyJhbGciOiJub25lIn0 decodes to {"alg":"none"}. If the server accepts it, JWT validation is broken.',
    severity: 'high',
  },
  {
    vuln: 'GF Pattern (Parameter Discovery)',
    icon: '🔍',
    steps: [
      'Switch to GF mode (top left)',
      'Pick a starter (sqli, ssrf, redirect, rce, ssti, idor, etc.)',
      'Export the JSON file',
      'Run: cat urls.txt | gf ssrf > ssrf-params.txt',
      'Feed results to nuclei or manual testing',
    ],
    tip: 'GF filters a list of URLs to only those containing interesting parameters. Combine with waybackurls or gau to get a URL list first. Starters are color-coded by severity.',
    severity: 'info',
  },
  {
    vuln: 'LFI / Path Traversal',
    icon: '📂',
    steps: [
      'Add multiple paths with traversal sequences: /?file=../../../etc/passwd, /?page=../../../etc/passwd',
      'Add a regex matcher on BODY: "root:[x*]:0:0:" — confirms /etc/passwd content',
      'Add a second regex matcher for Windows: "\\[boot loader\\]" — confirms win.ini',
      'Set matchers-condition to OR (either Linux or Windows confirms the vuln)',
      'Add a status matcher: 200',
    ],
    tip: 'Use regex matchers, not word matchers — they confirm actual file content, not just a 200 response. Try multiple traversal depths (3-6 levels) and both encoded/unencoded variants.',
    severity: 'high',
  },
  {
    vuln: 'RCE / Command Injection',
    icon: '💀',
    steps: [
      'Add paths with injection chars: /?cmd=id, /?ping=127.0.0.1;id, /?ip=127.0.0.1|id',
      'Add a regex matcher on BODY: "uid=[0-9]+\\([a-z_]+\\)\\s+gid=[0-9]+" — confirms id command output',
      'Add a second regex for Windows: "Microsoft Windows \\[Version [0-9\\.]+\\]"',
      'Set matchers-condition to OR',
      'Add a status matcher: 200',
    ],
    tip: 'Never use generic words like "root" as matchers — too many false positives. The uid=0(root) gid=0(root) regex is specific enough to confirm real RCE. For blind RCE, use interactsh OOB.',
    severity: 'critical',
  },
  {
    vuln: 'SSTI (Template Injection)',
    icon: '🧨',
    steps: [
      'Add paths with math expressions: /?name={{7*7}}, /?q=${7*7}, /?input=#{7*7}',
      'Add a word matcher on BODY: "49" (condition: AND)',
      'Add a NEGATIVE word matcher: "{{7*7}}" — if the template engine did NOT evaluate it, it\'s not vulnerable',
      'Add a status matcher: 200',
      'Set matchers-condition to AND',
    ],
    tip: 'The negative matcher is essential — it prevents false positives when the app reflects the payload unprocessed. 7*7=49 is the universal SSTI probe. If you get 49 back, escalate to RCE with engine-specific payloads.',
    severity: 'critical',
  },
]

function UsageGuide() {
  const [active, setActive] = useState(null)
  const sev = { info: '#aaa', low: '#00ccff', medium: '#ff9900', high: '#ff6600', critical: 'var(--red)' }
  return (
    <div>
      <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.75rem', lineHeight: 1.6 }}>
        Click a vulnerability type to see step-by-step instructions on how to build the template for it.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
        {USAGE_GUIDE.map((g, i) => (
          <div key={i}>
            <button onClick={() => setActive(active === i ? null : i)}
              style={{ width: '100%', background: active === i ? '#0a0a0a' : 'none',
                border: `1px solid ${active === i ? sev[g.severity] : '#1a1a1a'}`,
                borderLeft: `3px solid ${sev[g.severity]}`,
                color: active === i ? '#fff' : '#aaa', fontFamily: 'inherit', fontSize: '0.7rem',
                padding: '0.45rem 0.75rem', textAlign: 'left', cursor: 'pointer',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>{g.icon} {g.vuln}</span>
              <span style={{ fontSize: '0.5rem', color: sev[g.severity], border: `1px solid ${sev[g.severity]}`, padding: '0 4px' }}>{g.severity}</span>
            </button>
            {active === i && (
              <div style={{ background: '#050505', border: '1px solid #1a1a1a', borderTop: 'none', padding: '0.75rem' }}>
                <div style={{ fontSize: '0.6rem', color: '#888', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>STEPS IN THE BUILDER:</div>
                <ol style={{ margin: 0, paddingLeft: '1.2rem' }}>
                  {g.steps.map((s, j) => (
                    <li key={j} style={{ fontSize: '0.68rem', color: '#ccc', marginBottom: '0.3rem', lineHeight: 1.5 }}>{s}</li>
                  ))}
                </ol>
                <div style={{ marginTop: '0.6rem', background: '#0a0500', border: '1px solid #2a1500',
                  borderLeft: '2px solid #ff9900', padding: '0.4rem 0.6rem',
                  fontSize: '0.65rem', color: '#bbb', lineHeight: 1.5 }}>
                  💡 {g.tip}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
// ── Curl → Nuclei converter ───────────────────────────────────────────────────
function parseCurl(raw) {
  try {
    // Normalize line continuations
    const cmd = raw.replace(/\\\n/g, ' ').replace(/\s+/g, ' ').trim()

    // Method: explicit -X flag, else POST if body present, else GET
    const methodMatch = cmd.match(/-X\s+([A-Z]+)/i)
    const hasBody = /--data(?:-raw|-urlencode|-binary)?|-d\s/.test(cmd)
    const method = methodMatch ? methodMatch[1].toUpperCase() : (hasBody ? 'POST' : 'GET')

    // URL: handle both `curl 'url'` and `curl -X POST 'url'`
    const urlMatch = cmd.match(/curl(?:\s+[^\s]+)*?\s+['"]?(https?:\/\/[^\s'"]+)['"]?/) ||
                     cmd.match(/['"]?(https?:\/\/[^\s'"]+)['"]?/)
    const url = urlMatch?.[1] || ''

    // Headers
    const headers = {}
    for (const m of cmd.matchAll(/-H\s+['"]([^'"]+)['"]/g)) {
      const idx = m[1].indexOf(': ')
      if (idx > 0) headers[m[1].slice(0, idx)] = m[1].slice(idx + 2)
    }

    // Body: --data-raw, --data, -d (strip outer quotes, unescape inner)
    const bodyMatch = cmd.match(/(?:--data-raw|--data-urlencode|--data-binary|--data|-d)\s+['"]([\s\S]*?)['"](?:\s|$)/)
    const body = bodyMatch ? bodyMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"') : ''

    // Path from URL
    let path = '{{BaseURL}}/'
    try { const u = new URL(url); path = `{{BaseURL}}${u.pathname}${u.search}` } catch {}

    return { method, path, headers, body, url }
  } catch { return null }
}

export default function TemplateForge() {
  const [state, setState] = useState(() => {
    try { const s = localStorage.getItem('forge-state'); return s ? JSON.parse(s) : defaultState() } catch { return defaultState() }
  })
  const [yaml, setYaml] = useState('')
  const [errors, setErrors] = useState([])
  const [regexTarget, setRegexTarget] = useState(null)
  const [showRegex, setShowRegex] = useState(false)
  const [activeTab, setActiveTab] = useState('builder')
  const [copied, setCopied] = useState(false)
  const [importText, setImportText] = useState('')
  const [showImport, setShowImport] = useState(false)
  const [curlInput, setCurlInput] = useState('')
  const [showCurl, setShowCurl] = useState(false)
  const [savedMsg, setSavedMsg] = useState(false)
  const debounceRef = useRef(null)

  const update = useCallback((path, value) => {
    setState(prev => {
      const next = { ...prev }
      const parts = path.split('.')
      let obj = next
      for (let i = 0; i < parts.length - 1; i++) {
        obj[parts[i]] = { ...obj[parts[i]] }
        obj = obj[parts[i]]
      }
      obj[parts[parts.length - 1]] = value
      return next
    })
  }, [])

  const updateMeta = (k, v) => setState(p => ({ ...p, meta: { ...p.meta, [k]: v } }))
  const updateGF = (v) => setState(p => ({ ...p, gf: v }))
  const updateRequest = (i, req) => setState(p => { const r = [...p.requests]; r[i] = req; return { ...p, requests: r } })
  const addRequest = () => setState(p => ({ ...p, requests: [...p.requests, defaultRequest()] }))
  const removeRequest = (i) => setState(p => ({ ...p, requests: p.requests.filter((_, j) => j !== i) }))

  // Regenerate YAML + autosave on state change (debounced)
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const out = state.mode === 'gf' ? generateGF(state) : generateYAML(state)
      setYaml(out)
      setErrors(validateTemplate(state))
      try { localStorage.setItem('forge-state', JSON.stringify(state)); setSavedMsg(true); setTimeout(() => setSavedMsg(false), 1200) } catch {}
    }, 300)
  }, [state])

  const importCurl = () => {
    const parsed = parseCurl(curlInput)
    if (!parsed) return
    setState(p => ({
      ...p,
      mode: 'nuclei',
      requests: [{
        ...p.requests[0],
        method: parsed.method,
        paths: [parsed.path],
        headers: parsed.headers,
        body: parsed.body,
      }]
    }))
    setShowCurl(false); setCurlInput(''); setActiveTab('builder')
  }

  const loadStarter = (tpl) => {
    const ds = defaultState()
    setState({
      mode: 'nuclei',
      meta: {
        id: tpl.id,
        name: tpl.name,
        author: 'anonymous',
        severity: tpl.severity,
        description: tpl.description || '',
        reference: [''],
        tags: tpl.tags || [],
        remediation: tpl.remediation || '',
        classification: { ...ds.meta.classification, ...(tpl.classification || {}) },
        metadata: { ...ds.meta.metadata, ...(tpl.metadata || {}) },
      },
      variables: tpl.variables || {},
      requests: tpl.requests.map(r => ({
        method: r.method || 'GET',
        paths: r.paths || ['{{BaseURL}}/'],
        headers: r.headers || {},
        body: r.body || '',
        redirects: r.redirects || false,
        maxRedirects: 10,
        attackMode: '',
        payloads: {},
        matchers: r.matchers || [],
        extractors: r.extractors || [],
        matchersCondition: r.matchersCondition || 'and',
      })),
      gf: ds.gf,
    })
    setActiveTab('builder')
  }

  const exportFile = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = filename
    a.click()
  }

  const copyYaml = () => {
    navigator.clipboard.writeText(yaml)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleRegexInsert = (callback) => {
    setRegexTarget(() => callback)
    setShowRegex(true)
  }

  const onRegexInsert = (pattern) => {
    if (regexTarget) regexTarget(pattern)
    setShowRegex(false)
    setRegexTarget(null)
  }

  const severityColor = { info: '#aaa', low: '#00ccff', medium: '#ff9900', high: '#ff6600', critical: 'var(--red)' }

  const nucleiTabs = [
    { id: 'builder', label: '🔧 BUILDER' },
    { id: 'preview', label: '📄 YAML PREVIEW' },
    { id: 'sandbox', label: '🧪 SANDBOX' },
    { id: 'guide',   label: '📖 HOW TO USE' },
  ]
  const gfTabs = [
    { id: 'builder', label: '🔧 GF BUILDER' },
    { id: 'preview', label: '📄 JSON PREVIEW' },
    { id: 'guide',   label: '📖 HOW TO USE' },
  ]
  const tabs = state.mode === 'gf' ? gfTabs : nucleiTabs

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 160px)', minHeight: '600px', gap: 0, overflow: 'hidden' }}>

      {/* ── LEFT: Starters + Meta ── */}
      <div style={{ width: '220px', flexShrink: 0, borderRight: '1px solid #111', overflowY: 'auto',
        background: 'rgba(5,5,5,0.97)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '0.5rem', borderBottom: '1px solid #111' }}>
          <div style={{ fontSize: '0.55rem', color: dim, letterSpacing: '0.2em', marginBottom: '0.5rem' }}>⚡ TEMPLATE FORGE</div>
          <div style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.5rem' }}>
            <Btn onClick={() => { setState(p => ({ ...p, mode: 'nuclei' })); setActiveTab('builder') }}
              style={{ flex: 1, fontSize: '0.55rem', borderColor: state.mode === 'nuclei' ? neon : '#1a1a1a', color: state.mode === 'nuclei' ? neon : '#666' }}>NUCLEI</Btn>
            <Btn onClick={() => { setState(p => ({ ...p, mode: 'gf' })); setActiveTab('builder') }}
              style={{ flex: 1, fontSize: '0.55rem', borderColor: state.mode === 'gf' ? neon : '#1a1a1a', color: state.mode === 'gf' ? neon : '#666' }}>GF</Btn>
          </div>
          <Btn onClick={() => setState(defaultState())} style={{ width: '100%', fontSize: '0.55rem', marginBottom: '0.3rem' }}>NEW TEMPLATE</Btn>

          {/* Nuclei-only controls */}
          {state.mode === 'nuclei' && (<>
            <Btn onClick={() => setShowImport(v => !v)} style={{ width: '100%', fontSize: '0.55rem', marginBottom: '0.3rem' }}>IMPORT YAML</Btn>
            <Btn onClick={() => setShowCurl(v => !v)} style={{ width: '100%', fontSize: '0.55rem', borderColor: showCurl ? dim : '#1a1a1a', color: showCurl ? dim : '#666' }}>⚡ CURL → NUCLEI</Btn>
            {showCurl && (
              <div style={{ marginTop: '0.4rem' }}>
                <div style={{ fontSize: '0.55rem', color: '#555', marginBottom: '0.3rem', lineHeight: 1.4 }}>
                  Paste a curl command — method, URL, headers and body will be auto-filled
                </div>
                <textarea value={curlInput} onChange={e => setCurlInput(e.target.value)}
                  placeholder={"curl -X POST 'https://target.com/api' \\\n  -H 'Content-Type: application/json' \\\n  -d '{\"user\":\"admin\"}'"}
                  style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: neon,
                    fontFamily: 'inherit', fontSize: '0.6rem', padding: '0.3rem', outline: 'none', resize: 'vertical', minHeight: '80px' }} />
                <Btn onClick={importCurl} variant="primary" style={{ width: '100%', fontSize: '0.55rem', marginTop: '0.2rem' }}>CONVERT</Btn>
              </div>
            )}
            {showImport && (
              <div style={{ marginTop: '0.4rem' }}>
                <textarea value={importText} onChange={e => setImportText(e.target.value)} placeholder="paste nuclei YAML..."
                  style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: neon,
                    fontFamily: 'inherit', fontSize: '0.6rem', padding: '0.3rem', outline: 'none', resize: 'vertical', minHeight: '80px' }} />
                <Btn onClick={() => { setYaml(importText); setShowImport(false) }} variant="primary" style={{ width: '100%', fontSize: '0.55rem', marginTop: '0.2rem' }}>LOAD</Btn>
              </div>
            )}
          </>)}
        </div>

        {/* Starters list — nuclei templates or GF starters depending on mode */}
        <div style={{ padding: '0.5rem', borderBottom: '1px solid #111' }}>
          {state.mode === 'nuclei' ? (<>
            <div style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>STARTER TEMPLATES</div>
            {STARTER_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => loadStarter(t)}
                style={{ width: '100%', background: 'none', border: 'none', borderLeft: '2px solid #1a1a1a',
                  color: '#888', fontFamily: 'inherit', fontSize: '0.62rem', padding: '0.3rem 0.5rem',
                  textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                  alignItems: 'center', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.color = neon; e.currentTarget.style.borderLeftColor = neon }}
                onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.borderLeftColor = '#1a1a1a' }}>
                <span>{t.name}</span>
                <span style={{ fontSize: '0.5rem', color: severityColor[t.severity] || '#aaa',
                  border: `1px solid ${severityColor[t.severity] || '#333'}`, padding: '0 3px' }}>{t.severity}</span>
              </button>
            ))}
          </>) : (<>
            <div style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.15em', marginBottom: '0.4rem' }}>GF STARTERS</div>
            {GF_STARTERS.map(s => {
              const sc = { critical: 'var(--red)', high: '#ff6600', medium: '#ff9900', low: '#00ccff', info: '#aaa' }
              return (
                <button key={s.name}
                  onClick={() => { setState(p => ({ ...p, meta: { ...p.meta, id: s.name }, gf: { flags: '-HiE', patterns: [...s.patterns], extensions: [...(s.extensions||[])], exclude: [] } })); setActiveTab('builder') }}
                  title={`${s.desc}\nFP risk: ${s.fp}`}
                  style={{ width: '100%', background: 'none', border: 'none', borderLeft: `2px solid ${sc[s.severity] || '#1a1a1a'}`,
                    color: '#888', fontFamily: 'inherit', fontSize: '0.62rem', padding: '0.3rem 0.5rem',
                    textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', transition: 'all 0.15s' }}
                  onMouseEnter={e => { e.currentTarget.style.color = sc[s.severity]; e.currentTarget.style.background = '#0a0a0a' }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#888'; e.currentTarget.style.background = 'none' }}>
                  <span>{s.name}</span>
                  <span style={{ fontSize: '0.5rem', color: sc[s.severity], border: `1px solid ${sc[s.severity]}`, padding: '0 3px' }}>{s.severity}</span>
                </button>
              )
            })}
            <div style={{ fontSize: '0.52rem', color: '#444', marginTop: '0.4rem', lineHeight: 1.4 }}>
              Hover for description + FP risk
            </div>
          </>)}
        </div>

        {/* Validation errors */}
        {errors.length > 0 && (
          <div style={{ padding: '0.5rem', borderBottom: '1px solid #111' }}>
            <div style={{ fontSize: '0.55rem', color: 'var(--red)', letterSpacing: '0.15em', marginBottom: '0.3rem' }}>⚠ VALIDATION</div>
            {errors.map((e, i) => (
              <div key={i} style={{ fontSize: '0.58rem', color: '#ff666688', marginBottom: '0.2rem', lineHeight: 1.3 }}>• {e.msg}</div>
            ))}
          </div>
        )}
        {errors.length === 0 && yaml && (
          <div style={{ padding: '0.5rem' }}>
            <div style={{ fontSize: '0.55rem', color: neon, letterSpacing: '0.1em' }}>✓ VALID</div>
          </div>
        )}
      </div>

      {/* ── CENTER: Builder / Preview / Sandbox ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #111', background: 'rgba(8,8,8,0.97)', flexShrink: 0 }}>
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              style={{ background: 'none', border: 'none', borderBottom: `2px solid ${activeTab === t.id ? neon : 'transparent'}`,
                color: activeTab === t.id ? neon : '#777', fontFamily: 'inherit', fontSize: '0.62rem',
                padding: '0.45rem 0.85rem', cursor: 'pointer', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>
              {t.label}
            </button>
          ))}
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: '0.3rem', padding: '0.3rem 0.5rem', alignItems: 'center' }}>
            {savedMsg && <span style={{ fontSize: '0.52rem', color: '#444', letterSpacing: '0.1em' }}>● SAVED</span>}
            <Btn onClick={copyYaml} variant="primary" style={{ fontSize: '0.55rem' }}>{copied ? '✓ COPIED' : 'COPY'}</Btn>
            <Btn onClick={() => exportFile(yaml, state.mode === 'gf' ? `${state.meta.id || 'template'}.json` : `${state.meta.id || 'template'}.yaml`)}
              style={{ fontSize: '0.55rem' }}>EXPORT</Btn>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>

          {/* ── BUILDER TAB ── */}
          {activeTab === 'builder' && (
            <div>
              {/* GF mode: only needs a name for the export filename */}
              {state.mode === 'gf' && (
                <Section title="GF PATTERN CONFIG">
                  <div style={{ marginBottom: '0.5rem' }}>
                    <Label hint="Used as the filename when you export (e.g. 'sqli' → sqli.json). Lowercase, no spaces.">PATTERN NAME (export filename)</Label>
                    <Inp value={state.meta.id} onChange={v => updateMeta('id', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="e.g. sqli" />
                  </div>
                  <GFBuilder gf={state.gf} onChange={updateGF} onRegexInsert={handleRegexInsert} />
                </Section>
              )}

              {/* Nuclei mode: full metadata + sections */}
              {state.mode === 'nuclei' && (<>
              <Section title="TEMPLATE METADATA">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <div>
                    <Label hint="Unique ID. Lowercase, numbers, hyphens only. This is the filename when you export.">TEMPLATE ID *</Label>
                    <Inp value={state.meta.id} onChange={v => updateMeta('id', v.toLowerCase().replace(/[^a-z0-9-]/g, '-'))} placeholder="e.g. git-config-exposure" />
                  </div>
                  <div>
                    <Label hint="Your hacker handle. Example: 0xmous">AUTHOR *</Label>
                    <Inp value={state.meta.author} onChange={v => updateMeta('author', v)} placeholder="e.g. 0xmous" />
                  </div>
                  <div>
                    <Label hint="Human-readable name. Example: Git Config File Exposure">NAME *</Label>
                    <Inp value={state.meta.name} onChange={v => updateMeta('name', v)} placeholder="e.g. Git Config File Exposure" />
                  </div>
                  <div>
                    <Label hint="info / low / medium / high / critical">SEVERITY *</Label>
                    <Sel value={state.meta.severity} onChange={v => updateMeta('severity', v)} options={SEVERITIES} />
                  </div>
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <Label hint="One sentence explaining what this detects and why it matters.">DESCRIPTION</Label>
                  <Inp value={state.meta.description} onChange={v => updateMeta('description', v)} placeholder="e.g. Detects exposed .git/config files" />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <Label hint="Click tags to toggle. These appear in nuclei output and help filter results.">TAGS</Label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginBottom: '0.3rem' }}>
                    {COMMON_TAGS.map(t => {
                      const active = state.meta.tags.includes(t)
                      return (
                        <button key={t} onClick={() => updateMeta('tags', active ? state.meta.tags.filter(x => x !== t) : [...state.meta.tags, t])}
                          style={{ background: active ? '#0d1a0d' : 'none', border: `1px solid ${active ? dim : '#1a1a1a'}`,
                            color: active ? neon : '#555', fontFamily: 'inherit', fontSize: '0.52rem',
                            padding: '1px 5px', cursor: 'pointer' }}>{t}</button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <Label hint="Links to CVE pages, writeups, or documentation.">REFERENCES</Label>
                  {state.meta.reference.map((r, i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <Inp value={r} onChange={v => { const a = [...state.meta.reference]; a[i] = v; updateMeta('reference', a) }} placeholder="https://..." />
                      <Btn onClick={() => updateMeta('reference', state.meta.reference.filter((_, j) => j !== i))} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
                    </div>
                  ))}
                  <Btn onClick={() => updateMeta('reference', [...state.meta.reference, ''])} style={{ fontSize: '0.55rem' }}>+ ADD REF</Btn>
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <Label hint="How to fix this vulnerability. Shown in nuclei output and reports.">REMEDIATION</Label>
                  <Inp value={state.meta.remediation || ''} onChange={v => updateMeta('remediation', v)} placeholder="e.g. Use parameterized queries" />
                </div>
              </Section>

                <Section title="CLASSIFICATION & METADATA" defaultOpen={false}>
                  <div style={{ fontSize: '0.58rem', color: '#666', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    Optional but recommended. CVE/CWE IDs and CVSS scores appear in nuclei output and reports.
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <Label hint="CVE identifier. Format: CVE-YYYY-NNNNN">CVE ID</Label>
                      <Inp value={state.meta.classification?.cveId || ''} onChange={v => updateMeta('classification', { ...state.meta.classification, cveId: v })} placeholder="CVE-2021-41773" />
                    </div>
                    <div>
                      <Label hint="CWE-79 (XSS), CWE-89 (SQLi), CWE-22 (LFI), CWE-918 (SSRF)">CWE ID</Label>
                      <Inp value={state.meta.classification?.cweId || ''} onChange={v => updateMeta('classification', { ...state.meta.classification, cweId: v })} placeholder="CWE-79" />
                    </div>
                    <div>
                      <Label hint="CVSS v3 score 0.0–10.0. Use cvss.js.org to calculate.">CVSS SCORE</Label>
                      <Inp value={state.meta.classification?.cvssScore || ''} onChange={v => updateMeta('classification', { ...state.meta.classification, cvssScore: v })} placeholder="6.1" />
                    </div>
                    <div>
                      <Label hint="Full CVSS v3 vector string.">CVSS METRICS</Label>
                      <Inp value={state.meta.classification?.cvssMetrics || ''} onChange={v => updateMeta('classification', { ...state.meta.classification, cvssMetrics: v })} placeholder="CVSS:3.1/AV:N/AC:L/PR:N/UI:R/S:C/C:L/I:L/A:N" />
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div>
                      <Label hint="Shodan query to find targets. Example: http.component:Apache Struts">SHODAN QUERY</Label>
                      <Inp value={state.meta.metadata?.shodanQuery || ''} onChange={v => updateMeta('metadata', { ...state.meta.metadata, shodanQuery: v })} placeholder='http.component:"Apache Struts"' />
                    </div>
                    <div>
                      <Label hint="FOFA query. Example: body=struts AND title=Apache">FOFA QUERY</Label>
                      <Inp value={state.meta.metadata?.fofaQuery || ''} onChange={v => updateMeta('metadata', { ...state.meta.metadata, fofaQuery: v })} placeholder='body="struts" && title="Apache"' />
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="checkbox" id="verified-chk"
                      checked={!!state.meta.metadata?.verified}
                      onChange={e => updateMeta('metadata', { ...state.meta.metadata, verified: e.target.checked })}
                      style={{ accentColor: 'var(--neon)' }} />
                    <label htmlFor="verified-chk" style={{ fontSize: '0.62rem', color: '#aaa', cursor: 'pointer' }}>
                      <span style={{ color: 'var(--neon)' }}>verified: true</span> — tested against a real vulnerable instance
                    </label>
                  </div>
                </Section>

                <Section title="VARIABLES" defaultOpen={false}>
                  <div style={{ fontSize: '0.58rem', color: '#666', marginBottom: '0.5rem', lineHeight: 1.5 }}>
                    Reusable values referenced as {'{{varname}}'} in paths, headers, and body.
                  </div>
                  {Object.entries(state.variables || {}).map(([k, v], i) => (
                    <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
                      <Inp value={k} onChange={nk => {
                        const vars = { ...state.variables }; delete vars[k]; vars[nk] = v
                        setState(p => ({ ...p, variables: vars }))
                      }} placeholder="name" style={{ flex: '0 0 120px' }} />
                      <Inp value={v} onChange={nv => setState(p => ({ ...p, variables: { ...p.variables, [k]: nv } }))} placeholder="value or {{rand_base(8)}}" />
                      <Btn onClick={() => { const vars = { ...state.variables }; delete vars[k]; setState(p => ({ ...p, variables: vars })) }}
                        variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
                    </div>
                  ))}
                  <Btn onClick={() => setState(p => ({ ...p, variables: { ...p.variables, '': '' } }))} style={{ fontSize: '0.55rem' }}>+ ADD VARIABLE</Btn>
                </Section>

                {state.requests.map((req, i) => (
                  <RequestBuilder key={i} req={req} reqIndex={i}
                    onChange={v => updateRequest(i, v)}
                    onRemove={() => removeRequest(i)}
                    onRegexInsert={handleRegexInsert} />
                ))}
                <Btn onClick={addRequest} variant="primary" style={{ width: '100%', marginTop: '0.5rem' }}>+ ADD REQUEST</Btn>
              </>)}
            </div>
          )}

          {/* ── YAML / JSON PREVIEW TAB ── */}
          {activeTab === 'preview' && (
            <div>
              <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.5rem', letterSpacing: '0.1em' }}>
                {state.mode === 'gf' ? 'GF JSON OUTPUT' : 'NUCLEI YAML OUTPUT'} — {errors.length ? `${errors.length} error(s)` : '✓ valid'}
              </div>
              <pre style={{ background: '#030303', border: '1px solid #1a1a1a', borderLeft: `2px solid ${errors.length ? 'var(--red)' : neon}`,
                color: neon, fontFamily: 'inherit', fontSize: '0.72rem', padding: '1rem',
                overflowX: 'auto', whiteSpace: 'pre', lineHeight: 1.6, margin: 0 }}>
                {yaml || (state.mode === 'gf' ? '// fill in the GF builder to generate output' : '# fill in the builder to generate output')}
              </pre>
            </div>
          )}

          {/* ── SANDBOX TAB (nuclei only) ── */}
          {activeTab === 'sandbox' && state.mode === 'nuclei' && (
            <div>
              <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.75rem', letterSpacing: '0.1em' }}>
                TEST YOUR MATCHERS & EXTRACTORS AGAINST A REAL RESPONSE
              </div>
              <Sandbox state={state} />
            </div>
          )}

          {/* ── GUIDE TAB ── */}
          {activeTab === 'guide' && <UsageGuide />}

        </div>
      </div>

      {/* ── RIGHT: Regex Intelligence Panel ── */}
      <div style={{ width: showRegex ? '280px' : '36px', flexShrink: 0, borderLeft: '1px solid #111',
        background: 'rgba(5,5,5,0.97)', transition: 'width 0.2s', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        <button onClick={() => setShowRegex(v => !v)}
          style={{ background: 'none', border: 'none', borderBottom: '1px solid #111', color: showRegex ? neon : '#555',
            fontFamily: 'inherit', fontSize: '0.6rem', padding: '0.5rem', cursor: 'pointer',
            writingMode: showRegex ? 'horizontal-tb' : 'vertical-rl', whiteSpace: 'nowrap',
            letterSpacing: '0.1em', flexShrink: 0, textAlign: 'center' }}>
          {showRegex ? '✕ CLOSE' : '⚡'}
        </button>
        {showRegex && (
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <RegexPanel onInsert={onRegexInsert} />
          </div>
        )}
      </div>

    </div>
  )
}
