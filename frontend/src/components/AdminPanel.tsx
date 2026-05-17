// @ts-nocheck
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || ''

// Admin writes use service_role key (bypasses RLS) — never stored in git,
// held only in memory for the session duration.
let _adminClient = null
function getAdminClient(serviceKey) {
  if (!_adminClient && serviceKey) _adminClient = createClient(SUPABASE_URL, serviceKey, { auth: { persistSession: false } })
  return _adminClient || supabase // fallback to anon if no key yet
}

// ── Field metadata: hints, types, options ─────────────────────────────────────
const FIELD_META = {
  id:          { hint: 'Unique slug ID, e.g. "idor-16" or "tool-nmap". No spaces.', placeholder: 'e.g. idor-16' },
  category:    { hint: 'Category/group this record belongs to.', placeholder: 'e.g. IDOR, XSS, Scanning' },
  severity:    { hint: 'Risk level.', type: 'select', options: ['CRITICAL','HIGH','MEDIUM','LOW','INFO'] },
  bounty:      { hint: 'Bounty amount paid, e.g. "$5,000".', placeholder: '$5,000' },
  platform:    { hint: 'Bug bounty platform, e.g. HackerOne, Bugcrowd.', placeholder: 'HackerOne' },
  program:     { hint: 'Target program/company name.', placeholder: 'e.g. Shopify' },
  title:       { hint: 'Short descriptive title of the record.', placeholder: 'Short title' },
  description: { hint: 'Full description of the vulnerability, technique, or item.', placeholder: 'Detailed description...' },
  steps:       { hint: 'Step-by-step reproduction or usage steps. One step per line.', placeholder: '1. Do this\n2. Then this\n3. Observe result' },
  payload:     { hint: 'The actual payload, command, or proof-of-concept code.', placeholder: 'Payload or PoC code...' },
  tags:        { hint: 'Comma-separated tags for filtering, e.g. "idor, account-takeover".', placeholder: 'tag1, tag2, tag3' },
  name:        { hint: 'Display name of the item.', placeholder: 'e.g. nmap' },
  purpose:     { hint: 'What this technique achieves — the goal/objective.', placeholder: 'e.g. Map AD attack paths and relationships' },
  when_to_use: { hint: 'When should you use this? What conditions must be met?', placeholder: 'e.g. After getting domain user credentials' },
  command:     { hint: 'The exact command to run. Use {TARGET_IP}, {USERNAME}, {PASSWORD} as placeholders.', placeholder: 'e.g. nmap -p- {TARGET_IP}' },
  service:     { hint: 'Affected service or software name.', placeholder: 'e.g. SMB, Apache' },
  affected:    { hint: 'Affected versions or systems.', placeholder: 'e.g. Windows 7/2008 R2 (unpatched)' },
  exploit:     { hint: 'Exploit command or Metasploit module usage.', placeholder: 'use exploit/...\nset RHOSTS {TARGET_IP}\nrun' },
  msf:         { hint: 'Metasploit module path only, e.g. exploit/windows/smb/ms17_010_eternalblue', placeholder: 'exploit/windows/smb/...' },
  manual:      { hint: 'Manual exploitation command without Metasploit.', placeholder: 'curl http://{TARGET_IP}/...' },
  install:     { hint: 'Installation command.', placeholder: 'sudo apt install ...' },
  usage:       { hint: 'Example usage command with placeholders.', placeholder: 'tool -u http://{TARGET_IP} ...' },
  source:      { hint: 'Source/author of this trick, e.g. HackTricks, coffinxp.', placeholder: 'HackTricks' },
  cmd:         { hint: 'The command or code snippet.', placeholder: 'Command...' },
  path:        { hint: 'File system path to the wordlist.', placeholder: '/usr/share/seclists/...' },
  size:        { hint: 'Number of entries or file size, e.g. "10,000 lines".', placeholder: '10,000 lines' },
  port:        { hint: 'Port number(s), e.g. "22" or "5985/5986".', placeholder: '22' },
  protocol:    { hint: 'Network protocol: TCP, UDP, or TCP/UDP.', placeholder: 'TCP' },
  enum_cmd:    { hint: 'Enumeration command for this service.', placeholder: 'nmap -p 22 -sV {TARGET_IP}' },
  attacks:     { hint: 'Common attack vectors for this service. One per line.', placeholder: 'Brute force credentials\nVersion exploit' },
  cves_list:   { hint: 'Related CVEs. One per line.', placeholder: 'CVE-2018-15473\nCVE-2023-38408' },
  notes:       { hint: 'Extra notes or tips for this service.', placeholder: 'Always check for...' },
  setup:       { hint: 'Setup required before using this technique, e.g. start a listener.', placeholder: 'nc -lvnp 80 OR use Burp Collaborator' },
  note:        { hint: 'Important note or caveat about this payload.', placeholder: 'Requires FILE privilege...' },
  pattern:     { hint: 'The regex pattern string.', placeholder: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' },
  phase:       { hint: 'Checklist phase, e.g. Recon, Scanning, Exploitation.', placeholder: 'e.g. Recon' },
  items:       { hint: 'Checklist items, one per line.', placeholder: 'Check /robots.txt\nRun nikto scan\n...' },
  bin_name:    { hint: 'Binary name, e.g. bash, python3, vim.', placeholder: 'e.g. bash' },
  bin_function:{ hint: 'GTFOBins function type: shell, file-read, file-write, sudo, suid, etc.', placeholder: 'shell' },
  os:          { hint: 'Operating system: linux, windows, or both.', placeholder: 'linux' },
}

// ── Table definitions ─────────────────────────────────────────────────────────
const TABLES = [
  {
    key: 'bb_reports', label: '🐛 Bug Bounty',
    fields: ['id','category','severity','bounty','platform','program','title','description','steps','payload','tags'],
    required: ['id','category','severity','title'],
    categoryOptions: ['IDOR','XSS','SSRF','RCE','SQLi','Auth Bypass','Business Logic','File Upload','CORS','CSRF','Open Redirect','Info Disclosure','XXE','Privilege Escalation'],
  },
  {
    key: 'techniques', label: '⚡ Techniques',
    fields: ['id','category','name','purpose','when_to_use','command','description','tags'],
    required: ['id','category','name','command'],
    categoryOptions: ['Active Directory','Web Exploitation','Linux PrivEsc','Windows PrivEsc','Network','Password Attacks','File Transfer','Post-Exploitation','Evasion'],
  },
  {
    key: 'cves', label: '💀 CVEs',
    fields: ['id','name','severity','service','affected','description','exploit','msf','manual','tags'],
    required: ['id','name','severity'],
  },
  {
    key: 'tools', label: '🔧 Tools',
    fields: ['id','name','category','description','install','usage','tags'],
    required: ['id','name'],
    categoryOptions: ['Scanning & Enumeration','File Transfer','Password Attacks','Exploitation','SMB & AD','Web','Post-Exploitation','Misc'],
  },
  {
    key: 'tricks', label: '🃏 Tricks',
    fields: ['id','category','title','source','description','cmd','tags'],
    required: ['id','category','title'],
    categoryOptions: ['SSRF','XSS','SQLi','RCE','LFI','IDOR','Auth Bypass','File Upload','CORS','XXE','Misc'],
  },
  {
    key: 'wordlists', label: '📦 Wordlists',
    fields: ['id','name','category','path','description','size','tags'],
    required: ['id','name'],
    categoryOptions: ['Directories','DNS','Usernames','Passwords','Fuzzing','API','Misc'],
  },
  {
    key: 'services', label: '🌐 Services',
    fields: ['id','name','port','protocol','description','enum_cmd','attacks','cves_list','notes','tags'],
    required: ['id','name'],
  },
  {
    key: 'oob_payloads', label: '📡 OOB',
    fields: ['id','category','title','description','when_to_use','setup','payload','note','tags'],
    required: ['id','category','title'],
    categoryOptions: ['Out-of-Band SQLi','SSRF OOB','XXE OOB','DNS Exfil','HTTP Exfil','Blind RCE'],
  },
  {
    key: 'regex_ref', label: '⌥ Regex',
    fields: ['id','category','name','pattern','description','tags'],
    required: ['id','name','pattern'],
    categoryOptions: ['grep','sed','awk','Python','JavaScript','Misc'],
  },
  {
    key: 'ports', label: '🔌 Ports',
    fields: ['id','port','protocol','service','description','tags'],
    required: ['id','port'],
  },
  {
    key: 'checklists', label: '📋 Checklists',
    fields: ['id','category','title','phase','items','tags'],
    required: ['id','category','title'],
    categoryOptions: ['External Pentest','Internal AD Pentest','Linux Box','Windows Box','Web App','Mobile','API'],
  },
  {
    key: 'gtfobins', label: '🐚 GTFOBins',
    fields: ['id','bin_name','bin_function','os','description','cmd','tags'],
    required: ['id','bin_name','bin_function'],
    categoryOptions: ['shell','file-read','file-write','sudo','suid','capabilities','cron','env'],
  },
  {
    key: 'ad_techniques', label: '🏢 AD Techniques',
    fields: ['id','phase','name','cmd','when_to_use','tags'],
    required: ['id','phase','name','cmd'],
    categoryOptions: ['Enumeration','Credential Attacks','BloodHound','Lateral Movement','Domain Escalation','Post-Compromise'],
  },
  {
    key: 'quick_ref', label: '⚡ Quick Ref',
    fields: ['id','category','name','cmd','tags'],
    required: ['id','category','name','cmd'],
    categoryOptions: ['Shell Upgrades','File Transfer','Enumeration','Reverse Shells','Listeners','Credential Hunting','Windows Quick Wins'],
  },
]

const TEXTAREA_FIELDS = ['description','steps','payload','command','exploit','install','usage','cmd','affected','enum_cmd','pattern','items','attacks','cves_list','notes','manual','purpose','when_to_use','setup','note']
const ARRAY_FIELDS = ['tags']
const SEV_COLOR = { CRITICAL:'#ff3333', HIGH:'#ff9900', MEDIUM:'#ffcc00', LOW:'#00ff99', INFO:'#4488ff' }

// ── Admin-specific styles (not hacker-themed) ─────────────────────────────────
const A = {
  bg: '#0c0c0c',
  card: '#111',
  border: '#222',
  text: '#e0e0e0',
  muted: '#888',
  dim: '#555',
  accent: '#4f9eff',
  danger: '#ff4444',
  success: '#44cc88',
  warn: '#ffaa33',
  font: "'JetBrains Mono', monospace",
  radius: '4px',
}

// ── Primitives ────────────────────────────────────────────────────────────────
function Inp({ value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background: '#0a0a0a', border:`1px solid ${A.border}`, color: A.text, fontFamily: A.font,
        fontSize:'0.82rem', padding:'0.55rem 0.75rem', outline:'none', width:'100%', boxSizing:'border-box',
        borderRadius: A.radius, transition:'border-color 0.2s', ...style }}
      onFocus={e => e.target.style.borderColor = A.accent}
      onBlur={e => e.target.style.borderColor = A.border} />
  )
}

function Txta({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ background:'#0a0a0a', border:`1px solid ${A.border}`, color: A.text, fontFamily: A.font,
        fontSize:'0.78rem', padding:'0.55rem 0.75rem', outline:'none', width:'100%', boxSizing:'border-box',
        resize:'vertical', lineHeight:1.6, borderRadius: A.radius, transition:'border-color 0.2s' }}
      onFocus={e => e.target.style.borderColor = A.accent}
      onBlur={e => e.target.style.borderColor = A.border} />
  )
}

function Sel({ value, onChange, options, placeholder }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value)}
      style={{ background:'#0a0a0a', border:`1px solid ${A.border}`, color: value ? A.text : A.dim, fontFamily: A.font,
        fontSize:'0.82rem', padding:'0.55rem 0.75rem', outline:'none', width:'100%', boxSizing:'border-box',
        cursor:'pointer', borderRadius: A.radius }}
      onFocus={e => e.target.style.borderColor = A.accent}
      onBlur={e => e.target.style.borderColor = A.border}>
      <option value="">{placeholder || '— select —'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled, type = 'button', style = {} }) {
  const variants = {
    primary: { background: A.accent, borderColor: A.accent, color: '#fff' },
    danger:  { background: 'transparent', borderColor: A.danger, color: A.danger },
    ghost:   { background: 'transparent', borderColor: A.border, color: A.muted },
    warn:    { background: 'transparent', borderColor: A.warn, color: A.warn },
    success: { background: A.success, borderColor: A.success, color: '#000' },
  }
  const v = variants[variant] || variants.primary
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ border:'1px solid', fontFamily: A.font, fontSize:'0.75rem', fontWeight: 600,
        padding:'0.45rem 1.1rem', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition:'all 0.15s', borderRadius: A.radius, ...v, ...style }}>
      {children}
    </button>
  )
}

function Hint({ text }) {
  const [show, setShow] = useState(false)
  return (
    <span style={{ position:'relative', display:'inline-block', marginLeft:'4px' }}>
      <span
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{ fontSize:'0.6rem', color: A.dim, border:`1px solid ${A.border}`, borderRadius:'50%',
          width:'14px', height:'14px', display:'inline-flex', alignItems:'center', justifyContent:'center',
          cursor:'help', userSelect:'none', lineHeight:1 }}>?</span>
      {show && (
        <div style={{ position:'absolute', left:'18px', top:'-4px', zIndex:9999, background: A.card,
          border:`1px solid ${A.border}`, color: A.muted, fontSize:'0.72rem', padding:'0.6rem 0.85rem',
          width:'240px', lineHeight:1.5, pointerEvents:'none', boxShadow:'0 4px 20px #000', borderRadius: A.radius }}>
          {text}
        </div>
      )}
    </span>
  )
}

function Toast({ msg }) {
  if (!msg) return null
  const c = msg.ok ? A.success : A.danger
  return (
    <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999,
      background: A.card, border:`1px solid ${c}`, color: c, borderRadius: A.radius,
      padding:'0.75rem 1.5rem', fontSize:'0.8rem', boxShadow:`0 4px 20px ${c}22`, fontWeight: 600 }}>
      {msg.ok ? '✓' : '✕'} {msg.text}
    </div>
  )
}

// ── Record Form ───────────────────────────────────────────────────────────────
function RecordForm({ table, initial, onSave, onCancel, saving }) {
  const [form, setForm] = useState(() => {
    const base = Object.fromEntries(table.fields.map(f => [f, '']))
    if (!initial) return base
    const copy = { ...initial }
    ARRAY_FIELDS.forEach(f => { if (Array.isArray(copy[f])) copy[f] = copy[f].join(', ') })
    return { ...base, ...copy }
  })

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const submit = e => {
    e.preventDefault()
    const rec = { ...form }
    ARRAY_FIELDS.forEach(f => {
      rec[f] = typeof rec[f] === 'string' ? rec[f].split(',').map(s => s.trim()).filter(Boolean) : []
    })
    Object.keys(rec).forEach(k => { if (rec[k] === '') rec[k] = null })
    onSave(rec)
  }

  return (
    <form onSubmit={submit}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.65rem', marginBottom:'1rem' }}>
        {table.fields.map(f => {
          const req = table.required?.includes(f)
          const meta = FIELD_META[f] || {}
          const isTextarea = TEXTAREA_FIELDS.includes(f)
          const isSelect = meta.type === 'select'
          const isCategoryField = f === 'category' && table.categoryOptions
          const isBinFunction = f === 'bin_function' && table.categoryOptions
          const wide = isTextarea || f === 'tags'

          return (
            <div key={f} style={{ gridColumn: wide ? 'span 2' : 'span 1' }}>
              <div style={{ fontSize:'0.7rem', color: req ? A.accent : A.muted, marginBottom:'5px',
                letterSpacing:'0.03em', display:'flex', alignItems:'center', gap:'4px', fontWeight: req ? 600 : 400 }}>
                {f.replace(/_/g,' ').toUpperCase()}{req ? ' *' : ''}
                {meta.hint && <Hint text={meta.hint} />}
              </div>
              {isSelect ? (
                <Sel value={form[f]} onChange={v => set(f, v)} options={meta.options} />
              ) : (isCategoryField || isBinFunction) ? (
                <div style={{ display:'flex', gap:'4px' }}>
                  <Sel value={form[f]} onChange={v => set(f, v)} options={table.categoryOptions} placeholder="— pick or type —" />
                  <Inp value={form[f]} onChange={v => set(f, v)} placeholder="or type custom" style={{ flex:'0 0 140px' }} />
                </div>
              ) : isTextarea ? (
                <Txta value={form[f]} onChange={v => set(f, v)} placeholder={meta.placeholder || ''}
                  rows={['payload','steps','items','command','exploit','attacks','cves_list'].includes(f) ? 5 : 3} />
              ) : (
                <Inp value={form[f]} onChange={v => set(f, v)}
                  placeholder={ARRAY_FIELDS.includes(f) ? 'tag1, tag2, tag3' : (meta.placeholder || '')} />
              )}
            </div>
          )
        })}
      </div>
      <div style={{ display:'flex', gap:'0.5rem', paddingTop:'0.75rem', borderTop:'1px solid #111' }}>
        <Btn type="submit" disabled={saving}>{saving ? 'SAVING...' : '✓ SAVE'}</Btn>
        <Btn variant="ghost" onClick={onCancel}>CANCEL</Btn>
      </div>
    </form>
  )
}

// ── Table Manager ─────────────────────────────────────────────────────────────
function TableManager({ table }) {
  const [rows, setRows]       = useState([])
  const [loading, setLoading] = useState(true)
  const [mode, setMode]       = useState(null) // null | 'add' | rowId
  const [saving, setSaving]   = useState(false)
  const [search, setSearch]   = useState('')
  const [toast, setToast]     = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [page, setPage]       = useState(0)
  const [dupData, setDupData] = useState(null)
  const PAGE = 50

  const flash = (text, ok = true) => { setToast({ text, ok }); setTimeout(() => setToast(null), 2500) }

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase.from(table.key).select('*').order('created_at', { ascending: false })
    if (!error) setRows(data || [])
    else flash('Load error: ' + error.message, false)
    setLoading(false)
  }

  useEffect(() => { load(); setMode(null); setSearch(''); setPage(0) }, [table.key])

  const save = async (rec) => {
    setSaving(true)
    const db = getAdminClient()
    let payload = { ...rec }
    let { error } = await db.from(table.key).upsert(payload)

    // Auto-retry: strip columns that don't exist in the DB yet
    while (error && error.message?.includes("Could not find the '")) {
      const match = error.message.match(/Could not find the '([^']+)' column/)
      if (!match) break
      const badCol = match[1]
      delete payload[badCol]
      ;({ error } = await db.from(table.key).upsert(payload))
    }

    setSaving(false)
    if (error) { flash('Error: ' + error.message, false); return }
    flash('Saved ✓')
    setMode(null)
    load()
  }

  const remove = async (id) => {
    const { error } = await getAdminClient().from(table.key).delete().eq('id', id)
    if (error) { flash('Error: ' + error.message, false); return }
    flash('Deleted')
    setConfirm(null)
    load()
  }

  const filtered = rows.filter(r =>
    !search || Object.values(r).some(v => String(v || '').toLowerCase().includes(search.toLowerCase()))
  )
  const totalPages = Math.ceil(filtered.length / PAGE)
  const paged = filtered.slice(page * PAGE, (page + 1) * PAGE)

  const labelField = table.fields.find(f => ['title', 'name', 'bin_name'].includes(f)) || table.fields[1]
  const editingRow = typeof mode === 'string' && mode !== 'add' ? rows.find(r => r.id === mode) : null

  return (
    <div>
      <Toast msg={toast} />

      {/* Confirm delete modal */}
      {confirm && (
        <div style={{ position:'fixed', inset:0, background:'#000000dd', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background: A.card, border:`1px solid ${A.danger}`, padding:'2rem', minWidth:'340px', borderRadius: A.radius }}>
            <div style={{ fontSize:'0.9rem', color: A.danger, marginBottom:'0.75rem', fontWeight:700 }}>⚠ Confirm Delete</div>
            <div style={{ fontSize:'0.78rem', color: A.muted, marginBottom:'1.25rem' }}>
              Delete <span style={{ color: A.text }}>{confirm}</span>? This cannot be undone.
            </div>
            <div style={{ display:'flex', gap:'0.75rem' }}>
              <Btn variant="danger" onClick={() => remove(confirm)}>DELETE</Btn>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>CANCEL</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.25rem', alignItems:'center', flexWrap:'wrap' }}>
        <Inp value={search} onChange={v => { setSearch(v); setPage(0) }}
          placeholder={`Search ${table.label}...`} style={{ flex:1, minWidth:'200px' }} />
        <span style={{ fontSize:'0.72rem', color: A.dim, whiteSpace:'nowrap' }}>
          {filtered.length} of {rows.length}
        </span>
        <Btn onClick={() => { setMode('add'); window.scrollTo(0, 0) }}>+ Add New</Btn>
      </div>

      {/* Add form */}
      {mode === 'add' && (
        <div style={{ border:`1px solid ${A.accent}`, padding:'1.5rem', marginBottom:'1.25rem', background: A.card, borderRadius: A.radius }}>
          <div style={{ fontSize:'0.85rem', color: A.accent, marginBottom:'1rem', fontWeight:700 }}>
            {dupData ? '⧉ Duplicate Record' : '+ New Record'}
          </div>
          <RecordForm table={table} initial={dupData} onSave={(rec) => { save(rec); setDupData(null) }} onCancel={() => { setMode(null); setDupData(null) }} saving={saving} />
        </div>
      )}

      {/* Edit form */}
      {editingRow && (
        <div style={{ border:`1px solid ${A.warn}`, padding:'1.5rem', marginBottom:'1.25rem', background: A.card, borderRadius: A.radius }}>
          <div style={{ fontSize:'0.85rem', color: A.warn, marginBottom:'1rem', fontWeight:700 }}>
            ✏ Editing: {editingRow.id}
          </div>
          <RecordForm table={table} initial={editingRow} onSave={save} onCancel={() => setMode(null)} saving={saving} />
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <div style={{ fontSize:'0.85rem', color: A.dim, padding:'3rem', textAlign:'center' }}>Loading...</div>
      ) : filtered.length === 0 ? (
        <div style={{ fontSize:'0.85rem', color: A.dim, padding:'3rem', textAlign:'center', border:`1px dashed ${A.border}`, borderRadius: A.radius }}>
          {rows.length === 0 ? 'No records yet — click + Add New' : `No results for "${search}"`}
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexDirection:'column', gap:'3px' }}>
            {paged.map(row => (
              <div key={row.id} style={{
                display:'flex', alignItems:'center', gap:'0.75rem',
                padding:'0.65rem 1rem',
                background: mode === row.id ? '#1a1a1a' : A.card,
                border:`1px solid ${mode === row.id ? A.warn : A.border}`,
                borderRadius: A.radius,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.82rem', color: A.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', fontWeight:500 }}>
                    {row[labelField]}
                  </div>
                  <div style={{ fontSize:'0.65rem', color: A.dim, marginTop:'2px' }}>{row.id}</div>
                </div>
                <div style={{ display:'flex', gap:'0.3rem', alignItems:'center', flexShrink:0 }}>
                  {row.severity && (
                    <span style={{ fontSize:'0.65rem', color: SEV_COLOR[row.severity]||'#888',
                      border:`1px solid ${(SEV_COLOR[row.severity]||'#888')}44`, padding:'2px 8px', borderRadius:'3px' }}>
                      {row.severity}
                    </span>
                  )}
                  {row.category && (
                    <span style={{ fontSize:'0.65rem', color: A.dim, background:'#1a1a1a', padding:'2px 8px', borderRadius:'3px',
                      maxWidth:'120px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {row.category}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', gap:'0.3rem', flexShrink:0 }}>
                  <Btn variant="ghost" onClick={() => { setMode(row.id); window.scrollTo(0, 0) }}
                    style={{ padding:'4px 10px', fontSize:'0.65rem' }}>Edit</Btn>
                  <Btn variant="warn" onClick={() => { setDupData({...row, id: row.id + '-copy'}); setMode('add'); window.scrollTo(0, 0) }}
                    style={{ padding:'4px 10px', fontSize:'0.65rem' }}>Dup</Btn>
                  <Btn variant="danger" onClick={() => setConfirm(row.id)}
                    style={{ padding:'4px 10px', fontSize:'0.65rem' }}>✕</Btn>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', gap:'0.5rem', marginTop:'1rem', alignItems:'center' }}>
              <Btn variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{ padding:'4px 12px', fontSize:'0.7rem' }}>← Prev</Btn>
              <span style={{ fontSize:'0.72rem', color: A.dim }}>
                Page {page + 1} of {totalPages}
              </span>
              <Btn variant="ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                style={{ padding:'4px 12px', fontSize:'0.7rem' }}>Next →</Btn>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [svcKey, setSvcKey] = useState('')
  const [err, setErr]     = useState('')
  const [shake, setShake] = useState(false)

  const doShake = msg => { setErr(msg); setShake(true); setTimeout(() => setShake(false), 400) }

  const submitKey = async e => {
    e.preventDefault()
    if (!svcKey.startsWith('eyJ') || svcKey.split('.').length !== 3) { doShake('Invalid service role key'); return }
    // Verify the key actually works by attempting a read
    const client = createClient(SUPABASE_URL, svcKey, { auth: { persistSession: false } })
    const { error } = await client.from('techniques').select('id').limit(1)
    if (error) { doShake('Key rejected by Supabase'); return }
    getAdminClient(svcKey)
    onLogin()
  }

  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh', background: A.bg }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      <div style={{
        border:`1px solid ${err ? A.danger : A.border}`, padding:'3rem', minWidth:'360px',
        background: A.card, transition:'border-color 0.2s', borderRadius:'6px',
        animation: shake ? 'shake 0.3s ease' : 'none',
        boxShadow: err ? `0 0 30px ${A.danger}22` : '0 4px 40px #00000066',
      }}>
        <div style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <div style={{ fontSize:'2.5rem' }}>🔑</div>
          <div style={{ fontSize:'1.1rem', color: A.accent, fontWeight:700, marginTop:'0.75rem' }}>Admin Access</div>
          <div style={{ fontSize:'0.72rem', color: A.dim, marginTop:'6px' }}>Paste your Supabase service role key</div>
        </div>

        <form onSubmit={submitKey}>
          <div style={{ marginBottom:'1.25rem' }}>
            <div style={{ fontSize:'0.72rem', color: A.muted, marginBottom:'6px', fontWeight:600 }}>SERVICE ROLE KEY</div>
            <Inp type="password" value={svcKey} onChange={setSvcKey} placeholder="eyJhbGci..." />
            <div style={{ fontSize:'0.65rem', color: A.dim, marginTop:'6px' }}>Required for write access. Never stored — memory only.</div>
          </div>
          {err && <div style={{ fontSize:'0.75rem', color: A.danger, marginBottom:'1rem' }}>⚠ {err}</div>}
          <Btn type="submit" style={{ width:'100%', padding:'0.6rem', fontSize:'0.85rem' }}>Authenticate →</Btn>
        </form>
      </div>
    </div>
  )
}

// ── Main Admin Panel ──────────────────────────────────────────────────────────
export default function AdminPanel() {
  const [authed, setAuthed]           = useState(() => sessionStorage.getItem('htb-admin') === '1' && !!_adminClient)
  const [activeTable, setActiveTable] = useState(TABLES[0])
  const [stats, setStats]             = useState({})

  const login  = () => { sessionStorage.setItem('htb-admin', '1'); setAuthed(true) }
  const logout = () => { sessionStorage.removeItem('htb-admin'); _adminClient = null; setAuthed(false) }

  const loadStats = () => {
    if (!authed) return
    Promise.all(
      TABLES.map(t =>
        supabase.from(t.key).select('id', { count:'exact', head:true }).then(({ count }) => [t.key, count || 0])
      )
    ).then(entries => setStats(Object.fromEntries(entries)))
  }

  useEffect(() => { loadStats() }, [authed])

  if (!authed) return <Login onLogin={login} />

  return (
    <div style={{ display:'flex', minHeight:'100vh', background: A.bg }}>
      {/* Sidebar */}
      <div style={{ width:'220px', background:'#090909', borderRight:`1px solid ${A.border}`, padding:'1.25rem 0', flexShrink:0, overflowY:'auto' }}>
        <div style={{ padding:'0 1rem 1rem', borderBottom:`1px solid ${A.border}`, marginBottom:'0.75rem' }}>
          <div style={{ fontSize:'1rem', color: A.accent, fontWeight:700, letterSpacing:'0.05em' }}>⚙ ADMIN</div>
          <div style={{ fontSize:'0.65rem', color: A.dim, marginTop:'4px' }}>
            {Object.values(stats).reduce((a, b) => a + (b || 0), 0)} total records
          </div>
        </div>
        {TABLES.map(t => (
          <button key={t.key} onClick={() => setActiveTable(t)} style={{
            width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center',
            padding:'0.6rem 1rem', background: activeTable.key === t.key ? '#151515' : 'transparent',
            border:'none', borderLeft: activeTable.key === t.key ? `3px solid ${A.accent}` : '3px solid transparent',
            color: activeTable.key === t.key ? A.text : A.muted,
            fontFamily: A.font, fontSize:'0.72rem', cursor:'pointer', transition:'all 0.1s', textAlign:'left',
          }}>
            <span>{t.label}</span>
            <span style={{ fontSize:'0.65rem', color: A.dim, background:'#1a1a1a', padding:'1px 6px', borderRadius:'3px' }}>
              {stats[t.key] ?? '—'}
            </span>
          </button>
        ))}
        <div style={{ padding:'1rem', borderTop:`1px solid ${A.border}`, marginTop:'0.75rem' }}>
          <Btn variant="ghost" onClick={loadStats} style={{ width:'100%', marginBottom:'0.5rem', fontSize:'0.65rem' }}>↻ Refresh</Btn>
          <Btn variant="danger" onClick={logout} style={{ width:'100%', fontSize:'0.65rem' }}>⏻ Logout</Btn>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, padding:'2rem', overflowY:'auto' }}>
        <div style={{ maxWidth:'900px' }}>
          <div style={{ marginBottom:'1.5rem' }}>
            <h1 style={{ fontSize:'1.3rem', color: A.text, fontWeight:700, margin:0 }}>{activeTable.label}</h1>
            <p style={{ fontSize:'0.75rem', color: A.dim, margin:'4px 0 0' }}>{stats[activeTable.key] ?? 0} records in this table</p>
          </div>
          <TableManager key={activeTable.key} table={activeTable} />
        </div>
      </div>
    </div>
  )
}
