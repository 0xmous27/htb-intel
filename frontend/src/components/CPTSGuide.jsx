import { useState } from 'react'

const SECTIONS = [
  {
    id: 'overview',
    title: '📋 EXAM OVERVIEW',
    content: [
      {
        type: 'info',
        items: [
          { label: 'Duration', value: '10 days (240 hours) — no breaks required' },
          { label: 'Format', value: 'Black-box penetration test of a simulated enterprise network' },
          { label: 'Passing Score', value: '85 out of 100 points' },
          { label: 'Report', value: 'Required — professional pentest report submitted after hacking' },
          { label: 'Retakes', value: '14-day waiting period between attempts' },
          { label: 'Proctored', value: 'No — fully self-paced, honor-based' },
          { label: 'Network', value: 'Multiple machines, Active Directory, internal pivoting required' },
        ]
      },
      {
        type: 'warning',
        text: 'The exam is NOT a CTF. It simulates a real engagement. Methodology, documentation, and report quality matter as much as the flags.'
      }
    ]
  },
  {
    id: 'prereqs',
    title: '📚 PREREQUISITES',
    content: [
      {
        type: 'text',
        text: 'Complete ALL 28 HTB Academy CPTS path modules before attempting. Do not skip. The exam tests everything.'
      },
      {
        type: 'modules',
        items: [
          { name: 'Penetration Testing Process', critical: true },
          { name: 'Getting Started', critical: true },
          { name: 'Network Enumeration with Nmap', critical: true },
          { name: 'Footprinting', critical: true },
          { name: 'Information Gathering - Web Edition', critical: false },
          { name: 'Vulnerability Assessment', critical: false },
          { name: 'File Transfers', critical: true },
          { name: 'Shells & Payloads', critical: true },
          { name: 'Using the Metasploit Framework', critical: false },
          { name: 'Password Attacks', critical: true },
          { name: 'Attacking Common Services', critical: true },
          { name: 'Pivoting, Tunneling & Port Forwarding', critical: true },
          { name: 'Active Directory Enumeration & Attacks', critical: true },
          { name: 'Using Web Proxies', critical: false },
          { name: 'Attacking Web Apps with Ffuf', critical: false },
          { name: 'Login Brute Forcing', critical: false },
          { name: 'SQL Injection Fundamentals', critical: true },
          { name: 'SQLMap Essentials', critical: false },
          { name: 'Cross-Site Scripting (XSS)', critical: false },
          { name: 'File Inclusion', critical: true },
          { name: 'File Upload Attacks', critical: true },
          { name: 'Command Injections', critical: true },
          { name: 'Web Attacks', critical: true },
          { name: 'Attacking Common Applications', critical: true },
          { name: 'Linux Privilege Escalation', critical: true },
          { name: 'Windows Privilege Escalation', critical: true },
          { name: 'Documentation & Reporting', critical: true },
          { name: 'Attacking Enterprise Networks', critical: true },
        ]
      }
    ]
  },
  {
    id: 'strategy',
    title: '🧠 EXAM STRATEGY',
    content: [
      {
        type: 'phases',
        phases: [
          {
            name: 'Day 1-2: Recon & Enumeration',
            color: 'var(--neon)',
            steps: [
              'Run full nmap scan on all provided IPs immediately — let it run in background',
              'Document every open port, service, version in your notes',
              'Identify the domain name, DC IP, and OS types',
              'Run gobuster/ffuf on all web services found',
              'Check for anonymous access: FTP, SMB, LDAP, NFS',
              'Run enum4linux-ng on all SMB hosts',
              'Attempt null session LDAP bind to enumerate AD users',
              'Screenshot everything — you need it for the report',
            ]
          },
          {
            name: 'Day 2-4: Initial Foothold',
            color: '#00ccff',
            steps: [
              'Attack web applications first — they are usually the entry point',
              'Test every parameter for SQLi, LFI, command injection, file upload',
              'Check for default credentials on all services (Tomcat, Jenkins, etc.)',
              'Try password spraying with common passwords against SMB/WinRM',
              'Exploit any vulnerable service versions found in nmap',
              'Get at least one shell before moving on',
              'Upgrade your shell to a full TTY immediately',
            ]
          },
          {
            name: 'Day 4-6: Internal Enumeration',
            color: '#ff9900',
            steps: [
              'From your foothold, enumerate the internal network',
              'Set up pivoting (chisel/ligolo) to reach internal hosts',
              'Run BloodHound collection from any domain user context',
              'Kerberoast all service accounts with SPNs',
              'ASREPRoast users with pre-auth disabled',
              'Check for password reuse across all found credentials',
              'Enumerate all internal web apps and services',
              'Look for credentials in files, configs, history, databases',
            ]
          },
          {
            name: 'Day 6-8: Privilege Escalation',
            color: '#ff6600',
            steps: [
              'Run linpeas/winpeas on every compromised host',
              'Check sudo -l on every Linux shell',
              'Check SeImpersonatePrivilege on Windows (PrintSpoofer/GodPotato)',
              'Exploit BloodHound attack paths (ACL abuse, delegation)',
              'Crack all captured hashes (Kerberoast, NTLM, NetNTLMv2)',
              'Attempt DCSync once you have sufficient AD privileges',
              'Dump LSASS / SAM on every Windows host you admin',
            ]
          },
          {
            name: 'Day 8-9: Cleanup & Flags',
            color: '#ff3333',
            steps: [
              'Ensure you have all flags — re-enumerate if missing any',
              'Verify you have screenshots for every finding',
              'Document the full attack chain for each compromised host',
              'Note exact commands used, timestamps, and outputs',
              'Verify your notes are complete enough to write the report',
            ]
          },
          {
            name: 'Day 9-10: Report Writing',
            color: '#aa44ff',
            steps: [
              'Use the HTB report template or a professional one',
              'Executive Summary: business impact, risk level, key findings',
              'Technical findings: one section per vulnerability',
              'Each finding needs: description, evidence (screenshot), CVSS score, remediation',
              'Attack chain narrative: tell the story of the compromise',
              'Proofread — grammar and clarity matter for passing',
              'Submit before the deadline — do not rush the report',
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'tips',
    title: '💡 PRO TIPS',
    content: [
      {
        type: 'tips',
        categories: [
          {
            name: 'Mindset',
            tips: [
              'Enumerate more than you think you need to. Most failures come from missing something obvious.',
              'If stuck for 2+ hours on one thing, move to another target and come back.',
              'The exam is designed to be completed — if you did the path, you have the knowledge.',
              'Take breaks. Sleep. A fresh mind finds what an exhausted one misses.',
              'Do not Google for exam-specific hints — it violates the honor policy.',
            ]
          },
          {
            name: 'Technical',
            tips: [
              'Always run nmap with -oN to save output — you will reference it constantly.',
              'Keep a running notes file with every IP, port, credential, and finding.',
              'Set up your pivot (chisel/ligolo) early — you will need it.',
              'When you find credentials, immediately try them on ALL other services.',
              'Check for password reuse — it is extremely common in the exam.',
              'BloodHound is essential for AD — run it as soon as you have a domain user.',
              'If a service is running as SYSTEM or root, it is likely exploitable.',
              'Read error messages carefully — they often reveal paths and versions.',
            ]
          },
          {
            name: 'Report',
            tips: [
              'Start taking screenshots from minute one — you cannot go back.',
              'Screenshot: the vulnerability, the exploit command, and the proof (whoami/hostname).',
              'Each finding needs: title, severity, description, steps to reproduce, evidence, remediation.',
              'CVSS scores: use the official CVSS calculator for accuracy.',
              'The report is worth points — a poor report can fail you even with all flags.',
              'Use clear, professional language. Avoid slang.',
            ]
          },
          {
            name: 'Common Mistakes',
            tips: [
              'Skipping UDP scans — SNMP on UDP 161 is often the key.',
              'Not checking FTP/SMB for anonymous access early.',
              'Forgetting to pivot — many hosts are only reachable internally.',
              'Not cracking hashes — Kerberoast tickets are often crackable with rockyou.',
              'Rushing the report — many people fail on report quality, not technical skill.',
              'Not reading the exam letter carefully — it contains critical scope information.',
            ]
          },
        ]
      }
    ]
  },
  {
    id: 'tools',
    title: '🔧 EXAM TOOLKIT',
    content: [
      {
        type: 'toolkit',
        groups: [
          { name: 'Must Have', color: 'var(--neon)', tools: ['nmap', 'gobuster/ffuf', 'burpsuite', 'crackmapexec', 'impacket suite', 'bloodhound + sharphound', 'chisel or ligolo-ng', 'linpeas + winpeas', 'hashcat + john', 'evil-winrm'] },
          { name: 'Web', color: '#00ccff', tools: ['sqlmap', 'nikto', 'wfuzz', 'feroxbuster', 'whatweb'] },
          { name: 'AD', color: '#ff9900', tools: ['kerbrute', 'rubeus', 'mimikatz', 'powerview', 'adpeas'] },
          { name: 'Shells', color: '#ff6600', tools: ['msfvenom', 'revshells.com', 'pwncat-cs', 'netcat'] },
          { name: 'Reporting', color: '#aa44ff', tools: ['HTB report template', 'Sysreptor', 'Ghostwriter', 'pwndoc'] },
        ]
      }
    ]
  },
  {
    id: 'checklist',
    title: '✅ PRE-EXAM CHECKLIST',
    content: [
      {
        type: 'checklist',
        items: [
          'Completed all 28 CPTS path modules',
          'Practiced on at least 20 HTB machines (mix of Linux/Windows)',
          'Completed the "Attacking Enterprise Networks" module fully',
          'Comfortable with AD attacks (Kerberoast, BloodHound, DCSync)',
          'Comfortable with pivoting (chisel, proxychains, SSH tunnels)',
          'Have a report template ready before starting',
          'Have a notes template ready (IP table, creds table, findings)',
          'Kali/Parrot fully updated with all tools installed',
          'VPN connection tested and stable',
          'Read the exam rules and scope document',
          'Planned your 10 days (when to work, when to sleep)',
        ]
      }
    ]
  },
]

export default function CPTSGuide() {
  const [active, setActive] = useState('overview')
  const [checked, setChecked] = useState({})

  const section = SECTIONS.find(s => s.id === active)

  const renderContent = (block, i) => {
    switch (block.type) {
      case 'info':
        return (
          <div key={i}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', marginBottom: '1rem' }}>
              <tbody>
                {block.items.map(item => (
                  <tr key={item.label} style={{ borderBottom: '1px solid #111' }}>
                    <td style={{ padding: '0.5rem 0.75rem', color: '#aaa', width: '140px', letterSpacing: '0.05em' }}>{item.label}</td>
                    <td style={{ padding: '0.5rem 0.75rem', color: 'var(--neon)' }}>{item.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {block.warning && (
              <div style={{ background: '#0a0500', border: '1px solid #2a1000', borderLeft: '3px solid #ff9900', padding: '0.75rem 1rem', fontSize: '0.72rem', color: '#aaa' }}>
                ⚠ {block.warning}
              </div>
            )}
          </div>
        )
      case 'warning':
        return (
          <div key={i} style={{ background: '#0a0500', border: '1px solid #2a1000', borderLeft: '3px solid #ff9900', padding: '0.75rem 1rem', fontSize: '0.72rem', color: '#aaa', marginBottom: '1rem' }}>
            ⚠ {block.text}
          </div>
        )
      case 'text':
        return <p key={i} style={{ fontSize: '0.75rem', color: '#777', marginBottom: '1rem', lineHeight: 1.6 }}>{block.text}</p>
      case 'modules':
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '0.3rem' }}>
            {block.items.map(m => (
              <div key={m.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.5rem', background: '#0d0d0d', border: `1px solid ${m.critical ? '#1a2a1a' : '#111'}` }}>
                <span style={{ color: m.critical ? '#00ff99' : '#333', fontSize: '0.7rem' }}>{m.critical ? '★' : '○'}</span>
                <span style={{ fontSize: '0.7rem', color: m.critical ? '#888' : '#444' }}>{m.name}</span>
                {m.critical && <span style={{ marginLeft: 'auto', fontSize: '0.55rem', color: 'var(--neon-dim)', border: '1px solid #1a3a1a', padding: '0 4px' }}>KEY</span>}
              </div>
            ))}
          </div>
        )
      case 'phases':
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {block.phases.map(phase => (
              <div key={phase.name} style={{ border: `1px solid ${phase.color}22`, borderLeft: `3px solid ${phase.color}`, background: '#0d0d0d', padding: '0.75rem 1rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: phase.color, marginBottom: '0.5rem' }}>{phase.name}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {phase.steps.map((s, j) => (
                    <li key={j} style={{ fontSize: '0.7rem', color: '#777', padding: '3px 0', display: 'flex', gap: '0.5rem' }}>
                      <span style={{ color: phase.color, flexShrink: 0 }}>›</span>{s}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      case 'tips':
        return (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {block.categories.map(cat => (
              <div key={cat.name} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '0.75rem' }}>
                <div className="meta-label" style={{ marginBottom: '0.5rem', color: 'var(--neon-dim)' }}>{cat.name}</div>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {cat.tips.map((t, j) => (
                    <li key={j} style={{ fontSize: '0.68rem', color: '#ccc', padding: '3px 0', borderBottom: '1px solid #0d0d0d', display: 'flex', gap: '0.5rem', lineHeight: 1.4 }}>
                      <span style={{ color: '#888', flexShrink: 0 }}>•</span>{t}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )
      case 'toolkit':
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {block.groups.map(g => (
              <div key={g.name} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0.75rem', background: '#0d0d0d', border: '1px solid #1a1a1a' }}>
                <span style={{ fontSize: '0.65rem', color: g.color, width: '90px', flexShrink: 0, letterSpacing: '0.1em' }}>{g.name}</span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                  {g.tools.map(t => (
                    <span key={t} style={{ fontSize: '0.65rem', border: `1px solid ${g.color}44`, color: g.color, padding: '1px 6px' }}>{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )
      case 'checklist':
        return (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
            {block.items.map(item => {
              const done = !!checked[item]
              return (
                <div key={item} onClick={() => setChecked(p => ({ ...p, [item]: !p[item] }))}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.4rem 0.75rem', cursor: 'pointer', borderLeft: `2px solid ${done ? 'var(--neon)' : '#1a1a1a'}`, background: done ? 'rgba(0,0,0,0.2)' : 'transparent', transition: 'all 0.15s' }}>
                  <span style={{ color: done ? 'var(--neon)' : '#888', fontSize: '0.8rem' }}>{done ? '☑' : '☐'}</span>
                  <span style={{ fontSize: '0.72rem', color: done ? '#777' : '#ccc', textDecoration: done ? 'line-through' : 'none' }}>{item}</span>
                </div>
              )
            })}
            <div style={{ fontSize: '0.65rem', color: '#888', marginTop: '0.5rem' }}>
              {Object.values(checked).filter(Boolean).length}/{block.items.length} ready
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      {/* Nav */}
      <div style={{ width: '200px', flexShrink: 0 }}>
        <div style={{ fontSize: '0.6rem', color: '#888', letterSpacing: '0.15em', marginBottom: '0.75rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1a1a1a' }}>CPTS EXAM GUIDE</div>
        {SECTIONS.map(s => (
          <button key={s.id} onClick={() => setActive(s.id)}
            style={{ width: '100%', border: 'none', borderLeft: `2px solid ${active === s.id ? 'var(--neon)' : 'transparent'}`, color: active === s.id ? 'var(--neon)' : '#aaa', fontFamily: 'inherit', fontSize: '0.7rem', padding: '0.5rem 0.75rem', textAlign: 'left', cursor: 'pointer', background: active === s.id ? 'rgba(0,0,0,0.2)' : 'none' }}>
            {s.title}
          </button>
        ))}

        <div style={{ marginTop: '1.5rem', padding: '0.75rem', background: '#0a0500', border: '1px solid #2a1000', fontSize: '0.65rem', color: '#bbb', lineHeight: 1.6 }}>
          <div style={{ color: '#ff9900', marginBottom: '0.4rem' }}>⚠ REMEMBER</div>
          Pass = 85/100 pts<br />
          10 days total<br />
          Report is mandatory<br />
          No hints allowed
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--neon)', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid #1a1a1a' }}>
          {section.title}
        </div>
        {section.content.map((block, i) => renderContent(block, i))}
      </div>
    </div>
  )
}
