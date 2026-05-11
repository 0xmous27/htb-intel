import { useSupabaseData } from '../hooks/useSupabaseData'

const STATIC_WORDLISTS = [
  { id: 'wl-rockyou',      name: 'rockyou.txt',                    category: 'Passwords',        path: '/usr/share/wordlists/rockyou.txt',                                                          description: '14M passwords — go-to for most cracking',          size: '14M entries' },
  { id: 'wl-rockyou2021',  name: 'rockyou2021.txt',                category: 'Passwords',        path: '/usr/share/wordlists/rockyou2021.txt',                                                      description: '8.4B passwords — massive combined list',            size: '8.4B entries' },
  { id: 'wl-darkweb',      name: 'darkweb2017-top10000.txt',       category: 'Passwords',        path: '/usr/share/seclists/Passwords/darkweb2017-top10000.txt',                                    description: 'Top 10k from dark web leaks',                       size: '10k entries' },
  { id: 'wl-top100',       name: 'top-passwords-shortlist.txt',    category: 'Passwords',        path: '/usr/share/seclists/Passwords/Common-Credentials/top-passwords-shortlist.txt',              description: 'Top 100 most common passwords',                     size: '100 entries' },
  { id: 'wl-defaults',     name: 'default-passwords.csv',          category: 'Passwords',        path: '/usr/share/seclists/Passwords/Default-Credentials/default-passwords.csv',                  description: 'Default vendor passwords',                          size: 'varies' },
  { id: 'wl-xato',         name: 'xato-net-10-million-usernames.txt', category: 'Usernames',     path: '/usr/share/seclists/Usernames/xato-net-10-million-usernames.txt',                          description: '10M real usernames from breaches',                  size: '10M entries' },
  { id: 'wl-topusers',     name: 'top-usernames-shortlist.txt',    category: 'Usernames',        path: '/usr/share/seclists/Usernames/top-usernames-shortlist.txt',                                 description: 'Top 17 most common usernames',                      size: '17 entries' },
  { id: 'wl-names',        name: 'names.txt',                      category: 'Usernames',        path: '/usr/share/seclists/Usernames/Names/names.txt',                                             description: 'Common first names as usernames',                   size: 'varies' },
  { id: 'wl-raft-med-dir', name: 'raft-medium-directories.txt',    category: 'Web — Directories',path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt',                    description: '30k dirs — best balance of speed/coverage',         size: '30k entries' },
  { id: 'wl-raft-lg-dir',  name: 'raft-large-directories.txt',     category: 'Web — Directories',path: '/usr/share/seclists/Discovery/Web-Content/raft-large-directories.txt',                     description: '62k dirs — thorough scan',                          size: '62k entries' },
  { id: 'wl-dir23med',     name: 'directory-list-2.3-medium.txt',  category: 'Web — Directories',path: '/usr/share/seclists/Discovery/Web-Content/directory-list-2.3-medium.txt',                  description: '220k dirs — classic dirbuster list',                size: '220k entries' },
  { id: 'wl-common',       name: 'common.txt',                     category: 'Web — Directories',path: '/usr/share/seclists/Discovery/Web-Content/common.txt',                                     description: '4.6k common paths — fast initial scan',             size: '4.6k entries' },
  { id: 'wl-raft-med-f',   name: 'raft-medium-files.txt',          category: 'Web — Files',      path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-files.txt',                          description: '17k filenames',                                     size: '17k entries' },
  { id: 'wl-raft-med-w',   name: 'raft-medium-words.txt',          category: 'Web — Files',      path: '/usr/share/seclists/Discovery/Web-Content/raft-medium-words.txt',                          description: 'Combined words for fuzzing',                        size: 'varies' },
  { id: 'wl-burp-params',  name: 'burp-parameter-names.txt',       category: 'Web — Files',      path: '/usr/share/seclists/Discovery/Web-Content/burp-parameter-names.txt',                       description: '6.5k parameter names',                              size: '6.5k entries' },
  { id: 'wl-sub5k',        name: 'subdomains-top1million-5000.txt', category: 'DNS — Subdomains', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt',                        description: 'Top 5k subdomains — fast',                          size: '5k entries' },
  { id: 'wl-sub20k',       name: 'subdomains-top1million-20000.txt',category: 'DNS — Subdomains', path: '/usr/share/seclists/Discovery/DNS/subdomains-top1million-20000.txt',                       description: 'Top 20k subdomains',                                size: '20k entries' },
  { id: 'wl-sub100k',      name: 'bitquark-subdomains-top100000.txt',category: 'DNS — Subdomains',path: '/usr/share/seclists/Discovery/DNS/bitquark-subdomains-top100000.txt',                     description: '100k subdomains — thorough',                        size: '100k entries' },
  { id: 'wl-snmp',         name: 'snmp.txt',                       category: 'SNMP',             path: '/usr/share/seclists/Discovery/SNMP/snmp.txt',                                               description: 'Common SNMP community strings',                     size: 'varies' },
]

function CopyBtn({ text }) {
  const copy = () => navigator.clipboard.writeText(text)
  return (
    <button onClick={copy} style={{ position: 'absolute', top: '2px', right: '4px', background: 'none', border: '1px solid #2a2a2a', color: '#aaa', fontFamily: 'inherit', fontSize: '0.55rem', padding: '1px 5px', cursor: 'pointer' }}>COPY</button>
  )
}

export default function WordlistsRef() {
  const { data: wordlists } = useSupabaseData('wordlists', STATIC_WORDLISTS)

  const grouped = wordlists.reduce((acc, wl) => {
    const cat = wl.category || 'Misc'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(wl)
    return acc
  }, {})

  return (
    <div>
      {Object.entries(grouped).map(([cat, lists]) => (
        <div key={cat} style={{ marginBottom: '1.5rem' }}>
          <div className="tools-group-header">{cat}</div>
          {lists.map(wl => (
            <div key={wl.id || wl.name} className="wordlist-row" style={{ display: 'grid', gridTemplateColumns: '280px 1fr 160px', gap: '1rem', alignItems: 'center', padding: '0.5rem 0.75rem', borderBottom: '1px solid #0d0d0d', fontSize: '0.72rem' }}>
              <div>
                <div style={{ color: 'var(--neon)', marginBottom: '2px' }}>{wl.name}</div>
                <div style={{ color: '#aaa', fontSize: '0.65rem' }}>{wl.description}</div>
              </div>
              <div className="cmd-block" style={{ padding: '0.3rem 0.75rem', fontSize: '0.68rem', position: 'relative' }}>
                {wl.path}
                {wl.path && <CopyBtn text={wl.path} />}
              </div>
              <div style={{ color: '#bbb', fontSize: '0.65rem' }}>{wl.size}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}
