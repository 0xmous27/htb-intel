import { useState } from 'react'
import { useSupabaseData } from '../hooks/useSupabaseData'

// Static port data as fallback
const STATIC_PORTS = [
  { id: 'p21',   port: '21',    service: 'FTP',           protocol: 'TCP', description: 'File Transfer Protocol', tags: ['Anonymous login','Brute force','Bounce attack','Cleartext sniff'] },
  { id: 'p22',   port: '22',    service: 'SSH',           protocol: 'TCP', description: 'Secure Shell', tags: ['Brute force','Key exploitation','User enumeration (CVE-2018-15473)'] },
  { id: 'p23',   port: '23',    service: 'Telnet',        protocol: 'TCP', description: 'Unencrypted remote shell', tags: ['Cleartext sniff','Brute force','MITM'] },
  { id: 'p25',   port: '25',    service: 'SMTP',          protocol: 'TCP', description: 'Email sending', tags: ['User enumeration (VRFY/EXPN)','Open relay','Brute force'] },
  { id: 'p53',   port: '53',    service: 'DNS',           protocol: 'TCP/UDP', description: 'Domain Name System', tags: ['Zone transfer (AXFR)','Subdomain brute force','Cache poisoning'] },
  { id: 'p80',   port: '80',    service: 'HTTP',          protocol: 'TCP', description: 'Web server', tags: ['Dir brute force','SQLi/XSS/LFI/RFI','Default creds'] },
  { id: 'p88',   port: '88',    service: 'Kerberos',      protocol: 'TCP', description: 'AD authentication', tags: ['Kerberoasting','ASREPRoasting','Pass-the-Ticket'] },
  { id: 'p110',  port: '110',   service: 'POP3',          protocol: 'TCP', description: 'Email retrieval', tags: ['Brute force','Cleartext sniff'] },
  { id: 'p111',  port: '111',   service: 'RPCBind',       protocol: 'TCP/UDP', description: 'RPC port mapper', tags: ['NFS enumeration','Service discovery'] },
  { id: 'p135',  port: '135',   service: 'MSRPC',         protocol: 'TCP', description: 'Microsoft RPC', tags: ['User enumeration','DCOM lateral movement'] },
  { id: 'p139',  port: '139',   service: 'NetBIOS-SSN',   protocol: 'TCP', description: 'NetBIOS session service', tags: ['Null session','SMB attacks'] },
  { id: 'p143',  port: '143',   service: 'IMAP',          protocol: 'TCP', description: 'Email access', tags: ['Brute force','Read emails for creds'] },
  { id: 'p161',  port: '161',   service: 'SNMP',          protocol: 'UDP', description: 'Network management', tags: ['Community string brute','Info enumeration'] },
  { id: 'p389',  port: '389',   service: 'LDAP',          protocol: 'TCP', description: 'Directory service', tags: ['Anonymous bind','User enumeration','Password spray'] },
  { id: 'p443',  port: '443',   service: 'HTTPS',         protocol: 'TCP', description: 'Encrypted web server', tags: ['Same as HTTP','SSL/TLS misconfig','Cert info leak'] },
  { id: 'p445',  port: '445',   service: 'SMB',           protocol: 'TCP', description: 'Windows file sharing', tags: ['EternalBlue','Pass-the-Hash','NTLM relay','Null session'] },
  { id: 'p873',  port: '873',   service: 'rsync',         protocol: 'TCP', description: 'File sync', tags: ['Unauthenticated file access','Upload if writable'] },
  { id: 'p1433', port: '1433',  service: 'MSSQL',         protocol: 'TCP', description: 'Microsoft SQL Server', tags: ['xp_cmdshell RCE','Default SA creds','Linked server abuse'] },
  { id: 'p1521', port: '1521',  service: 'Oracle DB',     protocol: 'TCP', description: 'Oracle database', tags: ['SID enumeration','Default creds (scott:tiger)','Java stored proc RCE'] },
  { id: 'p2049', port: '2049',  service: 'NFS',           protocol: 'TCP/UDP', description: 'Network File System', tags: ['Mount without auth','no_root_squash exploit'] },
  { id: 'p2375', port: '2375',  service: 'Docker API',    protocol: 'TCP', description: 'Docker daemon (unencrypted)', tags: ['Unauthenticated container exec','Host escape via privileged container'] },
  { id: 'p3000', port: '3000',  service: 'Grafana/Node',  protocol: 'TCP', description: 'Grafana / Node.js apps', tags: ['Default creds (admin:admin)','CVE-2021-43798 path traversal'] },
  { id: 'p3306', port: '3306',  service: 'MySQL',         protocol: 'TCP', description: 'MySQL database', tags: ['Brute force','LOAD_FILE/INTO OUTFILE','UDF privesc'] },
  { id: 'p3389', port: '3389',  service: 'RDP',           protocol: 'TCP', description: 'Remote Desktop Protocol', tags: ['BlueKeep RCE','Brute force','Pass-the-Hash','Session hijack'] },
  { id: 'p5432', port: '5432',  service: 'PostgreSQL',    protocol: 'TCP', description: 'PostgreSQL database', tags: ['Brute force','COPY FROM PROGRAM RCE'] },
  { id: 'p5900', port: '5900',  service: 'VNC',           protocol: 'TCP', description: 'Virtual Network Computing', tags: ['Brute force','Auth bypass','No-auth mode'] },
  { id: 'p5985', port: '5985',  service: 'WinRM',         protocol: 'TCP', description: 'Windows Remote Management', tags: ['Credential/hash auth','Command execution'] },
  { id: 'p6379', port: '6379',  service: 'Redis',         protocol: 'TCP', description: 'In-memory key-value store', tags: ['Unauthenticated access','SSH key write','Cron RCE'] },
  { id: 'p8080', port: '8080',  service: 'HTTP-Alt',      protocol: 'TCP', description: 'Alternate HTTP / Tomcat', tags: ['Tomcat manager default creds','WAR upload RCE'] },
  { id: 'p8443', port: '8443',  service: 'HTTPS-Alt',     protocol: 'TCP', description: 'Alternate HTTPS', tags: ['Same as HTTPS','Admin panels'] },
  { id: 'p9200', port: '9200',  service: 'Elasticsearch', protocol: 'TCP', description: 'Search/analytics engine', tags: ['Unauthenticated data access','RCE via Groovy scripts (old)'] },
  { id: 'p27017',port: '27017', service: 'MongoDB',       protocol: 'TCP', description: 'NoSQL database', tags: ['Unauthenticated access','Data dump'] },
]

export default function PortRef() {
  const [query, setQuery] = useState('')
  const [detail, setDetail] = useState(null)

  const { data: ports } = useSupabaseData('ports', STATIC_PORTS)

  const filtered = ports.filter(p => {
    const q = query.toLowerCase()
    const tags = Array.isArray(p.tags) ? p.tags : []
    return !q || String(p.port).includes(q) || (p.service || '').toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q) || tags.some(t => t.toLowerCase().includes(q))
  })

  const norm = p => ({
    ...p,
    attacks: Array.isArray(p.tags) ? p.tags : (p.tags ? p.tags.split(',').map(t => t.trim()) : []),
  })

  const d = detail ? norm(detail) : null

  return (
    <div className="port-layout" style={{ display: 'flex', gap: '1.5rem' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search port number or service name..."
          style={{ width: '100%', background: '#050505', border: '1px solid #1a1a1a', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.75rem', padding: '0.5rem 0.75rem', outline: 'none', marginBottom: '0.75rem' }} />
        <div className="port-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.3rem' }}>
          {filtered.map(p => (
            <button key={p.id || p.port} onClick={() => setDetail(p)} style={{
              background: detail?.id === p.id ? 'rgba(0,0,0,0.4)' : '#0d0d0d',
              border: `1px solid ${detail?.id === p.id ? 'var(--neon)' : '#1a1a1a'}`,
              color: 'var(--neon)', fontFamily: 'inherit', padding: '0.5rem 0.75rem',
              cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
            }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>{p.port}</span>
              <span style={{ fontSize: '0.65rem', color: '#aaa', marginLeft: '0.5rem' }}>{p.service}</span>
              <div style={{ fontSize: '0.6rem', color: '#888', marginTop: '2px' }}>{p.description}</div>
            </button>
          ))}
        </div>
      </div>

      {d && (
        <div className="port-detail" style={{ width: '320px', flexShrink: 0, background: '#0d0d0d', border: '1px solid #1a3a1a', padding: '1rem' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--neon)', marginBottom: '0.25rem' }}>{d.port}</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--neon-dim)', marginBottom: '0.25rem' }}>{d.service}</div>
          {d.protocol && <div style={{ fontSize: '0.65rem', color: '#555', marginBottom: '0.5rem' }}>{d.protocol}</div>}
          <div style={{ fontSize: '0.7rem', color: '#ccc', marginBottom: '1rem' }}>{d.description}</div>

          {d.attacks.length > 0 && <>
            <div className="meta-label" style={{ marginBottom: '0.4rem' }}>⚔ ATTACKS / NOTES</div>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {d.attacks.map((a, i) => (
                <li key={i} style={{ fontSize: '0.7rem', color: '#ccc', padding: '3px 0', borderLeft: '2px solid #ff333355', paddingLeft: '0.5rem', marginBottom: '2px' }}>{a}</li>
              ))}
            </ul>
          </>}
        </div>
      )}
    </div>
  )
}
