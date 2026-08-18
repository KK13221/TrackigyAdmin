import re

with open('src/pages/DataPlans.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded success/warning/error colors
content = content.replace("'#10b981'", "'var(--success)'")
content = content.replace("'#10b98110'", "'var(--success-light)'")
content = content.replace("'#10b98115'", "'var(--success-light)'")

content = content.replace("'#f59e0b'", "'var(--warning)'")
content = content.replace("'#f59e0b15'", "'var(--warning-light)'")
content = re.sub(r"linear-gradient\(135deg, #f59e0b, #d97706\)", "var(--warning)", content)

content = content.replace("'#ef4444'", "'var(--error)'")
content = content.replace("'#ef444410'", "'var(--error-light)'")
content = content.replace("'#ef444415'", "'var(--error-light)'")

# Fix customer read-only premium invoice activation card
content = content.replace("'#ecfdf5'", "'var(--success-light)'")
content = content.replace("'#a7f3d0'", "'var(--border)'")
content = content.replace("'#047857'", "'var(--success)'")
content = content.replace("'#065f46'", "'var(--success)'")

# Table IMEI column color
content = content.replace("'#334155'", "'var(--text-main)'")

with open('src/pages/DataPlans.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
