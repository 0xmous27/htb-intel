// @ts-nocheck
import { useState } from 'react'

const HASH_PATTERNS = [
  { name: 'MD5', regex: /^[a-f0-9]{32}$/i, mode: '0', example: '5f4dcc3b5aa765d61d8327deb882cf99' },
  { name: 'NTLM', regex: /^[a-f0-9]{32}$/i, mode: '1000', example: '8846f7eaee8fb117ad06bdd830b7586c' },
  { name: 'SHA1', regex: /^[a-f0-9]{40}$/i, mode: '100', example: '5baa61e4c9b93f3f0682250b6cf8331b7ee68fd8' },
  { name: 'SHA256', regex: /^[a-f0-9]{64}$/i, mode: '1400', example: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8' },
  { name: 'SHA512', regex: /^[a-f0-9]{128}$/i, mode: '1700', example: 'b109f3bbbc244eb82441917ed06d618b9008dd09b3befd1b5e07394c706a8bb980b1d7785e5976ec049b46df5f1326af5a2ea6d103fd07c95385ffab0cacbc86' },
  { name: 'bcrypt', regex: /^\$2[aby]\$\d{2}\$.{53}$/, mode: '3200', example: '$2a$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW' },
  { name: 'MD5crypt (Linux $1$)', regex: /^\$1\$[a-zA-Z0-9./]{8}\$[a-zA-Z0-9./]{22}$/, mode: '500', example: '$1$abc$xyz...' },
  { name: 'SHA512crypt (Linux $6$)', regex: /^\$6\$[a-zA-Z0-9./]{8,16}\$[a-zA-Z0-9./]{86}$/, mode: '1800', example: '$6$salt$hash...' },
  { name: 'NetNTLMv1', regex: /^[a-zA-Z0-9+/]{48}$/, mode: '5500', example: '' },
  { name: 'NetNTLMv2', regex: /^[a-zA-Z0-9]+::[a-zA-Z0-9]+:[a-f0-9]{16}:[a-f0-9]{32}:[a-f0-9]+$/i, mode: '5600', example: 'user::domain:challenge:hash:blob' },
  { name: 'Kerberos TGS ($krb5tgs$)', regex: /^\$krb5tgs\$/, mode: '13100', example: '$krb5tgs$23$*...' },
  { name: 'Kerberos AS-REP ($krb5asrep$)', regex: /^\$krb5asrep\$/, mode: '18200', example: '$krb5asrep$23$...' },
  { name: 'WPA/WPA2', regex: /^[a-f0-9]{32}:[a-f0-9]{12}:[a-f0-9]{12}:/, mode: '2500', example: '' },
  { name: 'MySQL4.1+', regex: /^\*[a-f0-9]{40}$/i, mode: '300', example: '*23AE809DDACAF96AF0FD78ED04B6A265E05AA257' },
  { name: 'MSSQL 2012+', regex: /^0x0200[a-f0-9]{136}$/i, mode: '1731', example: '' },
]

function identify(hash) {
  const h = hash.trim()
  if (!h) return []
  return HASH_PATTERNS.filter(p => p.regex.test(h))
}

export default function HashID() {
  const [input, setInput] = useState('')
  const matches = identify(input)

  return (
    <div>
      <div style={{ marginBottom: '1rem' }}>
        <div className="meta-label" style={{ marginBottom: '0.4rem' }}>PASTE HASH</div>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Paste hash here..."
          style={{ width: '100%', background: '#050505', border: '1px solid #1a1a1a', color: 'var(--neon)', fontFamily: 'inherit', fontSize: '0.78rem', padding: '0.6rem 0.75rem', outline: 'none' }}
        />
      </div>

      {input && (
        <div>
          {matches.length === 0 ? (
            <div style={{ color: '#ff3333', fontSize: '0.75rem', padding: '0.5rem' }}>Unknown hash format</div>
          ) : (
            <div>
              <div className="meta-label" style={{ marginBottom: '0.75rem' }}>POSSIBLE MATCHES</div>
              {matches.map(m => (
                <div key={m.name} style={{ display: 'grid', gridTemplateColumns: '200px 80px 1fr', gap: '1rem', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid #111', fontSize: '0.75rem' }}>
                  <span style={{ color: 'var(--neon)', fontWeight: 700 }}>{m.name}</span>
                  <span style={{ color: '#ff9900' }}>-m {m.mode}</span>
                  <div className="cmd-block" style={{ padding: '0.3rem 0.75rem', fontSize: '0.7rem' }}>
                    <span className="cmd-prompt">$ </span>
                    hashcat -m {m.mode} -a 0 hash.txt /usr/share/wordlists/rockyou.txt
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: '2rem' }}>
        <div className="meta-label" style={{ marginBottom: '0.75rem' }}>HASH REFERENCE</div>
        <div style={{ overflowX: 'auto' }}>
        <table className="hash-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.7rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #1a1a1a', color: '#aaa' }}>
              {['HASH TYPE', 'HASHCAT MODE', 'LENGTH'].map(h => (
                <th key={h} style={{ padding: '0.4rem 0.75rem', fontWeight: 400, letterSpacing: '0.1em', fontSize: '0.6rem', textAlign: 'left' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HASH_PATTERNS.map(p => (
              <tr key={p.name} style={{ borderBottom: '1px solid #0d0d0d' }}>
                <td style={{ padding: '0.4rem 0.75rem', color: '#ddd' }}>{p.name}</td>
                <td style={{ padding: '0.4rem 0.75rem', color: '#ff9900' }}>-m {p.mode}</td>
                <td style={{ padding: '0.4rem 0.75rem', color: '#aaa', fontSize: '0.65rem' }}>{p.example || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  )
}
