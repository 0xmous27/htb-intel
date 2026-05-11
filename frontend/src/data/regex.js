export const REGEX_TOOLS = [
  {
    tool: "grep",
    desc: "Search for patterns in files or output. Most used tool in pentesting for filtering.",
    icon: "◈",
    sections: [
      {
        title: "Basic Usage",
        entries: [
          { desc: "Search for string in file", cmd: "grep 'password' file.txt" },
          { desc: "Case-insensitive search", cmd: "grep -i 'password' file.txt" },
          { desc: "Search recursively in directory", cmd: "grep -r 'password' /var/www/" },
          { desc: "Show line numbers", cmd: "grep -n 'error' /var/log/apache2/error.log" },
          { desc: "Invert match (show non-matching lines)", cmd: "grep -v '^#' /etc/ssh/sshd_config" },
          { desc: "Count matching lines", cmd: "grep -c 'Failed' /var/log/auth.log" },
          { desc: "Show only matched part", cmd: "grep -o '[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+\\.[0-9]\\+' file.txt" },
          { desc: "Show N lines after match", cmd: "grep -A 3 'password' config.txt" },
          { desc: "Show N lines before match", cmd: "grep -B 2 'error' log.txt" },
          { desc: "Show N lines around match", cmd: "grep -C 2 'root' /etc/passwd" },
        ]
      },
      {
        title: "Pentest Scenarios",
        entries: [
          { desc: "Find passwords in files", cmd: "grep -rni 'password\\|passwd\\|pwd\\|secret\\|key' /var/www/ 2>/dev/null" },
          { desc: "Find IPs in output", cmd: "grep -oE '([0-9]{1,3}\\.){3}[0-9]{1,3}' nmap_output.txt" },
          { desc: "Find emails in file", cmd: "grep -oE '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}' file.txt" },
          { desc: "Find URLs in file", cmd: "grep -oE 'https?://[^\"\\s]+' source.html" },
          { desc: "Find open ports from nmap output", cmd: "grep '/open/' nmap_full.txt | grep -oE '^[0-9]+'" },
          { desc: "Find users in /etc/passwd (login shells)", cmd: "grep -v '/nologin\\|/false' /etc/passwd | cut -d: -f1" },
          { desc: "Find SUID files from find output", cmd: "find / -perm -4000 2>/dev/null | grep -v proc" },
          { desc: "Filter failed SSH logins", cmd: "grep 'Failed password' /var/log/auth.log | grep -oE 'from [0-9.]+' | sort | uniq -c | sort -rn" },
          { desc: "Find hardcoded creds in source code", cmd: "grep -rn 'password\\s*=\\s*[\"\\x27][^\"\\x27]' /var/www/ 2>/dev/null" },
          { desc: "Find PHP webshells", cmd: "grep -rn 'system\\|exec\\|passthru\\|shell_exec\\|eval' /var/www/ --include='*.php'" },
        ]
      },
      {
        title: "Extended Regex (-E)",
        entries: [
          { desc: "Match multiple patterns (OR)", cmd: "grep -E 'root|admin|user' /etc/passwd" },
          { desc: "Match lines starting with word", cmd: "grep -E '^root' /etc/passwd" },
          { desc: "Match lines ending with word", cmd: "grep -E 'bash$' /etc/passwd" },
          { desc: "Match word boundary", cmd: "grep -E '\\broot\\b' /etc/passwd" },
          { desc: "Match one or more digits", cmd: "grep -E '[0-9]+' file.txt" },
          { desc: "Match optional character", cmd: "grep -E 'colou?r' file.txt" },
          { desc: "Match exact word", cmd: "grep -w 'root' /etc/passwd" },
        ]
      }
    ]
  },
  {
    tool: "sed",
    desc: "Stream editor — find and replace, delete lines, transform text in pipelines.",
    icon: "◉",
    sections: [
      {
        title: "Find & Replace",
        entries: [
          { desc: "Replace first occurrence per line", cmd: "sed 's/old/new/' file.txt" },
          { desc: "Replace ALL occurrences per line", cmd: "sed 's/old/new/g' file.txt" },
          { desc: "Replace in-place (edit file directly)", cmd: "sed -i 's/old/new/g' file.txt" },
          { desc: "Case-insensitive replace", cmd: "sed 's/password/REDACTED/gi' file.txt" },
          { desc: "Replace on specific line number", cmd: "sed '3s/old/new/' file.txt" },
          { desc: "Replace between line range", cmd: "sed '2,5s/old/new/g' file.txt" },
        ]
      },
      {
        title: "Delete & Filter Lines",
        entries: [
          { desc: "Delete lines matching pattern", cmd: "sed '/^#/d' /etc/ssh/sshd_config" },
          { desc: "Delete empty lines", cmd: "sed '/^$/d' file.txt" },
          { desc: "Delete specific line number", cmd: "sed '5d' file.txt" },
          { desc: "Delete line range", cmd: "sed '2,4d' file.txt" },
          { desc: "Print only matching lines", cmd: "sed -n '/password/p' file.txt" },
          { desc: "Print line range", cmd: "sed -n '10,20p' file.txt" },
        ]
      },
      {
        title: "Pentest Scenarios",
        entries: [
          { desc: "Remove comments and blank lines from config", cmd: "sed '/^#/d;/^$/d' /etc/ssh/sshd_config" },
          { desc: "Extract usernames from /etc/passwd", cmd: "sed 's/:.*//' /etc/passwd" },
          { desc: "Add line to file (append after match)", cmd: "sed '/PermitRootLogin/a PermitRootLogin yes' /etc/ssh/sshd_config" },
          { desc: "Replace IP in config file", cmd: "sed -i 's/127\\.0\\.0\\.1/0.0.0.0/g' config.conf" },
          { desc: "Strip ANSI color codes from output", cmd: "sed 's/\\x1b\\[[0-9;]*m//g' colored_output.txt" },
          { desc: "Extract value after keyword", cmd: "sed -n 's/.*password: //p' config.txt" },
        ]
      }
    ]
  },
  {
    tool: "awk",
    desc: "Pattern scanning and text processing — extract columns, do math, conditional logic.",
    icon: "◆",
    sections: [
      {
        title: "Field Extraction",
        entries: [
          { desc: "Print first column (space-delimited)", cmd: "awk '{print $1}' file.txt" },
          { desc: "Print specific columns", cmd: "awk '{print $1, $3}' file.txt" },
          { desc: "Print last column", cmd: "awk '{print $NF}' file.txt" },
          { desc: "Custom delimiter (colon)", cmd: "awk -F: '{print $1}' /etc/passwd" },
          { desc: "Print username and shell from passwd", cmd: "awk -F: '{print $1, $7}' /etc/passwd" },
          { desc: "Print lines with more than 3 fields", cmd: "awk 'NF > 3' file.txt" },
        ]
      },
      {
        title: "Filtering & Conditions",
        entries: [
          { desc: "Print lines matching pattern", cmd: "awk '/root/' /etc/passwd" },
          { desc: "Print lines NOT matching pattern", cmd: "awk '!/nologin/' /etc/passwd" },
          { desc: "Print if field equals value", cmd: "awk -F: '$3 == 0' /etc/passwd" },
          { desc: "Print if field greater than value", cmd: "awk -F: '$3 > 1000' /etc/passwd" },
          { desc: "Print line numbers with content", cmd: "awk '{print NR\": \"$0}' file.txt" },
          { desc: "Print between two patterns", cmd: "awk '/START/,/END/' file.txt" },
        ]
      },
      {
        title: "Pentest Scenarios",
        entries: [
          { desc: "Extract open ports from nmap output", cmd: "awk '/open/{print $1}' nmap_output.txt | cut -d/ -f1" },
          { desc: "Get users with UID 0 (root-level)", cmd: "awk -F: '$3 == 0 {print $1}' /etc/passwd" },
          { desc: "Sum file sizes in directory listing", cmd: "ls -la | awk '{sum += $5} END {print sum}'" },
          { desc: "Extract IPs from log file", cmd: "awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head -20" },
          { desc: "Find duplicate lines", cmd: "awk 'seen[$0]++' file.txt" },
          { desc: "Print unique lines only", cmd: "awk '!seen[$0]++' file.txt" },
          { desc: "Extract credentials from colon-separated file", cmd: "awk -F: '{print \"User: \"$1\" Pass: \"$2}' credentials.txt" },
          { desc: "Count occurrences of each value", cmd: "awk '{count[$1]++} END {for (k in count) print count[k], k}' file.txt | sort -rn" },
        ]
      }
    ]
  },
  {
    tool: "cut",
    desc: "Extract specific columns or character ranges from text.",
    icon: "◎",
    sections: [
      {
        title: "Common Usage",
        entries: [
          { desc: "Cut by delimiter, get field 1", cmd: "cut -d: -f1 /etc/passwd" },
          { desc: "Cut multiple fields", cmd: "cut -d: -f1,3,7 /etc/passwd" },
          { desc: "Cut by character position", cmd: "cut -c1-10 file.txt" },
          { desc: "Cut from position to end", cmd: "cut -c5- file.txt" },
          { desc: "Extract username from email", cmd: "echo 'user@domain.com' | cut -d@ -f1" },
          { desc: "Get open ports from nmap", cmd: "grep '/open/' nmap.txt | cut -d/ -f1" },
        ]
      }
    ]
  },
  {
    tool: "sort & uniq",
    desc: "Sort lines and remove/count duplicates — essential for log analysis and wordlist building.",
    icon: "▦",
    sections: [
      {
        title: "sort",
        entries: [
          { desc: "Sort alphabetically", cmd: "sort file.txt" },
          { desc: "Sort numerically", cmd: "sort -n numbers.txt" },
          { desc: "Sort in reverse", cmd: "sort -r file.txt" },
          { desc: "Sort by specific column", cmd: "sort -t: -k3 -n /etc/passwd" },
          { desc: "Sort and remove duplicates", cmd: "sort -u file.txt" },
        ]
      },
      {
        title: "uniq",
        entries: [
          { desc: "Remove duplicate lines (must be sorted first)", cmd: "sort file.txt | uniq" },
          { desc: "Count occurrences of each line", cmd: "sort file.txt | uniq -c" },
          { desc: "Show only duplicate lines", cmd: "sort file.txt | uniq -d" },
          { desc: "Show only unique lines", cmd: "sort file.txt | uniq -u" },
          { desc: "Top 10 most common IPs in log", cmd: "awk '{print $1}' access.log | sort | uniq -c | sort -rn | head -10" },
        ]
      }
    ]
  },
  {
    tool: "tr",
    desc: "Translate or delete characters — useful for cleaning and transforming text.",
    icon: "▤",
    sections: [
      {
        title: "Common Usage",
        entries: [
          { desc: "Convert lowercase to uppercase", cmd: "echo 'hello' | tr 'a-z' 'A-Z'" },
          { desc: "Delete specific characters", cmd: "echo 'h3ll0 w0rld' | tr -d '0-9'" },
          { desc: "Replace colons with newlines", cmd: "echo $PATH | tr ':' '\\n'" },
          { desc: "Squeeze repeated spaces", cmd: "echo 'too   many   spaces' | tr -s ' '" },
          { desc: "Remove newlines (join lines)", cmd: "cat file.txt | tr -d '\\n'" },
          { desc: "Replace spaces with underscores", cmd: "echo 'hello world' | tr ' ' '_'" },
        ]
      }
    ]
  },
  {
    tool: "xargs",
    desc: "Build and execute commands from standard input — chain commands together.",
    icon: "▲",
    sections: [
      {
        title: "Common Usage",
        entries: [
          { desc: "Delete all .txt files found", cmd: "find /tmp -name '*.txt' | xargs rm -f" },
          { desc: "Run command on each line", cmd: "cat hosts.txt | xargs -I{} nmap -p 80 {}" },
          { desc: "Parallel execution (4 jobs)", cmd: "cat hosts.txt | xargs -P 4 -I{} curl -s http://{}" },
          { desc: "Grep in multiple files", cmd: "find /var/www -name '*.php' | xargs grep -l 'eval'" },
          { desc: "Ping multiple hosts", cmd: "cat hosts.txt | xargs -I{} ping -c 1 {}" },
        ]
      }
    ]
  },
  {
    tool: "Regular Expressions",
    desc: "Regex patterns used across grep, sed, awk, Python, Burp Suite, and more.",
    icon: "⬡",
    sections: [
      {
        title: "Character Classes",
        entries: [
          { desc: "Any digit", cmd: "[0-9]  or  \\d" },
          { desc: "Any word character (letter, digit, _)", cmd: "[a-zA-Z0-9_]  or  \\w" },
          { desc: "Any whitespace", cmd: "[ \\t\\n]  or  \\s" },
          { desc: "Any character except newline", cmd: "." },
          { desc: "Negated class (not a digit)", cmd: "[^0-9]  or  \\D" },
        ]
      },
      {
        title: "Quantifiers",
        entries: [
          { desc: "Zero or more", cmd: "a*" },
          { desc: "One or more", cmd: "a+" },
          { desc: "Zero or one (optional)", cmd: "a?" },
          { desc: "Exactly N times", cmd: "a{3}" },
          { desc: "Between N and M times", cmd: "a{2,5}" },
          { desc: "N or more times", cmd: "a{2,}" },
        ]
      },
      {
        title: "Anchors & Groups",
        entries: [
          { desc: "Start of line", cmd: "^pattern" },
          { desc: "End of line", cmd: "pattern$" },
          { desc: "Word boundary", cmd: "\\bword\\b" },
          { desc: "Capture group", cmd: "(pattern)" },
          { desc: "Non-capturing group", cmd: "(?:pattern)" },
          { desc: "OR operator", cmd: "cat|dog" },
          { desc: "Lookahead (followed by)", cmd: "foo(?=bar)" },
          { desc: "Negative lookahead", cmd: "foo(?!bar)" },
        ]
      },
      {
        title: "Pentest Patterns",
        entries: [
          { desc: "Match IPv4 address", cmd: "([0-9]{1,3}\\.){3}[0-9]{1,3}" },
          { desc: "Match email address", cmd: "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" },
          { desc: "Match URL", cmd: "https?://[^\\s\"']+" },
          { desc: "Match MD5 hash", cmd: "[a-fA-F0-9]{32}" },
          { desc: "Match NTLM hash", cmd: "[a-fA-F0-9]{32}" },
          { desc: "Match SHA256 hash", cmd: "[a-fA-F0-9]{64}" },
          { desc: "Match base64 string", cmd: "[A-Za-z0-9+/]{20,}={0,2}" },
          { desc: "Match private key header", cmd: "-----BEGIN [A-Z ]+PRIVATE KEY-----" },
          { desc: "Match port number", cmd: ":[0-9]{1,5}\\b" },
          { desc: "Match Windows path", cmd: "[A-Za-z]:\\\\[^\\s]+" },
          { desc: "Match Linux path", cmd: "(/[a-zA-Z0-9._-]+)+" },
          { desc: "Match password= assignment", cmd: "password\\s*[=:]\\s*['\"]?[^'\"\\s]+" },
        ]
      }
    ]
  },
  {
    tool: "Python one-liners",
    desc: "Python for quick text processing, decoding, and data manipulation in pentests.",
    icon: "☠",
    sections: [
      {
        title: "Text Processing",
        entries: [
          { desc: "Decode base64", cmd: "python3 -c \"import base64,sys; print(base64.b64decode(sys.stdin.read().strip()).decode())\"" },
          { desc: "Encode to base64", cmd: "echo 'text' | python3 -c \"import base64,sys; print(base64.b64encode(sys.stdin.buffer.read()).decode())\"" },
          { desc: "URL decode", cmd: "python3 -c \"import urllib.parse,sys; print(urllib.parse.unquote(sys.stdin.read()))\"" },
          { desc: "URL encode", cmd: "python3 -c \"import urllib.parse; print(urllib.parse.quote('hello world'))\"" },
          { desc: "Hex decode", cmd: "python3 -c \"print(bytes.fromhex('68656c6c6f').decode())\"" },
          { desc: "Hex encode", cmd: "python3 -c \"print('hello'.encode().hex())\"" },
          { desc: "ROT13 decode", cmd: "python3 -c \"import codecs; print(codecs.decode('uryyb', 'rot_13'))\"" },
          { desc: "MD5 hash a string", cmd: "python3 -c \"import hashlib; print(hashlib.md5(b'password').hexdigest())\"" },
        ]
      },
      {
        title: "Regex in Python",
        entries: [
          { desc: "Find all IPs in text", cmd: "python3 -c \"import re,sys; print('\\n'.join(re.findall(r'(?:[0-9]{1,3}\\.){3}[0-9]{1,3}', sys.stdin.read())))\"" },
          { desc: "Find all emails in text", cmd: "python3 -c \"import re,sys; print('\\n'.join(re.findall(r'[\\w.+-]+@[\\w-]+\\.[\\w.]+', sys.stdin.read())))\"" },
          { desc: "Extract all URLs", cmd: "python3 -c \"import re,sys; print('\\n'.join(re.findall(r'https?://[^\\s\\\"]+', sys.stdin.read())))\"" },
          { desc: "Find all hashes (MD5/NTLM)", cmd: "python3 -c \"import re,sys; print('\\n'.join(re.findall(r'[a-fA-F0-9]{32}', sys.stdin.read())))\"" },
        ]
      }
    ]
  },
]
