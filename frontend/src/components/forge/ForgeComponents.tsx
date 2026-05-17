// @ts-nocheck
import { useState, useEffect, useCallback, useRef } from 'react'
import {
  SEVERITIES, METHODS, MATCHER_TYPES, EXTRACTOR_TYPES, PARTS,
  ATTACK_MODES, COMMON_TAGS, STARTER_TEMPLATES, REGEX_LIBRARY, GF_STARTERS
} from '../../data/forgeData'
import {
  generateYAML, generateGF, validateTemplate,
  defaultRequest, defaultMatcher, defaultExtractor, defaultState
} from './yamlGen'

// ── tiny helpers ──────────────────────────────────────────────────────────────
const neon = 'var(--neon)'
const dim  = 'var(--neon-dim)'
const red  = 'var(--red)'

const Inp = ({ value, onChange, placeholder, style = {}, type = 'text' }) => (
  <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    style={{ background: '#030303', border: '1px solid #1a1a1a', color: neon, fontFamily: 'inherit',
      fontSize: '0.72rem', padding: '0.3rem 0.5rem', outline: 'none', width: '100%', ...style }} />
)

const Sel = ({ value, onChange, options, style = {} }) => (
  <select value={value} onChange={e => onChange(e.target.value)}
    style={{ background: '#030303', border: '1px solid #1a1a1a', color: neon, fontFamily: 'inherit',
      fontSize: '0.72rem', padding: '0.3rem 0.5rem', outline: 'none', ...style }}>
    {options.map(o => <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>)}
  </select>
)

const Btn = ({ onClick, children, style = {}, variant = 'default' }) => {
  const base = { background: 'none', border: `1px solid ${variant === 'danger' ? red : variant === 'primary' ? neon : '#2a2a2a'}`,
    color: variant === 'danger' ? red : variant === 'primary' ? neon : '#aaa',
    fontFamily: 'inherit', fontSize: '0.65rem', padding: '0.3rem 0.7rem', cursor: 'pointer',
    letterSpacing: '0.08em', transition: 'all 0.15s', ...style }
  return <button onClick={onClick} style={base}>{children}</button>
}

const Label = ({ children, hint }) => {
  const [show, setShow] = useState(false)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginBottom: '0.25rem', position: 'relative' }}>
      <span style={{ fontSize: '0.55rem', color: '#888', letterSpacing: '0.18em' }}>{children}</span>
      {hint && (
        <span onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
          style={{ fontSize: '0.6rem', color: '#333', cursor: 'help', userSelect: 'none',
            border: '1px solid #222', borderRadius: '50%', width: '13px', height: '13px',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>?</span>
      )}
      {hint && show && (
        <div style={{ position: 'absolute', top: '120%', left: 0, zIndex: 9999, background: '#0d0d0d',
          border: '1px solid #2a2a2a', borderLeft: '2px solid var(--neon-dim)', padding: '0.5rem 0.65rem',
          fontSize: '0.62rem', color: '#bbb', lineHeight: 1.6, width: '270px', pointerEvents: 'none',
          boxShadow: '0 4px 20px rgba(0,0,0,0.8)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div style={{ marginBottom: '0.75rem', border: '1px solid #111' }}>
      <button onClick={() => setOpen(o => !o)} style={{ width: '100%', background: '#0a0a0a', border: 'none',
        color: '#aaa', fontFamily: 'inherit', fontSize: '0.65rem', padding: '0.45rem 0.75rem',
        textAlign: 'left', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', letterSpacing: '0.1em' }}>
        {title} <span style={{ color: '#555' }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div style={{ padding: '0.75rem' }}>{children}</div>}
    </div>
  )
}

// ── Regex Intelligence Panel ──────────────────────────────────────────────────
function RegexPanel({ onInsert }) {
  const [cat, setCat] = useState(Object.keys(REGEX_LIBRARY)[0])
  const [search, setSearch] = useState('')
  const [copied, setCopied] = useState(null)

  const items = REGEX_LIBRARY[cat]?.filter(r =>
    !search || r.pattern.includes(search) || r.desc.toLowerCase().includes(search.toLowerCase())
  ) ?? []

  const copy = (pattern) => {
    navigator.clipboard.writeText(pattern)
    setCopied(pattern)
    setTimeout(() => setCopied(null), 1500)
  }

  const severityColor = { info: '#aaa', low: '#00ccff', medium: '#ff9900', high: '#ff6600', critical: '#ff3333' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ fontSize: '0.6rem', color: dim, letterSpacing: '0.2em', padding: '0.5rem 0.75rem',
        borderBottom: '1px solid #111', background: '#050505' }}>⚡ REGEX INTELLIGENCE</div>
      <div style={{ padding: '0.5rem' }}>
        <Inp value={search} onChange={setSearch} placeholder="search patterns..." />
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', padding: '0 0.5rem 0.5rem', borderBottom: '1px solid #111' }}>
        {Object.keys(REGEX_LIBRARY).map(k => (
          <button key={k} onClick={() => setCat(k)}
            style={{ background: cat === k ? '#0d1a0d' : 'none', border: `1px solid ${cat === k ? dim : '#1a1a1a'}`,
              color: cat === k ? neon : '#666', fontFamily: 'inherit', fontSize: '0.55rem',
              padding: '2px 6px', cursor: 'pointer' }}>{k}</button>
        ))}
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem' }}>
        {items.map(item => (
          <div key={item.id} style={{ border: '1px solid #111', marginBottom: '0.4rem', padding: '0.5rem',
            background: '#050505' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.3rem' }}>
              <span style={{ fontSize: '0.6rem', color: '#ccc' }}>{item.desc}</span>
              <span style={{ fontSize: '0.52rem', color: severityColor[item.severity] || '#aaa',
                border: `1px solid ${severityColor[item.severity] || '#333'}`, padding: '0 4px' }}>{item.severity}</span>
            </div>
            <div style={{ fontFamily: 'inherit', fontSize: '0.65rem', color: neon, background: '#030303',
              border: '1px solid #0d0d0d', padding: '0.3rem 0.5rem', wordBreak: 'break-all',
              marginBottom: '0.3rem' }}>{item.pattern}</div>
            <div style={{ fontSize: '0.55rem', color: '#555', marginBottom: '0.3rem' }}>
              ex: <span style={{ color: '#777' }}>{item.example}</span>
            </div>
            {item.fp && <div style={{ fontSize: '0.52rem', color: '#ff990088', marginBottom: '0.3rem' }}>⚠ FP: {item.fp}</div>}
            <div style={{ display: 'flex', gap: '0.3rem' }}>
              <Btn onClick={() => onInsert(item.pattern)} variant="primary" style={{ fontSize: '0.55rem', padding: '2px 6px' }}>INSERT</Btn>
              <Btn onClick={() => copy(item.pattern)} style={{ fontSize: '0.55rem', padding: '2px 6px' }}>
                {copied === item.pattern ? '✓ COPIED' : 'COPY'}
              </Btn>
            </div>
          </div>
        ))}
        {!items.length && <div style={{ color: '#555', fontSize: '0.65rem', textAlign: 'center', padding: '1rem' }}>no patterns found</div>}
      </div>
    </div>
  )
}

// ── Matcher Builder ───────────────────────────────────────────────────────────
function MatcherBuilder({ matcher, onChange, onRemove, onRegexInsert }) {
  const update = (k, v) => onChange({ ...matcher, [k]: v })
  const updateList = (k, i, v) => { const a = [...(matcher[k] || [])]; a[i] = v; update(k, a) }
  const addToList = (k) => update(k, [...(matcher[k] || []), ''])
  const removeFromList = (k, i) => update(k, (matcher[k] || []).filter((_, j) => j !== i))

  return (
    <div style={{ border: '1px solid #1a1a1a', padding: '0.6rem', marginBottom: '0.4rem', background: '#050505' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <Label hint="word = match exact text. regex = match a pattern. status = match HTTP status code. dsl = advanced logic expression. binary = match hex bytes. xpath = match HTML/XML nodes.">TYPE</Label>
          <Sel value={matcher.type} onChange={v => update('type', v)} options={MATCHER_TYPES} />
        </div>
        <div style={{ flex: 1, minWidth: '80px' }}>
          <Label hint="WHERE to look in the response. body = response content. header = HTTP headers. all = both. Use 'header' for CORS, cookies, redirects. Use 'body' for error messages, keywords, secrets.">PART</Label>
          <Sel value={matcher.part || 'body'} onChange={v => update('part', v)} options={PARTS} />
        </div>
        {(matcher.type === 'word' || matcher.type === 'regex') && (
          <div style={{ flex: 1, minWidth: '80px' }}>
            <Label hint="or = match fires if ANY word/pattern matches (less strict, more results). and = ALL words/patterns must match (more precise, fewer false positives). Use AND for high-confidence detections.">CONDITION</Label>
            <Sel value={matcher.condition || 'or'} onChange={v => update('condition', v)} options={['or', 'and']} />
          </div>
        )}
        <div style={{ display: 'flex', gap: '0.3rem', alignItems: 'flex-end', paddingBottom: '0.1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', color: '#888', cursor: 'pointer' }}
            title="Negative matcher: fires when the word/pattern is NOT found. Useful to exclude false positives, e.g. exclude '404 Not Found' from backup file checks.">
            <input type="checkbox" checked={!!matcher.negative} onChange={e => update('negative', e.target.checked)} />NEG
          </label>
          <Btn onClick={onRemove} variant="danger" style={{ padding: '2px 6px', fontSize: '0.55rem' }}>✕</Btn>
        </div>
      </div>

      {matcher.type === 'status' && (
        <div>
          <Label hint="The HTTP status code(s) the response must return. 200 = page exists. 301/302 = redirect. 403 = forbidden (still exists). 500 = server error. For most detections use 200. For redirect bugs use 301,302,307.">STATUS CODES (comma separated)</Label>
          <Inp value={(matcher.status || []).join(',')} onChange={v => update('status', v.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)))} placeholder="200,302" />
        </div>
      )}

      {matcher.type === 'word' && (
        <div>
          <Label hint="Exact text that must appear in the response. Case-insensitive. Example: for SQLi errors type 'you have an error in your sql syntax'. For git exposure type '[core]'. For debug pages type 'phpinfo()'.">WORDS</Label>
          {(matcher.words || ['']).map((w, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={w} onChange={v => updateList('words', i, v)} placeholder="e.g. [core]  or  SQL syntax error  or  X-Powered-By: PHP" />
              <Btn onClick={() => removeFromList('words', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('words')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD WORD</Btn>
        </div>
      )}

      {matcher.type === 'regex' && (
        <div>
          <Label hint="A regular expression pattern to match against the response. Use ⚡ to pick from the regex library. Example: for AWS keys use (AKIA[A-Z0-9]{16}). For emails use ([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}).">REGEX PATTERNS</Label>
          {(matcher.regex || ['']).map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={r} onChange={v => updateList('regex', i, v)} placeholder="regex pattern" />
              <Btn onClick={() => onRegexInsert(v => updateList('regex', i, v))} style={{ padding: '2px 6px', fontSize: '0.55rem', flexShrink: 0, borderColor: dim, color: dim }}>⚡</Btn>
              <Btn onClick={() => removeFromList('regex', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('regex')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD PATTERN</Btn>
        </div>
      )}

      {matcher.type === 'dsl' && (
        <div>
          <Label hint={'Advanced logic combining multiple conditions. Use && for AND, || for OR. Example: status_code==200 && contains(body,"admin") checks both status and body content.'}>DSL EXPRESSIONS</Label>
          {(matcher.dsl || ['']).map((d, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={d} onChange={v => updateList('dsl', i, v)} placeholder='status_code==200 && contains(body,"secret")' />
              <Btn onClick={() => removeFromList('dsl', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('dsl')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD EXPRESSION</Btn>
          <div style={{ fontSize: '0.55rem', color: '#555', marginTop: '0.3rem' }}>
            helpers: contains() | len() | status_code | body | all_headers | toupper() | tolower() | md5()
          </div>
        </div>
      )}

      {matcher.type === 'xpath' && (
        <div>
          <Label hint="XPath query to match HTML or XML content. Use when the response is structured HTML/XML. Example: //title[contains(text(),'Admin')] matches pages with 'Admin' in the title tag. //input[@name='csrf'] finds CSRF input fields.">XPATH QUERIES</Label>
          {(matcher.xpath || ['']).map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={x} onChange={v => updateList('xpath', i, v)} placeholder="//title[contains(text(),'Admin')]" />
              <Btn onClick={() => removeFromList('xpath', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('xpath')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD XPATH</Btn>
        </div>
      )}

      {matcher.type === 'binary' && (
        <div>
          <Label hint="Match raw hex bytes in the response. Used for binary file detection. Example: 504B0304 = ZIP file, FD377A585A0000 = XZ archive, FFD8FFE0 = JPEG image. Useful for detecting exposed backup archives.">HEX PATTERNS</Label>
          {(matcher.binary || ['']).map((b, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={b} onChange={v => updateList('binary', i, v)} placeholder="504B0304" />
              <Btn onClick={() => removeFromList('binary', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('binary')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD HEX</Btn>
        </div>
      )}
    </div>
  )
}

// ── Extractor Builder ─────────────────────────────────────────────────────────
function ExtractorBuilder({ extractor, onChange, onRemove, onRegexInsert }) {
  const update = (k, v) => onChange({ ...extractor, [k]: v })
  const updateList = (k, i, v) => { const a = [...(extractor[k] || [])]; a[i] = v; update(k, a) }
  const addToList = (k) => update(k, [...(extractor[k] || []), ''])
  const removeFromList = (k, i) => update(k, (extractor[k] || []).filter((_, j) => j !== i))

  return (
    <div style={{ border: '1px solid #1a1a1a', padding: '0.6rem', marginBottom: '0.4rem', background: '#050505' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <Label hint="regex = extract using a pattern (most common). json = extract a value from JSON response using dot notation like .token. xpath = extract from HTML/XML. kval = extract a header or cookie value by name. dsl = extract using an expression.">TYPE</Label>
          <Sel value={extractor.type} onChange={v => update('type', v)} options={EXTRACTOR_TYPES} />
        </div>
        <div style={{ flex: 1, minWidth: '100px' }}>
          <Label hint="A variable name for the extracted value. This name can be reused in later requests or matchers. Example: name it 'csrf_token' and reference it as {{csrf_token}} in the next request body.">NAME (variable)</Label>
          <Inp value={extractor.name || ''} onChange={v => update('name', v)} placeholder="e.g. csrf_token  or  api_key  or  session_id" />
        </div>
        <div style={{ flex: 1, minWidth: '80px' }}>
          <Label hint="WHERE to extract from. body = response content (default). header = HTTP response headers (use for Set-Cookie, Location, X-Token etc). all = search everywhere.">PART</Label>
          <Sel value={extractor.part || 'body'} onChange={v => update('part', v)} options={PARTS} />
        </div>
        <Btn onClick={onRemove} variant="danger" style={{ padding: '2px 6px', fontSize: '0.55rem', alignSelf: 'flex-end', marginBottom: '0.1rem' }}>✕</Btn>
      </div>

      {extractor.type === 'regex' && (
        <div>
          <Label hint="Regex pattern to extract a value. Use capture groups () to grab specific parts. Example: 'token=([a-zA-Z0-9]+)' extracts the token value. GROUP below sets which capture group to use (1 = first group).">REGEX PATTERNS</Label>
          {(extractor.regex || ['']).map((r, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={r} onChange={v => updateList('regex', i, v)} placeholder="([a-zA-Z0-9]+)" />
              <Btn onClick={() => onRegexInsert(v => updateList('regex', i, v))} style={{ padding: '2px 6px', fontSize: '0.55rem', flexShrink: 0, borderColor: dim, color: dim }}>⚡</Btn>
              <Btn onClick={() => removeFromList('regex', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem', alignItems: 'center' }}>
            <Btn onClick={() => addToList('regex')} style={{ fontSize: '0.55rem' }}>+ ADD PATTERN</Btn>
            <Label>GROUP:</Label>
            <Inp value={extractor.group ?? 1} onChange={v => update('group', parseInt(v) || 1)} type="number" style={{ width: '60px' }} />
          </div>
        </div>
      )}

      {extractor.type === 'json' && (
        <div>
          <Label hint="JSONPath expression to extract a value from a JSON response. Example: .access_token extracts the access_token field. .data.user.id extracts a nested value. Use when the API returns JSON.">JSON PATHS</Label>
          {(extractor.json || ['']).map((j, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={j} onChange={v => updateList('json', i, v)} placeholder=".token" />
              <Btn onClick={() => removeFromList('json', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('json')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD PATH</Btn>
        </div>
      )}

      {extractor.type === 'kval' && (
        <div>
          <Label hint="Extract a value from response headers or cookies by key name. Example: Set-Cookie extracts the full cookie header. X-Auth-Token extracts that specific header. Useful for session token extraction in multi-step attacks.">HEADER/COOKIE KEYS</Label>
          {(extractor.kval || ['']).map((k, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={k} onChange={v => updateList('kval', i, v)} placeholder="Set-Cookie" />
              <Btn onClick={() => removeFromList('kval', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('kval')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD KEY</Btn>
        </div>
      )}

      {extractor.type === 'xpath' && (
        <div>
          <Label>XPATH QUERIES</Label>
          {(extractor.xpath || ['']).map((x, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={x} onChange={v => updateList('xpath', i, v)} placeholder="//input[@name='csrf']/@value" />
              <Btn onClick={() => removeFromList('xpath', i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={() => addToList('xpath')} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD XPATH</Btn>
        </div>
      )}
    </div>
  )
}

export { RegexPanel, MatcherBuilder, ExtractorBuilder, Section, Inp, Sel, Btn, Label }
