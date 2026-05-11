import { useState } from 'react'
import { METHODS, ATTACK_MODES, PARTS } from '../../data/forgeData'
import { defaultMatcher, defaultExtractor } from './yamlGen'
import { MatcherBuilder, ExtractorBuilder, Section, Inp, Sel, Btn, Label } from './ForgeComponents'

export default function RequestBuilder({ req, onChange, onRemove, reqIndex, onRegexInsert }) {
  const update = (k, v) => onChange({ ...req, [k]: v })

  const updatePath = (i, v) => { const a = [...req.paths]; a[i] = v; update('paths', a) }
  const addPath = () => update('paths', [...req.paths, ''])
  const removePath = (i) => update('paths', req.paths.filter((_, j) => j !== i))

  const updateHeader = (k, v, oldKey) => {
    const h = { ...req.headers }
    if (oldKey && oldKey !== k) delete h[oldKey]
    if (k) h[k] = v
    update('headers', h)
  }
  const addHeader = () => update('headers', { ...req.headers, '': '' })
  const removeHeader = (k) => { const h = { ...req.headers }; delete h[k]; update('headers', h) }

  const updateMatcher = (i, m) => { const a = [...req.matchers]; a[i] = m; update('matchers', a) }
  const addMatcher = () => update('matchers', [...req.matchers, defaultMatcher()])
  const removeMatcher = (i) => update('matchers', req.matchers.filter((_, j) => j !== i))

  const updateExtractor = (i, e) => { const a = [...req.extractors]; a[i] = e; update('extractors', a) }
  const addExtractor = () => update('extractors', [...req.extractors, defaultExtractor()])
  const removeExtractor = (i) => update('extractors', req.extractors.filter((_, j) => j !== i))

  return (
    <div style={{ border: '1px solid #1a1a1a', marginBottom: '0.75rem' }}>
      <div style={{ background: '#0a0a0a', padding: '0.4rem 0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', color: 'var(--neon-dim)', letterSpacing: '0.1em' }}>REQUEST #{reqIndex + 1}</span>
        <Btn onClick={onRemove} variant="danger" style={{ fontSize: '0.55rem', padding: '2px 6px' }}>REMOVE</Btn>
      </div>
      <div style={{ padding: '0.75rem' }}>

        <Section title="METHOD & PATHS">
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'flex-end' }}>
            <div>
              <Label hint="HTTP method to use. GET = fetch a page (most common for detection). POST = send data (login forms, APIs). PUT/DELETE = REST API testing. HEAD = check if a resource exists without downloading it.">METHOD</Label>
              <Sel value={req.method} onChange={v => update('method', v)} options={METHODS} />
            </div>
            <div style={{ flex: 1 }}>
              <Label hint="For fuzzing with payloads. batteringram = same payload in all positions. pitchfork = different payload per position (paired). clusterbomb = all combinations of all payloads. Leave as 'none' for simple detection templates.">ATTACK MODE</Label>
              <Sel value={req.attackMode || ''} onChange={v => update('attackMode', v)}
                options={[{ value: '', label: 'none' }, ...ATTACK_MODES.map(a => ({ value: a, label: a }))]} />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.6rem', color: '#888', cursor: 'pointer', paddingBottom: '0.35rem' }}
              title="Enable this for open redirect detection. Nuclei will follow HTTP 301/302 redirects and you can match on the final destination URL or headers.">
              <input type="checkbox" checked={!!req.redirects} onChange={e => update('redirects', e.target.checked)} />
              FOLLOW REDIRECTS
            </label>
          </div>
          {req.paths.map((p, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={p} onChange={v => updatePath(i, v)} placeholder="e.g. {{BaseURL}}/.git/config  or  {{BaseURL}}/admin  or  {{BaseURL}}/?id=1'" />
              <Btn onClick={() => removePath(i)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={addPath} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD PATH</Btn>
          <div style={{ fontSize: '0.58rem', color: '#444', marginTop: '0.4rem', lineHeight: 1.5 }}>
            Variables: <span style={{ color: '#666' }}>{'{{BaseURL}}'}</span> = target URL &nbsp;|&nbsp;
            <span style={{ color: '#666' }}>{'{{Hostname}}'}</span> = host only &nbsp;|&nbsp;
            <span style={{ color: '#666' }}>{'{{RootURL}}'}</span> = scheme+host
          </div>
        </Section>

        <Section title="HEADERS" defaultOpen={false}>
          <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            Add custom HTTP headers. Common uses: <span style={{ color: '#777' }}>Origin: https://evil.com</span> (CORS test) &nbsp;|&nbsp;
            <span style={{ color: '#777' }}>Authorization: Bearer TOKEN</span> (auth bypass) &nbsp;|&nbsp;
            <span style={{ color: '#777' }}>X-Forwarded-For: 127.0.0.1</span> (IP bypass)
          </div>
          {Object.entries(req.headers).map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: '0.3rem', marginBottom: '0.25rem' }}>
              <Inp value={k} onChange={nk => updateHeader(nk, v, k)} placeholder="Header-Name e.g. Origin" style={{ width: '40%' }} />
              <Inp value={v} onChange={nv => updateHeader(k, nv)} placeholder="value e.g. https://evil.com" />
              <Btn onClick={() => removeHeader(k)} variant="danger" style={{ padding: '2px 6px', flexShrink: 0 }}>✕</Btn>
            </div>
          ))}
          <Btn onClick={addHeader} style={{ fontSize: '0.55rem', marginTop: '0.2rem' }}>+ ADD HEADER</Btn>
          <div style={{ marginTop: '0.5rem' }}>
            <Label hint={'Request body for POST/PUT requests. For forms: param=value&other=value. For JSON APIs: {"key":"value"}. For SQLi in POST body: username=admin\'--&password=x'}>BODY</Label>
            <textarea value={req.body || ''} onChange={e => update('body', e.target.value)}
              placeholder='For forms: username=admin&password=test'
              style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: 'var(--neon)',
                fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.4rem', outline: 'none', resize: 'vertical', minHeight: '60px' }} />
          </div>
        </Section>

        <Section title={`MATCHERS (${req.matchers.length})`}>
          <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            Matchers decide if the template fires. Add at least one. Combine a <span style={{ color: '#777' }}>word/regex matcher</span> with a <span style={{ color: '#777' }}>status matcher</span> for best accuracy.
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
            <Label hint="AND = ALL matchers must pass for the template to fire (recommended — reduces false positives). OR = ANY single matcher passing is enough (use when you have multiple independent detection methods).">MATCHERS CONDITION:</Label>
            <Sel value={req.matchersCondition || 'and'} onChange={v => update('matchersCondition', v)} options={['and', 'or']} />
          </div>
          {req.matchers.map((m, i) => (
            <MatcherBuilder key={i} matcher={m} onChange={v => updateMatcher(i, v)}
              onRemove={() => removeMatcher(i)} onRegexInsert={onRegexInsert} />
          ))}
          <Btn onClick={addMatcher} variant="primary" style={{ fontSize: '0.6rem' }}>+ ADD MATCHER</Btn>
        </Section>

        <Section title={`EXTRACTORS (${req.extractors.length})`} defaultOpen={false}>
          <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '0.5rem', lineHeight: 1.5 }}>
            Extractors pull values out of the response. Use them to grab tokens, IDs, or secrets and display them in nuclei output. Also used in multi-step attacks to pass values between requests.
          </div>
          {req.extractors.map((e, i) => (
            <ExtractorBuilder key={i} extractor={e} onChange={v => updateExtractor(i, v)}
              onRemove={() => removeExtractor(i)} onRegexInsert={onRegexInsert} />
          ))}
          <Btn onClick={addExtractor} style={{ fontSize: '0.6rem' }}>+ ADD EXTRACTOR</Btn>
        </Section>

      </div>
    </div>
  )
}
