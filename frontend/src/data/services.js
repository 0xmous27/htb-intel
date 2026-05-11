export const SERVICES = [
  {
    category: "Remote Access",
    services: [
      {
        name: "SSH", port: "22", proto: "TCP",
        desc: "Secure Shell — encrypted remote terminal access to Linux/Unix systems.",
        attacks: [
          "Brute force credentials (hydra, medusa)",
          "Username enumeration via timing attack (OpenSSH < 7.7)",
          "Weak/reused private key exploitation",
          "SSH agent hijacking",
          "Authorized_keys backdoor persistence",
        ],
        cves: ["CVE-2018-15473 (OpenSSH user enumeration)", "CVE-2023-38408 (ssh-agent RCE)"],
        tools: ["hydra", "ssh", "scp", "sftp", "ssh-keygen"],
        notes: "Always check for id_rsa in /home/*/.ssh/, /root/.ssh/, and backup files."
      },
      {
        name: "RDP", port: "3389", proto: "TCP",
        desc: "Remote Desktop Protocol — graphical remote access to Windows machines.",
        attacks: [
          "Brute force credentials (hydra)",
          "Pass-the-Hash with Restricted Admin Mode",
          "BlueKeep RCE (unpatched systems)",
          "DejaBlue RCE",
          "Session hijacking (tscon as SYSTEM)",
          "Sticky Keys backdoor on login screen",
        ],
        cves: ["CVE-2019-0708 (BlueKeep RCE)", "CVE-2019-1181/1182 (DejaBlue)", "CVE-2012-0002 (MS12-020 DoS)"],
        tools: ["xfreerdp", "rdesktop", "hydra", "nmap --script rdp-*"],
        notes: "Check if Restricted Admin Mode is enabled for Pass-the-Hash. Use xfreerdp /pth: flag."
      },
      {
        name: "WinRM", port: "5985/5986", proto: "TCP",
        desc: "Windows Remote Management — PowerShell remoting over HTTP/HTTPS.",
        attacks: [
          "Credential brute force",
          "Pass-the-Hash authentication",
          "Command execution with valid credentials",
        ],
        cves: [],
        tools: ["evil-winrm", "crackmapexec winrm"],
        notes: "Port 5985 = HTTP, 5986 = HTTPS. Requires user to be in Remote Management Users group."
      },
      {
        name: "VNC", port: "5900-5910", proto: "TCP",
        desc: "Virtual Network Computing — graphical remote desktop (cross-platform).",
        attacks: [
          "Brute force VNC password (hydra)",
          "Authentication bypass on misconfigured servers",
          "Unencrypted traffic sniffing",
        ],
        cves: ["CVE-2006-2369 (RealVNC auth bypass)", "CVE-2019-15694 (LibVNCServer heap overflow)"],
        tools: ["hydra", "vncviewer", "nmap --script vnc-*"],
        notes: "VNC passwords are max 8 chars. Check for no-auth mode: nmap --script vnc-info."
      },
      {
        name: "Telnet", port: "23", proto: "TCP",
        desc: "Unencrypted remote terminal — legacy protocol, credentials sent in cleartext.",
        attacks: [
          "Credential sniffing (Wireshark/tcpdump)",
          "Brute force (hydra)",
          "MITM attacks",
        ],
        cves: [],
        tools: ["telnet", "hydra", "wireshark"],
        notes: "If Telnet is open, sniff traffic first — credentials may be visible in plaintext."
      },
      {
        name: "Citrix", port: "443/1494/2598", proto: "TCP",
        desc: "Citrix Virtual Apps/Desktops — enterprise remote application delivery.",
        attacks: [
          "Credential brute force on Citrix Gateway",
          "Citrix Bleed session token leak",
          "Application sandbox escape",
          "Kiosk mode breakout (explorer.exe, cmd via dialog boxes)",
        ],
        cves: ["CVE-2023-4966 (Citrix Bleed — session token leak)", "CVE-2019-19781 (Citrix ADC RCE)"],
        tools: ["curl", "burpsuite"],
        notes: "For kiosk breakout: try opening file dialogs → type cmd.exe in path bar."
      },
    ]
  },
  {
    category: "File Sharing",
    services: [
      {
        name: "SMB", port: "445/139", proto: "TCP",
        desc: "Server Message Block — Windows file sharing, printer sharing, and IPC.",
        attacks: [
          "Null session enumeration",
          "Pass-the-Hash (NTLM relay)",
          "EternalBlue RCE (MS17-010)",
          "PrintNightmare LPE/RCE",
          "Brute force credentials",
          "NTLM relay attack (Responder + ntlmrelayx)",
        ],
        cves: ["CVE-2017-0144 (EternalBlue/MS17-010)", "CVE-2021-34527 (PrintNightmare)", "CVE-2020-0796 (SMBGhost)"],
        tools: ["smbclient", "smbmap", "crackmapexec", "enum4linux", "impacket-psexec", "responder"],
        notes: "Always check SMB signing: if disabled, NTLM relay attacks are possible."
      },
      {
        name: "FTP", port: "21", proto: "TCP",
        desc: "File Transfer Protocol — unencrypted file transfer, often misconfigured.",
        attacks: [
          "Anonymous login (common misconfiguration)",
          "Brute force credentials",
          "Cleartext credential sniffing",
          "Bounce attack for port scanning",
          "Writable FTP → upload webshell",
        ],
        cves: ["CVE-2010-4221 (ProFTPD mod_sql injection)", "CVE-2011-2523 (vsftpd backdoor)"],
        tools: ["ftp", "hydra", "nmap --script ftp-*", "curl"],
        notes: "Try anonymous:anonymous first. If writable and web root is accessible, upload a webshell."
      },
      {
        name: "NFS", port: "2049", proto: "TCP/UDP",
        desc: "Network File System — Unix/Linux network file sharing.",
        attacks: [
          "List and mount shares without auth",
          "no_root_squash exploitation (copy SUID bash)",
          "Read sensitive files from mounted shares",
        ],
        cves: [],
        tools: ["showmount", "mount", "nmap --script nfs-*"],
        notes: "showmount -e {TARGET_IP} to list exports. Mount with: mount -t nfs {TARGET_IP}:/share /mnt"
      },
      {
        name: "TFTP", port: "69", proto: "UDP",
        desc: "Trivial FTP — no authentication, used for network booting and config transfer.",
        attacks: [
          "Read files without authentication",
          "Write files if server allows it",
          "Enumerate filenames (no directory listing)",
        ],
        cves: [],
        tools: ["tftp", "nmap --script tftp-enum"],
        notes: "Try common filenames: config.txt, running-config, startup-config, passwd."
      },
      {
        name: "rsync", port: "873", proto: "TCP",
        desc: "Remote file sync — often misconfigured to allow unauthenticated access.",
        attacks: [
          "List modules without authentication",
          "Download files from open shares",
          "Upload files if writable",
        ],
        cves: [],
        tools: ["rsync", "nmap --script rsync-list-modules"],
        notes: "rsync --list-only rsync://{TARGET_IP}/ to list modules. rsync rsync://{TARGET_IP}/module/ /tmp/"
      },
    ]
  },
  {
    category: "Email Services",
    services: [
      {
        name: "SMTP", port: "25/465/587", proto: "TCP",
        desc: "Simple Mail Transfer Protocol — sending email. Often used for user enumeration.",
        attacks: [
          "User enumeration (VRFY, EXPN, RCPT TO)",
          "Open relay abuse (send email as anyone)",
          "Credential brute force (port 587)",
          "Email spoofing if SPF/DKIM misconfigured",
        ],
        cves: [],
        tools: ["nc", "smtp-user-enum", "hydra", "swaks", "nmap --script smtp-*"],
        notes: "VRFY username — checks if user exists. EXPN list — expands mailing list."
      },
      {
        name: "IMAP", port: "143/993", proto: "TCP",
        desc: "Internet Message Access Protocol — read email from server (keeps mail on server).",
        attacks: [
          "Credential brute force",
          "Read emails for credentials/intel",
          "Access shared mailboxes",
        ],
        cves: [],
        tools: ["hydra", "curl", "nc", "nmap --script imap-*"],
        notes: "curl -u user:pass imaps://{TARGET_IP}/INBOX to read emails. Often contains creds in emails."
      },
      {
        name: "POP3", port: "110/995", proto: "TCP",
        desc: "Post Office Protocol — download email from server (removes from server).",
        attacks: [
          "Credential brute force",
          "Cleartext credential sniffing (port 110)",
          "Read downloaded emails for intel",
        ],
        cves: [],
        tools: ["hydra", "nc", "nmap --script pop3-*"],
        notes: "nc {TARGET_IP} 110 → USER admin → PASS password → LIST → RETR 1"
      },
      {
        name: "Microsoft Exchange", port: "443/80", proto: "TCP",
        desc: "Enterprise email server — high-value target with many historical RCEs.",
        attacks: [
          "ProxyLogon RCE chain",
          "ProxyShell RCE chain",
          "Password spray via OWA",
          "GAL enumeration for user list",
          "NTLM relay via Exchange",
        ],
        cves: ["CVE-2021-26855 (ProxyLogon SSRF)", "CVE-2021-34473 (ProxyShell RCE)", "CVE-2020-0688 (Exchange RCE)"],
        tools: ["curl", "burpsuite", "crackmapexec", "ruler"],
        notes: "Check /owa, /autodiscover, /ecp endpoints. ProxyShell: /autodiscover/autodiscover.json?@evil.com/"
      },
    ]
  },
  {
    category: "Web Technologies",
    services: [
      {
        name: "HTTP/HTTPS", port: "80/443", proto: "TCP",
        desc: "Web server — most common attack surface in modern pentests.",
        attacks: [
          "Directory/file brute force",
          "Virtual host discovery",
          "Parameter fuzzing",
          "SQL injection, XSS, LFI, RFI, SSRF, XXE",
          "Default credentials on admin panels",
        ],
        cves: [],
        tools: ["gobuster", "ffuf", "nikto", "burpsuite", "sqlmap", "curl"],
        notes: "Always check /robots.txt, /sitemap.xml, /.git/, /backup/, /admin, /api/."
      },
      {
        name: "Apache Tomcat", port: "8080/8443", proto: "TCP",
        desc: "Java servlet container — often has manager interface with default creds.",
        attacks: [
          "Default credentials on /manager/html (tomcat:tomcat, admin:admin)",
          "WAR file upload → RCE via manager",
          "CVE-2020-1938 Ghostcat (AJP file read/RCE)",
          "PUT method enabled → upload webshell",
        ],
        cves: ["CVE-2020-1938 (Ghostcat AJP)", "CVE-2019-0232 (CGI RCE on Windows)", "CVE-2017-12617 (JSP upload)"],
        tools: ["curl", "msfconsole", "gobuster"],
        notes: "Try /manager/html with default creds. Upload .war shell: curl -T shell.war http://tomcat:tomcat@{TARGET_IP}:8080/manager/deploy?path=/shell"
      },
      {
        name: "Jenkins", port: "8080", proto: "TCP",
        desc: "CI/CD automation server — Script Console gives direct Groovy/OS execution.",
        attacks: [
          "Default credentials (admin:admin, jenkins:jenkins)",
          "Script Console RCE (Groovy → OS commands)",
          "Credential extraction from stored jobs",
          "CVE-2024-23897 arbitrary file read",
        ],
        cves: ["CVE-2024-23897 (file read via CLI)", "CVE-2019-1003000 (RCE via pipeline)", "CVE-2018-1000861 (RCE)"],
        tools: ["curl", "burpsuite", "msfconsole"],
        notes: "Script Console at /script: Thread.start{ 'id'.execute().text }.join(). Also check /credentials/."
      },
      {
        name: "WordPress", port: "80/443", proto: "TCP",
        desc: "Most popular CMS — large attack surface via plugins, themes, and xmlrpc.",
        attacks: [
          "User enumeration (?author=1)",
          "xmlrpc.php brute force (bypasses lockout)",
          "Plugin/theme vulnerability exploitation",
          "Admin → theme editor → PHP webshell",
          "wpscan automated scanning",
        ],
        cves: ["CVE-2019-8942 (RCE via image upload)", "CVE-2021-29447 (XXE via media upload)"],
        tools: ["wpscan", "curl", "burpsuite"],
        notes: "wpscan --url http://{TARGET_IP} --enumerate u,p,t --api-token YOUR_TOKEN"
      },
      {
        name: "Drupal", port: "80/443", proto: "TCP",
        desc: "Enterprise CMS — Drupalgeddon vulnerabilities allow unauthenticated RCE.",
        attacks: [
          "Drupalgeddon2 unauthenticated RCE",
          "Drupalgeddon3 authenticated RCE",
          "Default admin credentials",
          "PHP filter module → code execution",
        ],
        cves: ["CVE-2018-7600 (Drupalgeddon2 RCE)", "CVE-2018-7602 (Drupalgeddon3)", "CVE-2014-3704 (Drupalgeddon1)"],
        tools: ["msfconsole", "curl", "droopescan"],
        notes: "Check /CHANGELOG.txt for version. droopescan scan drupal -u http://{TARGET_IP}"
      },
      {
        name: "Joomla", port: "80/443", proto: "TCP",
        desc: "Popular CMS — admin panel at /administrator, many vulnerable extensions.",
        attacks: [
          "Admin panel brute force (/administrator)",
          "Template editor → PHP webshell",
          "Vulnerable extension exploitation",
          "Configuration.php disclosure",
        ],
        cves: ["CVE-2023-23752 (unauthenticated info disclosure)", "CVE-2015-8562 (RCE)"],
        tools: ["joomscan", "curl", "burpsuite"],
        notes: "joomscan -u http://{TARGET_IP}. Check /administrator/manifests/files/joomla.xml for version."
      },
      {
        name: "osTicket", port: "80/443", proto: "TCP",
        desc: "Open-source helpdesk/ticketing system — often contains credentials in tickets.",
        attacks: [
          "Default credentials (admin:admin123)",
          "Read support tickets for credential intel",
          "File upload bypass for webshell",
          "SQL injection in older versions",
        ],
        cves: ["CVE-2020-24881 (SSRF)", "CVE-2021-39184 (XSS)"],
        tools: ["burpsuite", "curl", "sqlmap"],
        notes: "Tickets often contain password reset links, credentials, and internal info. Always read all tickets."
      },
      {
        name: "GitLab / Gitea", port: "80/443/3000", proto: "TCP",
        desc: "Self-hosted Git platforms — source code may contain hardcoded credentials.",
        attacks: [
          "Public repository credential harvesting",
          "User registration → access private repos",
          "RCE via SSRF or deserialization",
          "Exposed .git directory on web servers",
        ],
        cves: ["CVE-2021-22205 (GitLab RCE via image upload)", "CVE-2023-27482 (GitLab auth bypass)"],
        tools: ["curl", "git", "trufflehog", "gitleaks"],
        notes: "Check public repos for secrets: gitleaks detect --source . Check /.git/ on web servers."
      },
      {
        name: "Grafana", port: "3000", proto: "TCP",
        desc: "Metrics visualization platform — path traversal gives file read.",
        attacks: [
          "Default credentials (admin:admin)",
          "CVE-2021-43798 path traversal → read /etc/passwd, database files",
          "Plugin RCE",
          "SSRF via data source configuration",
        ],
        cves: ["CVE-2021-43798 (path traversal)", "CVE-2021-41174 (XSS)", "CVE-2019-15043 (auth bypass)"],
        tools: ["curl", "burpsuite"],
        notes: "curl http://{TARGET_IP}:3000/public/plugins/alertlist/../../../../../../../etc/passwd"
      },
      {
        name: "Splunk", port: "8000/8089", proto: "TCP",
        desc: "SIEM/log analysis platform — Universal Forwarder can be abused for RCE.",
        attacks: [
          "Default credentials (admin:changeme)",
          "Splunk Universal Forwarder RCE (PySplunkWhisperer2)",
          "Search head RCE via custom app upload",
          "Sensitive log data exposure",
        ],
        cves: ["CVE-2023-46214 (RCE via XSLT)", "CVE-2022-32158 (forwarder RCE)"],
        tools: ["curl", "PySplunkWhisperer2", "burpsuite"],
        notes: "If forwarder is running: python PySplunkWhisperer2_remote.py --host {TARGET_IP} --lhost {TARGET_IP} --lport 4444"
      },
    ]
  },
  {
    category: "Databases",
    services: [
      {
        name: "MySQL / MariaDB", port: "3306", proto: "TCP",
        desc: "Most common open-source relational database.",
        attacks: [
          "Brute force credentials",
          "Login with found credentials → dump databases",
          "LOAD_FILE() to read system files",
          "INTO OUTFILE to write webshell",
          "UDF (User Defined Function) privilege escalation",
        ],
        cves: [],
        tools: ["mysql", "hydra", "sqlmap", "nmap --script mysql-*"],
        notes: "mysql -u root -p -h {TARGET_IP}. If root has no password: mysql -u root -h {TARGET_IP}"
      },
      {
        name: "MSSQL", port: "1433", proto: "TCP",
        desc: "Microsoft SQL Server — xp_cmdshell enables OS command execution.",
        attacks: [
          "Brute force / default SA credentials",
          "xp_cmdshell for OS command execution",
          "Linked server attacks",
          "Impersonation attacks",
          "UNC path injection for NTLM capture",
        ],
        cves: [],
        tools: ["impacket-mssqlclient", "crackmapexec mssql", "sqlmap", "nmap --script ms-sql-*"],
        notes: "impacket-mssqlclient {USERNAME}:{PASSWORD}@{TARGET_IP}. Enable xp_cmdshell: EXEC sp_configure 'xp_cmdshell',1; RECONFIGURE;"
      },
      {
        name: "PostgreSQL", port: "5432", proto: "TCP",
        desc: "Advanced open-source relational database.",
        attacks: [
          "Brute force credentials",
          "COPY TO/FROM for file read/write",
          "CVE-2019-9193 COPY FROM PROGRAM (RCE)",
          "Extension loading for code execution",
        ],
        cves: ["CVE-2019-9193 (COPY FROM PROGRAM RCE)"],
        tools: ["psql", "hydra", "sqlmap", "nmap --script pgsql-*"],
        notes: "psql -h {TARGET_IP} -U postgres. COPY TO '/tmp/test' FROM PROGRAM 'id';"
      },
      {
        name: "Oracle DB", port: "1521", proto: "TCP",
        desc: "Enterprise Oracle database — complex attack surface.",
        attacks: [
          "SID enumeration",
          "Default credentials (scott:tiger, sys:change_on_install)",
          "Java stored procedures for OS execution",
          "Privilege escalation via UTL_FILE",
        ],
        cves: [],
        tools: ["odat", "sqlplus", "nmap --script oracle-*"],
        notes: "odat all -s {TARGET_IP} -p 1521. Enumerate SIDs: odat sidguesser -s {TARGET_IP}"
      },
      {
        name: "Redis", port: "6379", proto: "TCP",
        desc: "In-memory key-value store — often runs without authentication.",
        attacks: [
          "Unauthenticated access (no requirepass set)",
          "Write SSH authorized_keys via CONFIG SET dir",
          "Write cron job for reverse shell",
          "Master-slave replication RCE",
        ],
        cves: ["CVE-2022-0543 (Lua sandbox escape RCE)"],
        tools: ["redis-cli", "nmap --script redis-*"],
        notes: "redis-cli -h {TARGET_IP}. CONFIG SET dir /root/.ssh; CONFIG SET dbfilename authorized_keys; SET x 'ssh-rsa AAAA...'; SAVE"
      },
      {
        name: "MongoDB", port: "27017", proto: "TCP",
        desc: "NoSQL document database — often exposed without authentication.",
        attacks: [
          "Unauthenticated access",
          "Dump all databases and collections",
          "NoSQL injection in web apps",
        ],
        cves: [],
        tools: ["mongosh", "nmap --script mongodb-*"],
        notes: "mongosh {TARGET_IP}:27017. show dbs; use admin; db.getUsers();"
      },
    ]
  },
  {
    category: "Directory & Identity",
    services: [
      {
        name: "LDAP / Active Directory", port: "389/636/3268", proto: "TCP",
        desc: "Lightweight Directory Access Protocol — backbone of Windows AD environments.",
        attacks: [
          "Anonymous bind enumeration",
          "Credential brute force",
          "Kerberoasting (TGS ticket request)",
          "ASREPRoasting (no pre-auth users)",
          "DCSync (domain hash dump)",
          "BloodHound attack path mapping",
        ],
        cves: [],
        tools: ["ldapsearch", "bloodhound-python", "impacket-GetUserSPNs", "kerbrute", "crackmapexec"],
        notes: "ldapsearch -x -H ldap://{TARGET_IP} -b '' -s base namingContexts to find base DN."
      },
      {
        name: "Kerberos", port: "88", proto: "TCP/UDP",
        desc: "Authentication protocol used in Active Directory environments.",
        attacks: [
          "Kerberoasting — crack service account TGS tickets",
          "ASREPRoasting — crack hashes of pre-auth disabled users",
          "Pass-the-Ticket",
          "Golden Ticket (KRBTGT hash)",
          "Silver Ticket (service account hash)",
          "Overpass-the-Hash",
        ],
        cves: [],
        tools: ["impacket-GetUserSPNs", "impacket-GetNPUsers", "rubeus", "mimikatz"],
        notes: "Port 88 open = domain controller. Kerberoast any user with SPN set."
      },
      {
        name: "DNS", port: "53", proto: "TCP/UDP",
        desc: "Domain Name System — zone transfers can reveal full network topology.",
        attacks: [
          "Zone transfer (AXFR) — dump all DNS records",
          "Subdomain brute force",
          "DNS cache poisoning",
          "DNS tunneling for C2/exfil",
        ],
        cves: [],
        tools: ["dig", "nslookup", "gobuster dns", "dnsrecon"],
        notes: "dig axfr {TARGET_DOMAIN} @{TARGET_IP}. dnsrecon -d {TARGET_DOMAIN} -t axfr"
      },
      {
        name: "RPC / MSRPC", port: "135/49152+", proto: "TCP",
        desc: "Microsoft Remote Procedure Call — used for AD enumeration and lateral movement.",
        attacks: [
          "Null session user/group enumeration",
          "WMI command execution",
          "DCOM lateral movement",
        ],
        cves: ["CVE-2003-0352 (MS03-026 RPC DCOM RCE)"],
        tools: ["rpcclient", "impacket-wmiexec", "nmap --script msrpc-*"],
        notes: "rpcclient -U '' -N {TARGET_IP} -c 'enumdomusers'"
      },
      {
        name: "SNMP", port: "161/162", proto: "UDP",
        desc: "Simple Network Management Protocol — exposes system info via community strings.",
        attacks: [
          "Default community string brute force (public, private, manager)",
          "Enumerate users, processes, network interfaces",
          "Write community string → change device config",
          "SNMPv1/v2 cleartext sniffing",
        ],
        cves: [],
        tools: ["snmpwalk", "onesixtyone", "snmp-check", "nmap --script snmp-*"],
        notes: "onesixtyone -c /usr/share/seclists/Discovery/SNMP/snmp.txt {TARGET_IP} to find community strings."
      },
    ]
  },
  {
    category: "Thick Client & Enterprise",
    services: [
      {
        name: "Thick Client Apps", port: "varies", proto: "TCP",
        desc: "Desktop applications that communicate with backend servers — often have weak security.",
        attacks: [
          "Traffic interception (Wireshark, Burp with proxy settings)",
          "DLL hijacking",
          "Binary analysis for hardcoded credentials (strings, dnSpy, IDA)",
          "Memory analysis for credentials (Process Hacker)",
          "Insecure local storage (SQLite, registry, config files)",
          "Decompile .NET apps (dnSpy, ILSpy)",
        ],
        cves: [],
        tools: ["wireshark", "burpsuite", "dnspy", "procmon", "strings", "process-hacker"],
        notes: "Use Procmon to monitor file/registry access. Check AppData, ProgramData for config files with creds."
      },
      {
        name: "SAP", port: "3200/8000/44300", proto: "TCP",
        desc: "Enterprise ERP system — complex attack surface with many default accounts.",
        attacks: [
          "Default credentials (SAP*/06071992, DDIC/19920706)",
          "RFC function module abuse",
          "ABAP code injection",
          "SAP Router exploitation",
        ],
        cves: ["CVE-2020-6287 (RECON — unauthenticated admin)", "CVE-2022-22536 (HTTP request smuggling)"],
        tools: ["curl", "burpsuite", "nmap"],
        notes: "Check /sap/bc/gui/sap/its/webgui for web GUI. Default client: 000, 001."
      },
      {
        name: "Docker / Kubernetes", port: "2375/2376/6443/10250", proto: "TCP",
        desc: "Container orchestration — exposed APIs allow full host compromise.",
        attacks: [
          "Unauthenticated Docker API (port 2375) → run privileged container",
          "Kubernetes API server without auth",
          "Container escape via privileged mode",
          "Service account token abuse",
          "etcd unauthenticated access → dump secrets",
        ],
        cves: ["CVE-2019-5736 (runc container escape)", "CVE-2018-1002105 (K8s API server escalation)"],
        tools: ["docker", "kubectl", "curl"],
        notes: "curl http://{TARGET_IP}:2375/containers/json — if responds, Docker API is exposed. docker -H {TARGET_IP}:2375 run -v /:/mnt --rm -it alpine chroot /mnt sh"
      },
    ]
  },
]
