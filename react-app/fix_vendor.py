import re

with open('src/pages/CreateVendor.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Success/Warning/Error Colors
content = content.replace("'rgba(16, 185, 129, 0.1)'", "'var(--success-light)'")
content = content.replace("'#059669'", "'var(--success)'")
content = content.replace("'rgba(36, 99, 235, 0.1)'", "'var(--primary-light)'")
content = content.replace("'#2563eb'", "'var(--primary)'")
content = content.replace("'rgba(239, 68, 68, 0.1)'", "'var(--error-light)'")
content = content.replace("'#ef4444'", "'var(--error)'")
content = content.replace("'#dcfce7'", "'var(--success-light)'")
content = content.replace("'#166534'", "'var(--success)'")
content = content.replace("'#fee2e2'", "'var(--error-light)'")
content = content.replace("'#991b1b'", "'var(--error)'")

# Modal Backgrounds
content = content.replace("'#f1f5f9'", "'var(--bg-main)'")

with open('src/pages/CreateVendor.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
