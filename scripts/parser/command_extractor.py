import re

# Patterns that strongly indicate a shell/terminal command
COMMAND_PATTERNS = [
    r"^\s*(sudo\s+)?\w[\w\-\.]+\s+[\-\/][\w\-]+",   # tool -flag or tool /flag
    r"^\s*(sudo\s+)?[\w\-]+\s+\w.*\d{1,3}\.\d{1,3}",  # tool ... IP
    r"^\s*\$\s+.+",                                    # $ prompt
    r"^\s*#\s+.+",                                     # # prompt
    r"^\s*(python3?|ruby|perl|bash|sh|powershell|cmd)\s+",
    r"^\s*curl\s+",
    r"^\s*wget\s+",
    r"^\s*nc\s+",
    r"^\s*nmap\s+",
    r"^\s*ssh\s+",
    r"^\s*scp\s+",
    r"^\s*xfreerdp\s+",
    r"^\s*hydra\s+",
    r"^\s*hashcat\s+",
    r"^\s*john\s+",
    r"^\s*sqlmap\s+",
    r"^\s*msfvenom\s+",
    r"^\s*gobuster\s+",
    r"^\s*ffuf\s+",
    r"^\s*enum4linux",
    r"^\s*smbclient\s+",
    r"^\s*crackmapexec\s+",
    r"^\s*impacket",
    r"^\s*evil-winrm\s+",
    r"^\s*chisel\s+",
    r"^\s*proxychains\s+",
    r"^\s*certutil\s+",
    r"^\s*msfconsole",
    r"^\s*use\s+exploit/",
    r"^\s*set\s+(RHOSTS|LHOST|RHOST|PAYLOAD|USERNAME|PASSWORD)\s+",
    r"^\s*run\b",
    r"^\s*exploit\b",
]

COMPILED = [re.compile(p, re.IGNORECASE) for p in COMMAND_PATTERNS]

# Known high-value tools for naming
TOOL_NAMES = {
    "xfreerdp": "RDP Login via xfreerdp",
    "rdesktop": "RDP Login via rdesktop",
    "hydra": "Brute Force via Hydra",
    "nmap": "Port Scan via Nmap",
    "gobuster": "Directory Brute Force via Gobuster",
    "ffuf": "Fuzzing via FFUF",
    "sqlmap": "SQL Injection via SQLMap",
    "msfvenom": "Payload Generation via msfvenom",
    "hashcat": "Hash Cracking via Hashcat",
    "john": "Hash Cracking via John",
    "smbclient": "SMB Access via smbclient",
    "crackmapexec": "SMB/AD Attack via CrackMapExec",
    "enum4linux": "SMB Enumeration via enum4linux",
    "ssh": "SSH Connection",
    "scp": "File Transfer via SCP",
    "curl": "HTTP Request via curl",
    "wget": "File Download via wget",
    "nc": "Netcat Listener/Shell",
    "python": "Python HTTP Server / Shell",
    "chisel": "Port Forwarding via Chisel",
    "proxychains": "Proxychains Tunnel",
    "evil-winrm": "WinRM Shell via evil-winrm",
    "impacket": "Impacket Attack",
    "linpeas": "Linux PrivEsc Enumeration",
    "winpeas": "Windows PrivEsc Enumeration",
    "bloodhound": "AD Enumeration via BloodHound",
    "certutil": "File Transfer via certutil",
}


def is_command(line: str) -> bool:
    line = line.strip()
    if len(line) < 4 or len(line) > 500:
        return False
    # Skip pure prose lines
    if line.endswith(".") and " " in line and not any(c in line for c in ["-", "/", "\\", "|"]):
        return False
    return any(p.match(line) for p in COMPILED)


def normalize_command(cmd: str) -> str:
    """Replace common IP/user/pass patterns with placeholders."""
    cmd = re.sub(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", "{TARGET_IP}", cmd)
    cmd = re.sub(r"\b(?:administrator|admin|root|user|username)\b", "{USERNAME}", cmd, flags=re.IGNORECASE)
    # Don't replace passwords blindly — only in known flag positions
    cmd = re.sub(r"(/p:|--password\s+|:)([^\s/]+)", lambda m: m.group(1) + "{PASSWORD}", cmd, flags=re.IGNORECASE)
    cmd = re.sub(r"(/u:|--username\s+|/user:)([^\s/]+)", lambda m: m.group(1) + "{USERNAME}", cmd, flags=re.IGNORECASE)
    cmd = re.sub(r"(/v:|--host\s+|@)(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", lambda m: m.group(1) + "{TARGET_IP}", cmd)
    return cmd.strip()


def infer_name(command: str, context: str) -> str:
    cmd_lower = command.lower()
    for tool, name in TOOL_NAMES.items():
        if tool in cmd_lower:
            return name
    # Fallback: first word of command
    first = command.strip().lstrip("$# ").split()[0] if command.strip() else "Command"
    return f"Command: {first}"


def infer_purpose(command: str, context: str) -> str:
    """Generate a short purpose from surrounding context."""
    ctx = context.strip()
    # Take first sentence-like chunk
    sentences = re.split(r"[.!?\n]", ctx)
    for s in sentences:
        s = s.strip()
        if 10 < len(s) < 120:
            return s
    return "Execute attack technique"


def infer_when(command: str, category: str) -> str:
    hints = {
        "RDP Attacks": "When RDP (port 3389) is open and credentials are available",
        "SSH Attacks": "When SSH (port 22) is open",
        "SMB Attacks": "When SMB (port 445/139) is open",
        "Web Attacks": "When a web application is running",
        "Password Attacks": "When credentials or hashes need to be cracked",
        "Privilege Escalation": "After initial access, to gain higher privileges",
        "Pivoting": "When lateral movement to internal network is needed",
        "File Transfer": "When files need to be moved between machines",
        "Enumeration": "During active reconnaissance phase",
        "Recon": "During passive information gathering phase",
        "Shells & Payloads": "When establishing a reverse/bind shell",
        "Active Directory": "When targeting a Windows domain environment",
    }
    return hints.get(category, "When applicable during the engagement")


def extract_commands(text: str) -> list[dict]:
    """Extract commands with surrounding context from a block of text."""
    lines = text.split("\n")
    results = []
    for i, line in enumerate(lines):
        if is_command(line):
            # Grab up to 3 lines of context before
            ctx_start = max(0, i - 3)
            context = " ".join(lines[ctx_start:i]).strip()
            cmd = normalize_command(line.strip().lstrip("$# "))
            results.append({"raw_command": cmd, "context": context})
    return results
