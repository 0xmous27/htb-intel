// Generates valid nuclei YAML from template state
export function generateYAML(state) {
  const { meta, requests, variables } = state
  const lines = []

  lines.push(`id: ${slug(meta.id || 'my-template')}`)
  lines.push('')
  lines.push('info:')
  lines.push(`  name: ${meta.name || 'My Template'}`)
  lines.push(`  author: ${meta.author || 'anonymous'}`)
  lines.push(`  severity: ${meta.severity || 'info'}`)

  if (meta.description) {
    if (meta.description.includes('\n')) {
      lines.push('  description: |')
      meta.description.split('\n').forEach(l => lines.push(`    ${l}`))
    } else {
      lines.push(`  description: "${meta.description.replace(/"/g, '\\"')}"`)
    }
  }

  if (meta.reference?.filter(Boolean).length) {
    lines.push('  reference:')
    meta.reference.filter(Boolean).forEach(r => lines.push(`    - ${r}`))
  }

  // classification block
  const cls = meta.classification || {}
  const hasClassification = cls.cvssMetrics || cls.cvssScore || cls.cveId || cls.cweId
  if (hasClassification) {
    lines.push('  classification:')
    if (cls.cvssMetrics) lines.push(`    cvss-metrics: ${cls.cvssMetrics}`)
    if (cls.cvssScore)   lines.push(`    cvss-score: ${cls.cvssScore}`)
    if (cls.cveId)       lines.push(`    cve-id: ${cls.cveId}`)
    if (cls.cweId)       lines.push(`    cwe-id: ${cls.cweId}`)
  }

  // metadata block
  const md = meta.metadata || {}
  const hasMetadata = md.verified || md.shodanQuery || md.fofaQuery || md.maxRequest
  if (hasMetadata) {
    lines.push('  metadata:')
    if (md.verified)     lines.push('    verified: true')
    if (md.maxRequest)   lines.push(`    max-request: ${md.maxRequest}`)
    if (md.shodanQuery)  lines.push(`    shodan-query: '${md.shodanQuery}'`)
    if (md.fofaQuery)    lines.push(`    fofa-query: '${md.fofaQuery}'`)
  }

  if (meta.tags?.length) lines.push(`  tags: ${meta.tags.join(',')}`)
  if (meta.remediation)  lines.push(`  remediation: "${meta.remediation.replace(/"/g, '\\"')}"`)
  lines.push('')

  // variables block
  const vars = variables || {}
  const varEntries = Object.entries(vars).filter(([, v]) => v)
  if (varEntries.length) {
    lines.push('variables:')
    varEntries.forEach(([k, v]) => lines.push(`  ${k}: "${v}"`))
    lines.push('')
  }

  lines.push('http:')
  requests.forEach((req, ri) => {
    lines.push(`  - method: ${req.method || 'GET'}`)
    if (req.paths?.filter(Boolean).length) {
      lines.push('    path:')
      req.paths.filter(Boolean).forEach(p => lines.push(`      - "${p}"`))
    }
    if (req.headers && Object.keys(req.headers).filter(k => req.headers[k]).length) {
      lines.push('    headers:')
      Object.entries(req.headers).forEach(([k, v]) => v && lines.push(`      ${k}: ${v}`))
    }
    if (req.body) {
      // Use block scalar if body contains single quotes or newlines
      if (req.body.includes("'") || req.body.includes('\n')) {
        lines.push('    body: |')
        req.body.split('\n').forEach(l => lines.push(`      ${l}`))
      } else {
        lines.push(`    body: '${req.body}'`)
      }
    }
    if (req.redirects)    lines.push('    redirects: true')
    if (req.maxRedirects) lines.push(`    max-redirects: ${req.maxRedirects}`)
    if (req.attackMode)   lines.push(`    attack: ${req.attackMode}`)
    if (req.payloads && Object.keys(req.payloads).length) {
      lines.push('    payloads:')
      Object.entries(req.payloads).forEach(([k, v]) => {
        if (Array.isArray(v)) {
          lines.push(`      ${k}:`)
          v.forEach(item => lines.push(`        - ${item}`))
        }
      })
    }
    if (req.matchers?.length) {
      if (req.matchersCondition && req.matchersCondition !== 'or') {
        lines.push(`    matchers-condition: ${req.matchersCondition}`)
      }
      lines.push('    matchers:')
      req.matchers.forEach(m => {
        lines.push(`      - type: ${m.type}`)
        if (m.name) lines.push(`        name: ${m.name}`)
        if (m.type === 'status' && m.status?.length) {
          lines.push('        status:')
          m.status.forEach(s => lines.push(`          - ${s}`))
        }
        if (m.type === 'word' && m.words?.filter(Boolean).length) {
          lines.push('        words:')
          m.words.filter(Boolean).forEach(w => {
            // Use double quotes if word contains single quote, else single quotes
            const q = w.includes("'") ? '"' : "'"
            lines.push(`          - ${q}${w}${q}`)
          })
        }
        if (m.type === 'regex' && m.regex?.filter(Boolean).length) {
          lines.push('        regex:')
          m.regex.filter(Boolean).forEach(r => lines.push(`          - '${r}'`))
        }
        if (m.type === 'dsl' && m.dsl?.filter(Boolean).length) {
          lines.push('        dsl:')
          m.dsl.filter(Boolean).forEach(d => lines.push(`          - "${d}"`))
        }
        if (m.type === 'xpath' && m.xpath?.filter(Boolean).length) {
          lines.push('        xpath:')
          m.xpath.filter(Boolean).forEach(x => lines.push(`          - '${x}'`))
        }
        if (m.type === 'binary' && m.binary?.filter(Boolean).length) {
          lines.push('        binary:')
          m.binary.filter(Boolean).forEach(b => lines.push(`          - "${b}"`))
        }
        if (m.type === 'size' && m.size != null) lines.push(`        size: ${m.size}`)
        if (m.part && m.part !== 'body') lines.push(`        part: ${m.part}`)
        if (m.condition && m.condition !== 'or') lines.push(`        condition: ${m.condition}`)
        if (m.negative) lines.push('        negative: true')
        if (m.internal) lines.push('        internal: true')
      })
    }
    if (req.extractors?.length) {
      lines.push('    extractors:')
      req.extractors.forEach(e => {
        lines.push(`      - type: ${e.type}`)
        if (e.name) lines.push(`        name: ${e.name}`)
        if (e.type === 'regex' && e.regex?.filter(Boolean).length) {
          lines.push('        regex:')
          e.regex.filter(Boolean).forEach(r => lines.push(`          - '${r}'`))
          if (e.group != null) lines.push(`        group: ${e.group}`)
        }
        if (e.type === 'json' && e.json?.filter(Boolean).length) {
          lines.push('        json:')
          e.json.filter(Boolean).forEach(j => lines.push(`          - '${j}'`))
        }
        if (e.type === 'xpath' && e.xpath?.filter(Boolean).length) {
          lines.push('        xpath:')
          e.xpath.filter(Boolean).forEach(x => lines.push(`          - '${x}'`))
        }
        if (e.type === 'kval' && e.kval?.filter(Boolean).length) {
          lines.push('        kval:')
          e.kval.filter(Boolean).forEach(k => lines.push(`          - ${k}`))
        }
        if (e.type === 'dsl' && e.dsl?.filter(Boolean).length) {
          lines.push('        dsl:')
          e.dsl.filter(Boolean).forEach(d => lines.push(`          - "${d}"`))
        }
        if (e.part && e.part !== 'body') lines.push(`        part: ${e.part}`)
        if (e.internal) lines.push('        internal: true')
      })
    }
    if (ri < requests.length - 1) lines.push('')
  })

  return lines.join('\n')
}

export function generateGF(state) {
  const { gf } = state
  const obj = {
    flags: gf.flags || '-HiE',
    patterns: (gf.patterns || []).filter(Boolean),
  }
  if (gf.extensions?.filter(Boolean).length) obj.extensions = gf.extensions.filter(Boolean)
  if (gf.exclude?.filter(Boolean).length)    obj.exclude    = gf.exclude.filter(Boolean)
  return JSON.stringify(obj, null, 2)
}

// ── Validation ────────────────────────────────────────────────────────────────
const GENERIC_WORDS = ['error', 'admin', 'login', 'success', 'true', 'false', 'ok', 'yes', 'no', '200', 'welcome']

export function validateTemplate(state) {
  const errors = []
  const { meta, requests, mode } = state

  if (mode === 'gf') {
    if (!meta.id) errors.push({ field: 'id', msg: 'Pattern name is required (used as export filename)' })
    else if (!/^[a-z0-9-]+$/.test(meta.id)) errors.push({ field: 'id', msg: 'Pattern name must be lowercase alphanumeric with hyphens only' })
    const patterns = (state.gf?.patterns || []).filter(Boolean)
    if (!patterns.length) errors.push({ field: 'gf.patterns', msg: 'GF: at least one pattern is required' })
    patterns.forEach(p => {
      try { new RegExp(p) } catch { errors.push({ field: 'gf.patterns', msg: `GF: invalid regex: ${p}` }) }
    })
    return errors
  }

  // nuclei-only meta checks
  if (!meta.id) errors.push({ field: 'id', msg: 'Template ID is required' })
  else if (!/^[a-z0-9-]+$/.test(meta.id)) errors.push({ field: 'id', msg: 'ID must be lowercase alphanumeric with hyphens only' })
  if (!meta.name)   errors.push({ field: 'name',   msg: 'Template name is required' })
  if (!meta.author) errors.push({ field: 'author', msg: 'Author is required' })

  if (!requests.length) {
    errors.push({ field: 'requests', msg: 'At least one request is required' })
    return errors
  }

  requests.forEach((req, i) => {
    const label = `Request ${i + 1}`
    if (!req.paths?.filter(Boolean).length)
      errors.push({ field: `req${i}.paths`, msg: `${label}: at least one path required` })

    if (!req.matchers?.length)
      errors.push({ field: `req${i}.matchers`, msg: `${label}: no matchers defined — template will match everything (false positive risk)` })

    const hasStatus = req.matchers?.some(m => m.type === 'status')
    const hasContent = req.matchers?.some(m => ['word','regex','dsl','xpath','binary','size'].includes(m.type))

    if (req.matchers?.length && !hasStatus)
      errors.push({ field: `req${i}.matchers`, msg: `${label}: add a status matcher (e.g. 200) to reduce false positives` })

    if (req.matchers?.length && !hasContent)
      errors.push({ field: `req${i}.matchers`, msg: `${label}: status-only matcher is weak — add a word/regex matcher to confirm the finding` })

    req.matchers?.forEach((m, j) => {
      const ml = `${label} matcher ${j + 1}`
      if (m.type === 'word' && !m.words?.filter(Boolean).length)
        errors.push({ field: `req${i}.matcher${j}`, msg: `${ml}: word matcher needs at least one word` })
      if (m.type === 'regex' && !m.regex?.filter(Boolean).length)
        errors.push({ field: `req${i}.matcher${j}`, msg: `${ml}: regex matcher needs at least one pattern` })
      if (m.type === 'status' && !m.status?.length)
        errors.push({ field: `req${i}.matcher${j}`, msg: `${ml}: status matcher needs at least one code` })
      if (m.type === 'dsl' && !m.dsl?.filter(Boolean).length)
        errors.push({ field: `req${i}.matcher${j}`, msg: `${ml}: DSL matcher needs at least one expression` })

      // Warn on overly generic words (skip negative matchers — they're intentional)
      if (m.type === 'word' && !m.negative) {
        m.words?.filter(Boolean).forEach(w => {
          if (GENERIC_WORDS.includes(w.toLowerCase().trim()))
            errors.push({ field: `req${i}.matcher${j}`, msg: `${ml}: "${w}" is too generic — high false positive risk` })
        })
      }

      // Validate regex syntax
      if (m.type === 'regex') {
        m.regex?.filter(Boolean).forEach(r => {
          try { new RegExp(r) } catch { errors.push({ field: `req${i}.matcher${j}`, msg: `${ml}: invalid regex: ${r}` }) }
        })
      }
    })
  })

  return errors
}

function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

export function defaultRequest() {
  return {
    method: 'GET',
    paths: ['{{BaseURL}}/'],
    headers: {},
    body: '',
    redirects: false,
    maxRedirects: 10,
    attackMode: '',
    payloads: {},
    matchers: [defaultMatcher()],
    extractors: [],
    matchersCondition: 'and',
  }
}

export function defaultMatcher() {
  return { type: 'word', words: [''], part: 'body', condition: 'or', negative: false, internal: false }
}

export function defaultExtractor() {
  return { type: 'regex', name: '', regex: [''], part: 'body', group: 1 }
}

export function defaultState() {
  return {
    mode: 'nuclei',
    meta: {
      id: '',
      name: '',
      author: '',
      severity: 'medium',
      description: '',
      reference: [''],
      tags: [],
      remediation: '',
      classification: { cvssMetrics: '', cvssScore: '', cveId: '', cweId: '' },
      metadata: { verified: false, maxRequest: '', shodanQuery: '', fofaQuery: '' },
    },
    variables: {},
    requests: [defaultRequest()],
    gf: { flags: '-HiE', patterns: [''], extensions: [], exclude: [] },
  }
}
