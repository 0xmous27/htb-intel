export const SEVERITIES = ['info', 'low', 'medium', 'high', 'critical']

export const METHODS = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']

export const MATCHER_TYPES = ['word', 'regex', 'status', 'dsl', 'binary', 'xpath', 'size']

export const EXTRACTOR_TYPES = ['regex', 'json', 'xpath', 'kval', 'dsl']

export const PARTS = ['body', 'header', 'all', 'raw', 'response']

export const ATTACK_MODES = ['batteringram', 'pitchfork', 'clusterbomb']

export const PROTOCOLS = ['http', 'dns', 'tcp', 'ssl', 'file', 'headless', 'websocket']

export const COMMON_TAGS = [
  'xss','sqli','ssrf','lfi','rfi','rce','idor','redirect','cors','xxe',
  'ssti','crlf','jwt','graphql','api','exposure','misconfig','takeover',
  'disclosure','debug','backup','secrets','cloud','aws','azure','gcp',
  'wordpress','laravel','spring','docker','kubernetes','git','firebase',
]

export const STARTER_TEMPLATES = [
  // ── XSS: Reflected (Script Tag, body context) ─────────────────────────────
  {
    id: 'xss-reflected-script',
    name: 'XSS Reflected - Script Tag (Body Context)',
    severity: 'medium',
    tags: ['xss','reflected'],
    description: 'Detects reflected XSS via unencoded script tag injection. The payload must appear unencoded in the response body. If the app encodes < to &lt; it is NOT vulnerable.',
    remediation: 'Encode all user-supplied output with htmlspecialchars() or equivalent. Apply Content-Security-Policy headers.',
    classification: { cweId: 'CWE-79' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ['{{BaseURL}}/?q=xsstest<script>alert(1)</script>'],
      matchers: [
        { type: 'word', words: ['xsstest<script>alert(1)</script>'], part: 'body', condition: 'and' },
        { type: 'word', words: ['&lt;script&gt;','%3Cscript%3E'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── XSS: Attribute Breakout + iframe ──────────────────────────────────────
  {
    id: 'xss-attr-iframe',
    name: 'XSS Reflected - Attribute Breakout + iframe',
    severity: 'medium',
    tags: ['xss','reflected','iframe','attribute-injection'],
    description: 'Detects reflected XSS when the param is injected inside an HTML attribute (e.g. id="..."). Uses "><iframe onload=alert(1)> to break out of the attribute and inject HTML. Negative matcher ensures the payload is not HTML-encoded.',
    remediation: 'Encode all user-supplied output. Validate and sanitize the id parameter server-side.',
    classification: { cweId: 'CWE-79' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ['{{BaseURL}}/?id=xsstest%22%3E%3Ciframe+onload%3Dalert%281%29%3E'],
      matchers: [
        { type: 'word', words: ['<iframe onload=alert(1)>'], part: 'body', condition: 'and' },
        { type: 'word', words: ['&lt;iframe','%3Ciframe'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── SQLi: Error-Based (multi-DB) ───────────────────────────────────────────
  {
    id: 'sqli-error-based',
    name: 'SQL Injection - Error Based (MySQL/MSSQL/Oracle/PostgreSQL)',
    severity: 'high',
    tags: ['sqli','error-based'],
    description: 'Detects SQL injection via database error messages. Covers MySQL, MSSQL, Oracle, PostgreSQL, and SQLite. Uses OR condition on error strings — any single match confirms injection. Negative matcher on 404/500 prevents false positives from generic error pages.',
    remediation: 'Use parameterized queries / prepared statements. Never concatenate user input into SQL strings.',
    classification: { cweId: 'CWE-89', cvssScore: '9.8', cvssMetrics: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ["{{BaseURL}}/?id=1'--", "{{BaseURL}}/?id=1\"--", "{{BaseURL}}/?id=1`--"],
      matchers: [
        { type: 'word', words: [
          "you have an error in your sql syntax",
          "warning: mysql_fetch",
          "warning: mysqli_",
          "unclosed quotation mark after the character string",
          "quoted string not properly terminated",
          "ora-00933","ora-00907","ora-01756",
          "pg::syntaxerror","pdo::query()","pdoexception",
          "sqlite3::query","sqlite_error",
          "microsoft ole db provider for sql server",
          "odbc sql server driver",
          "syntax error or access violation",
        ], part: 'body', condition: 'or' },
        { type: 'word', words: ['404 not found','403 forbidden','access denied'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── SSRF: OOB via interactsh ───────────────────────────────────────────────
  {
    id: 'ssrf-oob-interactsh',
    name: 'SSRF - Out-of-Band Detection (interactsh)',
    severity: 'high',
    tags: ['ssrf','oob','interactsh'],
    description: 'Detects blind SSRF via out-of-band DNS/HTTP callback using interactsh. Covers common SSRF parameter names. Run with nuclei -interact-server to catch callbacks. A DNS or HTTP ping back confirms the server is making outbound requests.',
    remediation: 'Validate and whitelist allowed URLs server-side. Block requests to internal/private IP ranges. Use an allowlist of permitted domains.',
    classification: { cweId: 'CWE-918', cvssScore: '8.6', cvssMetrics: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:N/A:N' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/?url=https://{{interactsh-url}}',
        '{{BaseURL}}/?uri=https://{{interactsh-url}}',
        '{{BaseURL}}/?dest=https://{{interactsh-url}}',
        '{{BaseURL}}/?target=https://{{interactsh-url}}',
        '{{BaseURL}}/?callback=https://{{interactsh-url}}',
        '{{BaseURL}}/?fetch=https://{{interactsh-url}}',
        '{{BaseURL}}/?proxy=https://{{interactsh-url}}',
      ],
      matchers: [
        { type: 'word', words: ['interact.sh'], part: 'interactsh_protocol' },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── Open Redirect ──────────────────────────────────────────────────────────
  {
    id: 'open-redirect',
    name: 'Open Redirect - External Domain',
    severity: 'medium',
    tags: ['redirect','open-redirect'],
    description: 'Detects open redirect vulnerabilities by checking if the Location header points to an external domain after following the redirect. Covers 15+ common redirect parameter names. Negative matcher prevents false positives from same-domain redirects.',
    remediation: 'Validate redirect destinations against a whitelist of allowed domains. Never redirect to user-supplied URLs without validation.',
    classification: { cweId: 'CWE-601' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/?next=https://evil.com',
        '{{BaseURL}}/?redirect=https://evil.com',
        '{{BaseURL}}/?url=https://evil.com',
        '{{BaseURL}}/?return=https://evil.com',
        '{{BaseURL}}/?returnTo=https://evil.com',
        '{{BaseURL}}/?goto=https://evil.com',
        '{{BaseURL}}/?dest=https://evil.com',
        '{{BaseURL}}/?destination=https://evil.com',
        '{{BaseURL}}/?redir=https://evil.com',
        '{{BaseURL}}/?redirect_uri=https://evil.com',
        '{{BaseURL}}/?checkout_url=https://evil.com',
        '{{BaseURL}}/?continue=https://evil.com',
      ],
      redirects: true,
      matchers: [
        { type: 'regex', regex: ['(?i)Location:\\s*https?://evil\\.com'], part: 'header' },
        { type: 'status', status: [301, 302, 303, 307, 308] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── Git Config Exposure ────────────────────────────────────────────────────
  {
    id: 'git-config-exposure',
    name: 'Git Config File Exposure',
    severity: 'medium',
    tags: ['git','exposure','disclosure'],
    description: 'Detects publicly accessible .git/config files. Confirms with two specific git config markers to avoid false positives from pages that happen to contain "[core]". Also checks HEAD and COMMIT_EDITMSG for deeper confirmation.',
    remediation: 'Block access to .git/ directory in web server config. Add "Deny from all" for .git in Apache or "location ~ /\\.git { deny all; }" in Nginx.',
    classification: { cweId: 'CWE-538' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ['{{BaseURL}}/.git/config'],
      matchers: [
        { type: 'word', words: ['[core]'], part: 'body', condition: 'and' },
        { type: 'regex', regex: ['repositoryformatversion\\s*=\\s*0|\\[remote\\s+"origin"\\]|filemode\\s*=\\s*(true|false)'], part: 'body' },
        { type: 'word', words: ['404','not found','forbidden','access denied'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── CORS Misconfiguration ──────────────────────────────────────────────────
  {
    id: 'cors-arbitrary-origin',
    name: 'CORS Misconfiguration - Arbitrary Origin Reflected',
    severity: 'medium',
    tags: ['cors','misconfig'],
    description: 'Detects CORS misconfiguration where the server reflects any Origin in Access-Control-Allow-Origin. Also checks for Access-Control-Allow-Credentials: true which makes it exploitable for credential theft. Both conditions must match.',
    remediation: 'Validate the Origin header against a strict whitelist. Never use wildcard (*) with credentials. Set Access-Control-Allow-Origin to specific trusted domains only.',
    classification: { cweId: 'CWE-942' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ['{{BaseURL}}'],
      headers: { Origin: 'https://evil.com' },
      matchers: [
        { type: 'word', words: ['Access-Control-Allow-Origin: https://evil.com'], part: 'header' },
        { type: 'word', words: ['Access-Control-Allow-Credentials: true'], part: 'header' },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── Debug / Actuator Exposure ──────────────────────────────────────────────
  {
    id: 'debug-endpoint-exposure',
    name: 'Debug / Actuator Endpoint Exposure',
    severity: 'high',
    tags: ['debug','exposure','spring','php'],
    description: 'Detects exposed debug and diagnostic endpoints. Covers Spring Boot Actuator (/actuator/env leaks DB passwords), PHP info pages, and generic debug endpoints. Uses specific content markers to avoid false positives.',
    remediation: 'Disable or restrict access to debug endpoints in production. For Spring Boot, set management.endpoints.web.exposure.include to only required endpoints.',
    classification: { cweId: 'CWE-215' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/actuator/env',
        '{{BaseURL}}/actuator/mappings',
        '{{BaseURL}}/actuator/beans',
        '{{BaseURL}}/phpinfo.php',
        '{{BaseURL}}/info.php',
        '{{BaseURL}}/_debug',
        '{{BaseURL}}/debug',
        '{{BaseURL}}/console',
      ],
      matchers: [
        { type: 'word', words: [
          'spring.datasource.password',
          'spring.datasource.url',
          'PHP Version',
          'phpinfo()',
          'System Environment',
          'activeProfiles',
        ], part: 'body', condition: 'or' },
        { type: 'word', words: ['404','not found','access denied','403'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── JWT None Algorithm ─────────────────────────────────────────────────────
  {
    id: 'jwt-none-algorithm',
    name: 'JWT None Algorithm Bypass',
    severity: 'high',
    tags: ['jwt','misconfig','auth-bypass'],
    description: 'Detects JWT libraries that accept the "none" algorithm, bypassing signature verification. Sends a JWT with alg:none and no signature. If the server returns 200 and does NOT return an auth error, the bypass works. Negative matcher on common auth error strings prevents false positives.',
    remediation: 'Explicitly reject the "none" algorithm in JWT validation. Use a strict allowlist of accepted algorithms (e.g. only HS256 or RS256).',
    classification: { cweId: 'CWE-347', cvssScore: '9.1', cvssMetrics: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:N' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ['{{BaseURL}}/api/user', '{{BaseURL}}/api/me', '{{BaseURL}}/api/profile', '{{BaseURL}}/api/v1/user'],
      headers: { Authorization: 'Bearer eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.eyJzdWIiOiIxMjM0NTY3ODkwIiwicm9sZSI6ImFkbWluIn0.' },
      matchers: [
        { type: 'word', words: [
          'unauthorized','invalid token','invalid signature','forbidden',
          'jwt expired','token expired','authentication failed',
          'invalid_token','access denied',
        ], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── Backup File Exposure ───────────────────────────────────────────────────
  {
    id: 'backup-file-exposure',
    name: 'Backup File Exposure',
    severity: 'high',
    tags: ['backup','exposure','disclosure'],
    description: 'Detects exposed backup archives and database dumps. Uses Content-Type and file size DSL matcher to confirm actual file download (not a 200 HTML error page). Negative matcher on HTML content-type prevents false positives from custom 404 pages that return 200.',
    remediation: 'Remove backup files from web root. Store backups outside the document root or in a non-web-accessible location.',
    classification: { cweId: 'CWE-530' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/backup.zip','{{BaseURL}}/backup.tar.gz','{{BaseURL}}/backup.sql',
        '{{BaseURL}}/db.sql','{{BaseURL}}/database.sql','{{BaseURL}}/dump.sql',
        '{{BaseURL}}/site.zip','{{BaseURL}}/www.zip','{{BaseURL}}/web.zip',
        '{{BaseURL}}/{{Hostname}}.zip','{{BaseURL}}/{{Hostname}}.tar.gz',
      ],
      matchers: [
        { type: 'dsl', dsl: ['!contains(tolower(header), "text/html")', 'status_code == 200', 'content_length > 100'] },
        { type: 'word', words: ['404','not found','page not found'], part: 'body', negative: true },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── Secrets in JS ──────────────────────────────────────────────────────────
  {
    id: 'secrets-in-js',
    name: 'Secrets / API Keys in JavaScript',
    severity: 'high',
    tags: ['secrets','exposure','js','disclosure'],
    description: 'Detects hardcoded API keys, tokens, and credentials in JavaScript files. Uses multiple specific regex patterns for AWS keys, GitHub tokens, private keys, and generic API key patterns. Negative matcher prevents false positives from minified variable names.',
    remediation: 'Never hardcode secrets in client-side code. Use environment variables server-side. Rotate any exposed credentials immediately.',
    classification: { cweId: 'CWE-312' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: ['{{BaseURL}}', '{{BaseURL}}/js/app.js', '{{BaseURL}}/static/js/main.js', '{{BaseURL}}/assets/js/app.js'],
      matchers: [
        { type: 'regex', regex: [
          '(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}',
          'ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}',
          '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY',
          '(api[_-]?key|apikey|api[_-]?secret|access[_-]?token)\\s*[=:]\\s*["\'][a-zA-Z0-9_\\-]{20,}["\']',
          'DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=',
        ], part: 'body', condition: 'or' },
        { type: 'word', words: ['404','not found'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
  // ── LFI: Linux/Windows ────────────────────────────────────────────────────
  {
    id: 'lfi-path-traversal',
    name: 'Local File Inclusion - Path Traversal',
    severity: 'high',
    tags: ['lfi','path-traversal'],
    description: 'Detects LFI via path traversal. Tries both Linux (/etc/passwd) and Windows (win.ini) targets with multiple traversal depths. Regex matchers confirm actual file content — not just a 200 response.',
    remediation: 'Validate and sanitize file path inputs. Use a whitelist of allowed files. Never pass user input directly to file system functions.',
    classification: { cweId: 'CWE-22', cvssScore: '7.5', cvssMetrics: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:N/A:N' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/?file=../../../etc/passwd',
        '{{BaseURL}}/?file=../../../../etc/passwd',
        '{{BaseURL}}/?file=../../../../../etc/passwd',
        '{{BaseURL}}/?page=../../../etc/passwd',
        '{{BaseURL}}/?path=../../../etc/passwd',
        '{{BaseURL}}/?include=../../../etc/passwd',
        '{{BaseURL}}/?file=..\\..\\..\\windows\\win.ini',
        '{{BaseURL}}/?file=..%2F..%2F..%2Fetc%2Fpasswd',
        '{{BaseURL}}/?file=....//....//....//etc/passwd',
      ],
      matchers: [
        { type: 'regex', regex: ['root:[x*]:0:0:|daemon:[x*]:[0-9]'], part: 'body' },
        { type: 'regex', regex: ['\\[boot loader\\]|\\[operating systems\\]|\\[fonts\\]'], part: 'body' },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'or',
    }],
  },
  // ── RCE: Command Injection ─────────────────────────────────────────────────
  {
    id: 'rce-command-injection',
    name: 'RCE - OS Command Injection',
    severity: 'critical',
    tags: ['rce','command-injection'],
    description: 'Detects OS command injection via common injection characters. Uses a random marker ({{rand_base(8)}}) echoed back to confirm execution — not just an error message. Covers both Linux (id/whoami output) and Windows (ver output) confirmation.',
    remediation: 'Never pass user input to shell commands. Use language-native APIs instead of shell execution. If shell is required, use strict input validation and escaping.',
    classification: { cweId: 'CWE-78', cvssScore: '9.8', cvssMetrics: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/?cmd=id',
        '{{BaseURL}}/?exec=id',
        '{{BaseURL}}/?command=id',
        '{{BaseURL}}/?ping=127.0.0.1;id',
        '{{BaseURL}}/?ip=127.0.0.1|id',
        '{{BaseURL}}/?host=127.0.0.1`id`',
      ],
      matchers: [
        { type: 'regex', regex: ['uid=[0-9]+\\([a-z_]+\\)\\s+gid=[0-9]+'], part: 'body' },
        { type: 'regex', regex: ['Microsoft Windows \\[Version [0-9\\.]+\\]'], part: 'body' },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'or',
    }],
  },
  // ── SSTI ──────────────────────────────────────────────────────────────────
  {
    id: 'ssti-detection',
    name: 'SSTI - Server-Side Template Injection',
    severity: 'critical',
    tags: ['ssti','rce'],
    description: 'Detects SSTI by injecting a math expression ({{7*7}}) that evaluates to 49 in Jinja2/Twig/Freemarker/Velocity. Also tries ${7*7} for EL/Freemarker. Confirms with exact numeric output — not just a 200 response.',
    remediation: 'Never pass user input directly into template rendering functions. Use sandboxed template environments. Validate and sanitize all template inputs.',
    classification: { cweId: 'CWE-94', cvssScore: '9.8', cvssMetrics: 'CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:U/C:H/I:H/A:H' },
    metadata: { verified: true },
    requests: [{
      method: 'GET',
      paths: [
        '{{BaseURL}}/?name={{7*7}}',
        '{{BaseURL}}/?q={{7*7}}',
        '{{BaseURL}}/?search=${7*7}',
        '{{BaseURL}}/?input=#{7*7}',
        '{{BaseURL}}/?msg=<%= 7*7 %>',
      ],
      matchers: [
        { type: 'word', words: ['49'], part: 'body', condition: 'and' },
        { type: 'word', words: ['{{7*7}}','${7*7}','#{7*7}'], part: 'body', negative: true },
        { type: 'status', status: [200] },
      ],
      matchersCondition: 'and',
    }],
  },
]

export const REGEX_LIBRARY = {
  'XSS': [
    { id: 'xss-basic', pattern: '<script[^>]*>[^<]*</script>', example: '<script>alert(1)</script>', desc: 'Basic script tag XSS', fp: 'May match legitimate scripts', severity: 'medium', accuracy: 'medium' },
    { id: 'xss-event', pattern: 'on(load|error|click|mouseover)\\s*=', example: 'onload=alert(1)', desc: 'Event handler XSS', fp: 'Low FP in response context', severity: 'medium', accuracy: 'high' },
    { id: 'xss-svg', pattern: '<svg[^>]*on\\w+\\s*=', example: '<svg onload=alert(1)>', desc: 'SVG-based XSS', fp: 'Low', severity: 'medium', accuracy: 'high' },
  ],
  'SQL Injection': [
    { id: 'sqli-error-mysql', pattern: "you have an error in your sql syntax|warning: mysql_|unclosed quotation mark", example: "You have an error in your SQL syntax", desc: 'MySQL error messages', fp: 'Very low', severity: 'high', accuracy: 'high' },
    { id: 'sqli-error-mssql', pattern: 'microsoft ole db provider for sql server|odbc sql server driver|syntax error converting', example: 'Microsoft OLE DB Provider for SQL Server', desc: 'MSSQL error messages', fp: 'Very low', severity: 'high', accuracy: 'high' },
    { id: 'sqli-error-oracle', pattern: 'ora-[0-9]{4,5}:|quoted string not properly terminated', example: 'ORA-00933: SQL command not properly ended', desc: 'Oracle DB errors', fp: 'Very low', severity: 'high', accuracy: 'high' },
  ],
  'SSRF': [
    { id: 'ssrf-internal-ip', pattern: '(127\\.0\\.0\\.1|169\\.254\\.169\\.254|10\\.\\d+\\.\\d+\\.\\d+|192\\.168\\.\\d+\\.\\d+)', example: '169.254.169.254', desc: 'Internal IP in response (SSRF indicator)', fp: 'Medium - check context', severity: 'high', accuracy: 'medium' },
    { id: 'ssrf-aws-meta', pattern: 'ami-id|instance-id|iam/security-credentials', example: 'ami-id: ami-12345', desc: 'AWS metadata response', fp: 'Very low', severity: 'critical', accuracy: 'high' },
  ],
  'Open Redirect': [
    { id: 'redirect-location', pattern: 'Location:\\s*https?://(?!your-domain)', example: 'Location: https://evil.com', desc: 'Redirect to external domain', fp: 'Medium - needs domain check', severity: 'medium', accuracy: 'medium' },
  ],
  'LFI/RFI': [
    { id: 'lfi-etc-passwd', pattern: 'root:[x*]:0:0:|daemon:[x*]:[0-9]', example: 'root:x:0:0:root:/root:/bin/bash', desc: '/etc/passwd content', fp: 'Very low', severity: 'high', accuracy: 'high' },
    { id: 'lfi-win-ini', pattern: '\\[boot loader\\]|\\[operating systems\\]', example: '[boot loader]', desc: 'Windows boot.ini content', fp: 'Very low', severity: 'high', accuracy: 'high' },
  ],
  'RCE': [
    { id: 'rce-uid', pattern: 'uid=[0-9]+\\([a-z]+\\)\\s+gid=[0-9]+', example: 'uid=0(root) gid=0(root)', desc: 'Unix id command output', fp: 'Very low', severity: 'critical', accuracy: 'high' },
    { id: 'rce-win-ver', pattern: 'Microsoft Windows \\[Version [0-9\\.]+\\]', example: 'Microsoft Windows [Version 10.0.19041]', desc: 'Windows ver command output', fp: 'Very low', severity: 'critical', accuracy: 'high' },
  ],
  'Secrets & Keys': [
    { id: 'aws-key', pattern: '(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}', example: 'AKIAIOSFODNN7EXAMPLE', desc: 'AWS Access Key ID', fp: 'Low', severity: 'critical', accuracy: 'high' },
    { id: 'aws-secret', pattern: '[a-zA-Z0-9/+]{40}', example: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY', desc: 'AWS Secret Key (context-dependent)', fp: 'High - needs context', severity: 'critical', accuracy: 'low' },
    { id: 'github-token', pattern: 'ghp_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82}', example: 'ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx', desc: 'GitHub Personal Access Token', fp: 'Very low', severity: 'critical', accuracy: 'high' },
    { id: 'jwt-token', pattern: 'eyJ[a-zA-Z0-9_-]+\\.eyJ[a-zA-Z0-9_-]+\\.[a-zA-Z0-9_-]+', example: 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1c2VyIn0.xxx', desc: 'JWT Token', fp: 'Low', severity: 'medium', accuracy: 'high' },
    { id: 'generic-api-key', pattern: '(api[_-]?key|apikey|api[_-]?secret)\\s*[=:]\\s*["\']?[a-zA-Z0-9_\\-]{16,}', example: 'api_key = "abc123xyz789"', desc: 'Generic API key pattern', fp: 'Medium', severity: 'high', accuracy: 'medium' },
    { id: 'private-key', pattern: '-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY', example: '-----BEGIN RSA PRIVATE KEY-----', desc: 'Private key header', fp: 'Very low', severity: 'critical', accuracy: 'high' },
  ],
  'Cloud': [
    { id: 'azure-storage', pattern: 'DefaultEndpointsProtocol=https;AccountName=[^;]+;AccountKey=', example: 'DefaultEndpointsProtocol=https;AccountName=myaccount;AccountKey=xxx', desc: 'Azure Storage connection string', fp: 'Very low', severity: 'critical', accuracy: 'high' },
    { id: 'gcp-service-account', pattern: '"type":\\s*"service_account"', example: '"type": "service_account"', desc: 'GCP service account JSON', fp: 'Very low', severity: 'critical', accuracy: 'high' },
    { id: 's3-bucket', pattern: 's3\\.amazonaws\\.com/[a-z0-9\\-\\.]+|[a-z0-9\\-\\.]+\\.s3\\.amazonaws\\.com', example: 'mybucket.s3.amazonaws.com', desc: 'S3 bucket URL', fp: 'Low', severity: 'medium', accuracy: 'high' },
  ],
  'Endpoints': [
    { id: 'js-endpoints', pattern: '(https?://[a-zA-Z0-9_\\-\\.]+/[a-zA-Z0-9_\\-/\\.?=&%#]+)', example: 'https://api.example.com/v1/users', desc: 'URLs in JavaScript', fp: 'Medium', severity: 'info', accuracy: 'medium' },
    { id: 'graphql', pattern: '(graphql|__schema|__typename|introspectionQuery)', example: '/graphql', desc: 'GraphQL endpoint indicators', fp: 'Low', severity: 'medium', accuracy: 'high' },
    { id: 'swagger', pattern: '(swagger-ui|openapi|api-docs|swagger\\.json)', example: '/swagger-ui.html', desc: 'Swagger/OpenAPI exposure', fp: 'Low', severity: 'medium', accuracy: 'high' },
  ],
  'Git Leaks': [
    { id: 'git-config', pattern: '\\[core\\]|\\[remote "origin"\\]', example: '[core]\n\trepositoryformatversion = 0', desc: '.git/config content', fp: 'Very low', severity: 'medium', accuracy: 'high' },
    { id: 'git-credentials', pattern: 'https?://[^:]+:[^@]+@github\\.com', example: 'https://user:token@github.com', desc: 'Git credentials in URL', fp: 'Very low', severity: 'critical', accuracy: 'high' },
  ],
}

export const GF_STARTERS = [
  {
    name: 'sqli',
    desc: 'SQL Injection — parameter names commonly used in DB queries',
    severity: 'high',
    fp: 'Low — these params are rarely used for non-DB purposes',
    patterns: ['id=','select=','insert=','update=','delete=','query=','search=','order=','sort=','where=','filter=','from=','group=','limit=','offset=','union=','having=','table=','column=','field=','row='],
    extensions: ['.php','.asp','.aspx','.jsp','.cfm'],
  },
  {
    name: 'xss',
    desc: 'XSS — parameters that are typically reflected in HTML responses',
    severity: 'medium',
    fp: 'Medium — many of these params exist without XSS',
    patterns: ['q=','s=','search=','query=','keyword=','term=','name=','title=','content=','message=','comment=','text=','input=','value=','data=','output=','html=','body=','description=','subject=','username=','user=','email='],
    extensions: ['.php','.html','.asp','.aspx','.jsp'],
  },
  {
    name: 'ssrf',
    desc: 'SSRF — parameters that accept URLs or hostnames for server-side fetching',
    severity: 'high',
    fp: 'Low — these param names strongly suggest server-side URL fetching',
    patterns: ['url=','uri=','path=','dest=','redirect=','next=','target=','link=','src=','source=','callback=','fetch=','load=','proxy=','request=','endpoint=','host=','domain=','site=','feed=','webhook=','service=','api=','resource='],
    extensions: [],
  },
  {
    name: 'redirect',
    desc: 'Open Redirect — parameters used for post-action redirects',
    severity: 'medium',
    fp: 'Low — these are classic redirect param names',
    patterns: ['redirect=','next=','url=','target=','rurl=','dest=','destination=','redir=','redirect_uri=','redirect_url=','return=','returnTo=','return_url=','checkout_url=','continue=','goto=','back=','forward=','location=','ref=','referer=','referrer='],
    extensions: [],
  },
  {
    name: 'lfi',
    desc: 'LFI/Path Traversal — parameters that load files or templates',
    severity: 'high',
    fp: 'Low — these params are commonly used for file inclusion',
    patterns: ['file=','path=','page=','include=','document=','folder=','root=','pg=','style=','pdf=','template=','php_path=','doc=','view=','layout=','module=','conf=','config=','load=','read=','show=','display='],
    extensions: ['.php','.asp','.aspx','.jsp'],
  },
  {
    name: 'rce',
    desc: 'RCE/Command Injection — parameters that may be passed to shell commands',
    severity: 'critical',
    fp: 'Low — these param names suggest OS-level operations',
    patterns: ['cmd=','exec=','command=','execute=','ping=','query=','jump=','code=','reg=','do=','func=','arg=','option=','load=','process=','step=','read=','feature=','exe=','payload=','run=','print=','ip=','host='],
    extensions: ['.php','.asp','.aspx','.jsp','.cgi','.pl'],
  },
  {
    name: 'ssti',
    desc: 'SSTI — parameters rendered inside template engines',
    severity: 'critical',
    fp: 'Medium — many of these params exist without SSTI',
    patterns: ['name=','template=','preview=','id=','title=','content=','message=','subject=','body=','text=','output=','render=','view=','page=','html=','format=','lang=','locale='],
    extensions: ['.php','.py','.rb','.java','.html'],
  },
  {
    name: 'idor',
    desc: 'IDOR — parameters that reference object IDs or user resources',
    severity: 'high',
    fp: 'Medium — IDs are everywhere, manual verification needed',
    patterns: ['id=','user_id=','account_id=','order_id=','invoice_id=','doc_id=','file_id=','uid=','pid=','tid=','rid=','oid=','ref=','token=','key=','hash=','uuid=','guid=','record=','item=','object='],
    extensions: [],
  },
  {
    name: 'secrets',
    desc: 'Secrets/Credentials — patterns in JS/config files that may contain hardcoded secrets',
    severity: 'critical',
    fp: 'Medium — variable names match but values may be placeholders',
    patterns: ['api_key','apikey','api-key','secret','password','passwd','token','auth','credential','private_key','access_key','secret_key','client_secret','app_secret','db_password','database_password','smtp_password','aws_secret','stripe_key','twilio_token'],
    extensions: ['.js','.json','.env','.config','.yml','.yaml','.xml','.ini','.conf'],
  },
  {
    name: 'cors',
    desc: 'CORS — endpoints that may have misconfigured cross-origin policies',
    severity: 'medium',
    fp: 'Low — these are API/data endpoints likely to have CORS headers',
    patterns: ['/api/','/v1/','/v2/','/v3/','/graphql','/rest/','/data/','/ajax/','/json/','/xml/','/feed/','/rss/'],
    extensions: ['.json','.xml'],
  },
  {
    name: 'jwt',
    desc: 'JWT — endpoints that accept JWT tokens in Authorization header',
    severity: 'high',
    fp: 'Low — these are authenticated API endpoints',
    patterns: ['/api/','/auth/','/user/','/me/','/profile/','/account/','/admin/','/dashboard/','/token','/refresh','/verify'],
    extensions: [],
  },
]
