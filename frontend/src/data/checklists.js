export const CHECKLISTS = [
  {
    name: "External Pentest",
    icon: "🌐",
    steps: [
      { phase: "Recon", items: ["Whois lookup", "DNS enumeration (A, MX, NS, TXT)", "Zone transfer attempt", "Subdomain brute force (gobuster dns)", "Certificate transparency (crt.sh)", "Google dorking (site:, inurl:, filetype:)", "Shodan/Censys lookup", "theHarvester OSINT"] },
      { phase: "Scanning", items: ["Full TCP port scan (nmap -p-)", "Top UDP scan (nmap -sU --top-ports 200)", "Service version detection (-sV -sC)", "Nmap vuln scripts (--script vuln)"] },
      { phase: "Web Enumeration", items: ["Directory brute force (gobuster/ffuf)", "Vhost fuzzing", "Technology fingerprinting (whatweb, wappalyzer)", "Check /robots.txt, /sitemap.xml, /.git/", "Check for default credentials on admin panels", "Run nikto scan"] },
      { phase: "Exploitation", items: ["Test all parameters for SQLi (sqlmap)", "Test file uploads for bypass", "Test for LFI/RFI", "Test for SSRF in URL parameters", "Test for command injection", "Check for exposed API endpoints"] },
      { phase: "Post-Exploitation", items: ["Enumerate local users and groups", "Check sudo -l", "Search for credentials in files", "Check for internal network access", "Establish persistence if in scope"] },
    ]
  },
  {
    name: "Internal AD Pentest",
    icon: "🏢",
    steps: [
      { phase: "Initial Access", items: ["Network scan for live hosts (nmap)", "Identify domain controllers (port 88, 389, 445)", "Check for null session SMB", "Try anonymous LDAP bind", "Enumerate users via Kerberos (kerbrute)", "Password spray with common passwords"] },
      { phase: "With Domain User", items: ["Run BloodHound collection (SharpHound/bloodhound-python)", "Kerberoast all SPNs (GetUserSPNs)", "ASREPRoast pre-auth disabled users (GetNPUsers)", "Enumerate shares (crackmapexec --shares)", "Check for GPP passwords (cpassword in SYSVOL)", "Enumerate ACLs in BloodHound"] },
      { phase: "Lateral Movement", items: ["Pass-the-Hash with found NTLM hashes", "Pass-the-Ticket with found TGS/TGT", "WinRM access (evil-winrm)", "PSExec/WMIExec with admin creds", "Check for local admin reuse across hosts"] },
      { phase: "Domain Escalation", items: ["Exploit BloodHound attack paths", "Abuse GenericAll/WriteDACL/ForceChangePassword ACLs", "Exploit Kerberoasted service account if admin", "DCSync if Domain Admin or delegated", "Dump NTDS.dit if DC access"] },
      { phase: "Post-Compromise", items: ["Dump all domain hashes (secretsdump)", "Golden Ticket creation (KRBTGT hash)", "Document all attack paths", "Check for forest trusts"] },
    ]
  },
  {
    name: "Linux Box (HTB Style)",
    icon: "🐧",
    steps: [
      { phase: "Enumeration", items: ["Full port scan", "Web enumeration if HTTP open", "FTP anonymous login check", "SMB null session check", "SSH version check"] },
      { phase: "Foothold", items: ["Exploit web vulnerability (SQLi/LFI/RCE/upload)", "Brute force SSH/FTP if credentials found", "Exploit vulnerable service version", "Check for default credentials"] },
      { phase: "Linux PrivEsc", items: ["sudo -l", "SUID binary search (find / -perm -4000)", "Capabilities (getcap -r /)", "Crontab enumeration (/etc/crontab, cron.*)", "Writable files owned by root", "NFS no_root_squash", "Kernel version check (uname -a)", "Run linpeas.sh", "Check /etc/passwd writable", "Check for passwords in config files", "Check history files (~/.bash_history)", "Check for internal services (ss -tlnp)"] },
      { phase: "Loot", items: ["Read /root/root.txt", "Read /home/*/user.txt", "Dump /etc/shadow", "Check for SSH keys", "Check for interesting files in /opt, /var, /srv"] },
    ]
  },
  {
    name: "Windows Box (HTB Style)",
    icon: "🪟",
    steps: [
      { phase: "Enumeration", items: ["Full port scan", "SMB enumeration (smbmap, smbclient)", "RPC enumeration (rpcclient)", "Web enumeration if IIS/Apache open", "WinRM check (port 5985)"] },
      { phase: "Foothold", items: ["Exploit web vulnerability", "SMB exploit (EternalBlue if unpatched)", "Brute force RDP/SMB/WinRM", "Default credentials on web apps"] },
      { phase: "Windows PrivEsc", items: ["Run winpeas.exe", "Check whoami /priv (SeImpersonatePrivilege?)", "Check AlwaysInstallElevated registry keys", "Check unquoted service paths", "Check writable service binaries", "Check scheduled tasks", "Check stored credentials (cmdkey /list)", "Check for autologon credentials in registry", "UAC bypass if medium integrity", "Token impersonation (PrintSpoofer/GodPotato)"] },
      { phase: "Loot", items: ["Read C:\\Users\\Administrator\\Desktop\\root.txt", "Dump SAM hashes (secretsdump local)", "Run mimikatz (sekurlsa::logonpasswords)", "Check for interesting files in C:\\Users\\*\\Documents"] },
    ]
  },
  {
    name: "Web Application",
    icon: "🌍",
    steps: [
      { phase: "Recon", items: ["Technology fingerprinting", "Directory/file brute force", "Parameter discovery (ffuf)", "JS file analysis for endpoints/keys", "Check source code for comments", "API endpoint enumeration"] },
      { phase: "Authentication", items: ["Default credentials", "Username enumeration", "Brute force (hydra/burp intruder)", "Password reset flow abuse", "JWT token analysis", "Session fixation/hijacking"] },
      { phase: "Injection", items: ["SQL injection (manual + sqlmap)", "Command injection", "SSTI (Server-Side Template Injection)", "LDAP injection", "XPath injection", "NoSQL injection"] },
      { phase: "File Handling", items: ["File upload bypass", "LFI/RFI", "Path traversal", "XXE in XML inputs", "Insecure deserialization"] },
      { phase: "Client-Side", items: ["XSS (reflected, stored, DOM)", "CSRF", "CORS misconfiguration", "Clickjacking"] },
      { phase: "Logic & Access", items: ["IDOR testing", "Privilege escalation via role manipulation", "Mass assignment", "Business logic flaws", "SSRF in URL parameters"] },
    ]
  },
]
