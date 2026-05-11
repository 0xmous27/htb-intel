CATEGORY_RULES = {
    "Recon": {
        "keywords": ["whois", "nslookup", "dig", "theHarvester", "shodan", "recon-ng", "maltego", "osint", "passive"],
        "tools": ["whois", "dig", "nslookup", "theharvester", "recon-ng"],
    },
    "Enumeration": {
        "keywords": ["nmap", "scan", "enumerate", "gobuster", "ffuf", "dirb", "dirbuster", "wfuzz", "nikto", "enum4linux", "ldapsearch", "rpcclient", "snmpwalk", "finger"],
        "tools": ["nmap", "gobuster", "ffuf", "dirb", "nikto", "enum4linux", "ldapsearch", "rpcclient", "snmpwalk"],
    },
    "Web Attacks": {
        "keywords": ["sql injection", "sqli", "xss", "cross-site", "lfi", "rfi", "file inclusion", "upload", "burp", "sqlmap", "command injection", "idor", "ssrf", "xxe", "ssti"],
        "tools": ["sqlmap", "burpsuite", "curl", "wget"],
    },
    "Password Attacks": {
        "keywords": ["brute force", "bruteforce", "crack", "hashcat", "john", "hydra", "medusa", "password", "hash", "rainbow", "wordlist", "rockyou", "spray"],
        "tools": ["hashcat", "john", "hydra", "medusa", "crackmapexec", "spray"],
    },
    "RDP Attacks": {
        "keywords": ["rdp", "xfreerdp", "rdesktop", "remote desktop", "3389", "mstsc", "rdp brute", "rdp tunnel"],
        "tools": ["xfreerdp", "rdesktop", "hydra", "nmap"],
    },
    "SSH Attacks": {
        "keywords": ["ssh", "22", "ssh tunnel", "ssh brute", "ssh key", "authorized_keys", "ssh-keygen", "scp", "sftp"],
        "tools": ["ssh", "scp", "sftp", "hydra"],
    },
    "SMB Attacks": {
        "keywords": ["smb", "samba", "445", "139", "smbclient", "smbmap", "crackmapexec", "psexec", "wmiexec", "pass-the-hash", "pth", "ntlm"],
        "tools": ["smbclient", "smbmap", "crackmapexec", "psexec", "wmiexec", "impacket"],
    },
    "Privilege Escalation": {
        "keywords": ["privesc", "privilege escalation", "sudo", "suid", "guid", "cron", "kernel exploit", "linpeas", "winpeas", "uac bypass", "token impersonation", "mimikatz", "pass-the-ticket"],
        "tools": ["linpeas", "winpeas", "mimikatz", "sudo", "bloodhound"],
    },
    "Pivoting": {
        "keywords": ["pivot", "tunnel", "port forward", "socks", "proxychains", "chisel", "ligolo", "ssh -L", "ssh -R", "ssh -D", "socat", "netsh"],
        "tools": ["chisel", "ligolo", "proxychains", "socat", "netsh"],
    },
    "File Transfer": {
        "keywords": ["upload", "download", "transfer", "wget", "curl", "certutil", "bitsadmin", "python -m http", "impacket-smbserver", "base64 encode", "nc -lvnp"],
        "tools": ["wget", "curl", "certutil", "bitsadmin", "scp"],
    },
    "Shells & Payloads": {
        "keywords": ["reverse shell", "bind shell", "msfvenom", "payload", "meterpreter", "netcat", "nc -e", "bash -i", "powershell -e", "webshell"],
        "tools": ["msfvenom", "netcat", "nc", "meterpreter"],
    },
    "Active Directory": {
        "keywords": ["active directory", "kerberos", "kerberoasting", "asreproasting", "bloodhound", "sharphound", "ldap", "domain controller", "dc", "gpo", "acl", "dcsync", "golden ticket", "silver ticket"],
        "tools": ["bloodhound", "sharphound", "rubeus", "impacket"],
    },
}


def categorize(text: str, command: str) -> str:
    combined = (text + " " + command).lower()
    scores = {}
    for cat, rules in CATEGORY_RULES.items():
        score = 0
        for kw in rules["keywords"]:
            if kw in combined:
                score += 2
        for tool in rules["tools"]:
            if tool in combined:
                score += 3
        if score:
            scores[cat] = score
    if scores:
        return max(scores, key=scores.get)
    return "Miscellaneous"
