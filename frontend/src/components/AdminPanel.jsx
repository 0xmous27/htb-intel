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
]

const TEXTAREA_FIELDS = ['description','steps','payload','command','exploit','install','usage','cmd','affected','enum_cmd','pattern','items','attacks','cves_list','notes','manual','purpose','when_to_use','setup','note']
const ARRAY_FIELDS = ['tags']
const SEV_COLOR = { CRITICAL:'#ff3333', HIGH:'#ff9900', MEDIUM:'#ffcc00', LOW:'#00ff99', INFO:'#4488ff' }
const S = { panel:'#080808', border:'#151515', text:'#ccc', muted:'#555', faint:'#111', font:'inherit' }

// ── Primitives ────────────────────────────────────────────────────────────────
function Inp({ value, onChange, placeholder, type = 'text', style = {} }) {
  return (
    <input type={type} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ background:'#030303', border:'1px solid #1a1a1a', color:S.text, fontFamily:S.font,
        fontSize:'0.7rem', padding:'0.4rem 0.6rem', outline:'none', width:'100%', boxSizing:'border-box', ...style }}
      onFocus={e => e.target.style.borderColor='var(--neon)'}
      onBlur={e => e.target.style.borderColor='#1a1a1a'} />
  )
}

function Txta({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={rows}
      style={{ background:'#030303', border:'1px solid #1a1a1a', color:S.text, fontFamily:S.font,
        fontSize:'0.68rem', padding:'0.4rem 0.6rem', outline:'none', width:'100%', boxSizing:'border-box', resize:'vertical', lineHeight:1.5 }}
      onFocus={e => e.target.style.borderColor='var(--neon)'}
      onBlur={e => e.target.style.borderColor='#1a1a1a'} />
  )
}

function Sel({ value, onChange, options, placeholder }) {
  return (
    <select value={value ?? ''} onChange={e => onChange(e.target.value)}
      style={{ background:'#030303', border:'1px solid #1a1a1a', color: value ? S.text : S.muted, fontFamily:S.font,
        fontSize:'0.7rem', padding:'0.4rem 0.6rem', outline:'none', width:'100%', boxSizing:'border-box', cursor:'pointer' }}
      onFocus={e => e.target.style.borderColor='var(--neon)'}
      onBlur={e => e.target.style.borderColor='#1a1a1a'}>
      <option value="">{placeholder || '— select —'}</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  )
}

function Btn({ children, onClick, variant = 'primary', disabled, type = 'button', style = {} }) {
  const v = {
    primary: { borderColor:'var(--neon)', color:'var(--neon)' },
    danger:  { borderColor:'#ff333355', color:'#ff3333' },
    ghost:   { borderColor:'#222', color:'#555' },
    warn:    { borderColor:'#ff990055', color:'#ff9900' },
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      style={{ background:'none', border:'1px solid', fontFamily:S.font, fontSize:'0.62rem',
        padding:'0.35rem 0.9rem', cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1, transition:'all 0.15s', ...v[variant], ...style }}>
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
        style={{ fontSize:'0.48rem', color:'#333', border:'1px solid #222', borderRadius:'50%',
          width:'12px', height:'12px', display:'inline-flex', alignItems:'center', justifyContent:'center',
          cursor:'help', userSelect:'none', lineHeight:1 }}>?</span>
      {show && (
        <div style={{ position:'absolute', left:'16px', top:'-4px', zIndex:9999, background:'#0d0d0d',
          border:'1px solid #2a2a2a', color:'#aaa', fontSize:'0.6rem', padding:'0.5rem 0.75rem',
          width:'220px', lineHeight:1.5, pointerEvents:'none', boxShadow:'0 4px 20px #000' }}>
          {text}
        </div>
      )}
    </span>
  )
}

function Toast({ msg }) {
  if (!msg) return null
  const c = msg.ok ? 'var(--neon)' : '#ff3333'
  return (
    <div style={{ position:'fixed', bottom:'1.5rem', right:'1.5rem', zIndex:9999,
      background:'#050505', border:`1px solid ${c}`, color:c,
      padding:'0.6rem 1.2rem', fontSize:'0.65rem', boxShadow:`0 0 20px ${c}22` }}>
      {msg.text}
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
              <div style={{ fontSize:'0.52rem', color: req ? 'var(--neon)' : S.muted, marginBottom:'3px',
                letterSpacing:'0.05em', display:'flex', alignItems:'center', gap:'2px' }}>
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
        <div style={{ position:'fixed', inset:0, background:'#000000cc', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ background:'#0a0a0a', border:'1px solid #ff333355', padding:'1.5rem', minWidth:'300px' }}>
            <div style={{ fontSize:'0.7rem', color:'#ff3333', marginBottom:'0.5rem' }}>⚠ CONFIRM DELETE</div>
            <div style={{ fontSize:'0.62rem', color:S.muted, marginBottom:'1rem' }}>
              Delete <span style={{ color:S.text }}>{confirm}</span>? This cannot be undone.
            </div>
            <div style={{ display:'flex', gap:'0.5rem' }}>
              <Btn variant="danger" onClick={() => remove(confirm)}>DELETE</Btn>
              <Btn variant="ghost" onClick={() => setConfirm(null)}>CANCEL</Btn>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ display:'flex', gap:'0.5rem', marginBottom:'1rem', alignItems:'center', flexWrap:'wrap' }}>
        <Inp value={search} onChange={v => { setSearch(v); setPage(0) }}
          placeholder={`search ${table.label}...`} style={{ flex:1, minWidth:'160px' }} />
        <span style={{ fontSize:'0.52rem', color:S.muted, whiteSpace:'nowrap' }}>
          {filtered.length}/{rows.length} records
        </span>
        <Btn onClick={() => { setMode('add'); window.scrollTo(0, 0) }} style={{ whiteSpace:'nowrap' }}>+ ADD NEW</Btn>
      </div>

      {/* Add form */}
      {mode === 'add' && (
        <div style={{ border:'1px solid var(--neon)', padding:'1.25rem', marginBottom:'1rem', background:S.panel }}>
          <div style={{ fontSize:'0.6rem', color:'var(--neon)', marginBottom:'0.75rem', letterSpacing:'0.1em' }}>
            NEW RECORD — {table.label}
          </div>
          <RecordForm table={table} initial={null} onSave={save} onCancel={() => setMode(null)} saving={saving} />
        </div>
      )}

      {/* Edit form */}
      {editingRow && (
        <div style={{ border:'1px solid #ff990044', padding:'1.25rem', marginBottom:'1rem', background:S.panel }}>
          <div style={{ fontSize:'0.6rem', color:'#ff9900', marginBottom:'0.75rem', letterSpacing:'0.1em' }}>
            EDITING: {editingRow.id}
          </div>
          <RecordForm table={table} initial={editingRow} onSave={save} onCancel={() => setMode(null)} saving={saving} />
        </div>
      )}

      {/* Records list */}
      {loading ? (
        <div style={{ fontSize:'0.65rem', color:S.muted, padding:'2rem', textAlign:'center' }}>LOADING...</div>
      ) : filtered.length === 0 ? (
        <div style={{ fontSize:'0.65rem', color:S.muted, padding:'2rem', textAlign:'center', border:'1px dashed #111' }}>
          {rows.length === 0 ? 'No records yet — click + ADD NEW' : 'No results for "' + search + '"'}
        </div>
      ) : (
        <>
          <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
            {paged.map(row => (
              <div key={row.id} style={{
                display:'flex', alignItems:'center', gap:'0.5rem',
                padding:'0.45rem 0.75rem',
                background: mode === row.id ? '#0d0d0d' : S.panel,
                border:`1px solid ${mode === row.id ? '#ff990044' : S.border}`,
              }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.68rem', color:S.text, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {row[labelField]}
                  </div>
                  <div style={{ fontSize:'0.52rem', color:S.muted }}>{row.id}</div>
                </div>
                <div style={{ display:'flex', gap:'0.25rem', alignItems:'center', flexShrink:0 }}>
                  {row.severity && (
                    <span style={{ fontSize:'0.5rem', color:SEV_COLOR[row.severity]||'#888',
                      border:`1px solid ${(SEV_COLOR[row.severity]||'#888')}33`, padding:'1px 5px' }}>
                      {row.severity}
                    </span>
                  )}
                  {row.category && (
                    <span style={{ fontSize:'0.5rem', color:S.muted, border:'1px solid #1a1a1a', padding:'1px 5px',
                      maxWidth:'100px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {row.category}
                    </span>
                  )}
                  {row.bounty && (
                    <span style={{ fontSize:'0.5rem', color:'#00ff99', border:'1px solid #00ff9933', padding:'1px 5px' }}>
                      {row.bounty}
                    </span>
                  )}
                </div>
                <div style={{ display:'flex', gap:'0.25rem', flexShrink:0 }}>
                  <Btn variant="ghost" onClick={() => { setMode(row.id); window.scrollTo(0, 0) }}
                    style={{ padding:'2px 8px', fontSize:'0.52rem' }}>✏ EDIT</Btn>
                  <Btn variant="danger" onClick={() => setConfirm(row.id)}
                    style={{ padding:'2px 8px', fontSize:'0.52rem' }}>🗑 DEL</Btn>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', gap:'0.3rem', marginTop:'0.75rem', alignItems:'center' }}>
              <Btn variant="ghost" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                style={{ padding:'2px 8px', fontSize:'0.52rem' }}>← PREV</Btn>
              <span style={{ fontSize:'0.52rem', color:S.muted }}>
                Page {page + 1} / {totalPages}
              </span>
              <Btn variant="ghost" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                style={{ padding:'2px 8px', fontSize:'0.52rem' }}>NEXT →</Btn>
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
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'80vh' }}>
      <style>{`@keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-8px)}75%{transform:translateX(8px)}}`}</style>
      <div style={{
        border:`1px solid ${err ? '#ff3333' : '#1a1a1a'}`, padding:'2.5rem', minWidth:'320px',
        background:'#050505', transition:'border-color 0.2s',
        animation: shake ? 'shake 0.3s ease' : 'none',
        boxShadow: err ? '0 0 30px #ff333322' : '0 0 40px #00000099',
      }}>
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ fontSize:'2rem' }}>🔑</div>
          <div style={{ fontSize:'0.8rem', color:'var(--neon)', letterSpacing:'0.2em', marginTop:'0.5rem' }}>ADMIN ACCESS</div>
          <div style={{ fontSize:'0.52rem', color:S.muted, marginTop:'3px' }}>Paste your Supabase service role key</div>
        </div>

        <form onSubmit={submitKey}>
          <div style={{ marginBottom:'1rem' }}>
            <div style={{ fontSize:'0.52rem', color:S.muted, marginBottom:'4px' }}>SERVICE ROLE KEY</div>
            <Inp type="password" value={svcKey} onChange={setSvcKey} placeholder="eyJhbGci..." />
            <div style={{ fontSize:'0.5rem', color:'#333', marginTop:'4px' }}>Required for write access. Never stored — memory only.</div>
          </div>
          {err && <div style={{ fontSize:'0.6rem', color:'#ff3333', marginBottom:'0.75rem' }}>⚠ {err}</div>}
          <Btn type="submit" style={{ width:'100%' }}>AUTHENTICATE →</Btn>
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
    <div style={{ padding:'1.5rem', maxWidth:'1200px' }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
        marginBottom:'1.5rem', paddingBottom:'1rem', borderBottom:'1px solid #111' }}>
        <div>
          <div style={{ fontSize:'0.85rem', color:'var(--neon)', letterSpacing:'0.15em' }}>⚙ ADMIN PANEL</div>
          <div style={{ fontSize:'0.52rem', color:S.muted, marginTop:'2px' }}>HTB Intel — Content Management System</div>
        </div>
        <div style={{ display:'flex', gap:'0.5rem', alignItems:'center' }}>
          <Btn variant="ghost" onClick={loadStats} style={{ fontSize:'0.52rem', padding:'0.25rem 0.6rem' }}>↻ REFRESH STATS</Btn>
          <Btn variant="ghost" onClick={logout}>LOGOUT</Btn>
        </div>
      </div>

      {/* Stats dashboard */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', marginBottom:'1.5rem' }}>
        {TABLES.map(t => (
          <div key={t.key}
            onClick={() => setActiveTable(t)}
            style={{ background: activeTable.key === t.key ? '#0d0d0d' : S.panel,
              border:`1px solid ${activeTable.key === t.key ? 'var(--neon)' : '#111'}`,
              padding:'0.5rem 0.9rem', minWidth:'80px', cursor:'pointer', transition:'all 0.15s' }}>
            <div style={{ fontSize:'0.5rem', color: activeTable.key === t.key ? 'var(--neon)' : S.muted }}>{t.label}</div>
            <div style={{ fontSize:'1rem', color:'var(--neon)', fontWeight:700 }}>{stats[t.key] ?? '—'}</div>
          </div>
        ))}
      </div>

      {/* Table tabs */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:'0.3rem', marginBottom:'1.25rem' }}>
        {TABLES.map(t => (
          <button key={t.key} onClick={() => setActiveTable(t)} style={{
            background: activeTable.key === t.key ? '#0d0d0d' : 'none',
            border:`1px solid ${activeTable.key === t.key ? 'var(--neon)' : '#1a1a1a'}`,
            color: activeTable.key === t.key ? 'var(--neon)' : S.muted,
            fontFamily:S.font, fontSize:'0.6rem', padding:'0.3rem 0.8rem', cursor:'pointer', transition:'all 0.15s',
          }}>{t.label}</button>
        ))}
      </div>

      <TableManager key={activeTable.key} table={activeTable} />
    </div>
  )
}
