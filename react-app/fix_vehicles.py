import re

with open('src/pages/Vehicles.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded hover colors
content = content.replace("'#eff6ff'", "'var(--primary-light)'")
content = content.replace("'#fef2f2'", "'var(--error-light)'")
content = content.replace("'#ef4444'", "'var(--error)'")

# Card 1 (Fleet)
content = re.sub(r"'linear-gradient\(135deg, #eff6ff 0%, #dbeafe 100%\)'", "'var(--primary-light)'", content)
content = content.replace("'#bfdbfe'", "'var(--border)'")
content = content.replace("'#1e40af'", "'var(--primary)'")
content = content.replace("'#1e3a8a'", "'var(--primary)'")
content = content.replace("'#2563eb'", "'var(--primary)'")

# Card 2 (Health)
content = re.sub(r"'linear-gradient\(135deg, #ecfdf5 0%, #d1fae5 100%\)'", "'var(--success-light)'", content)
content = content.replace("'#a7f3d0'", "'var(--border)'")
content = content.replace("'#065f46'", "'var(--success)'")
content = content.replace("'#064e3b'", "'var(--success)'")
content = content.replace("'#10b981'", "'var(--success)'")

# Card 3 (Fuel)
content = re.sub(r"'linear-gradient\(135deg, #f0fdfa 0%, #ccfbf1 100%\)'", "'var(--bg-main)'", content)
content = content.replace("'#99f6e4'", "'var(--border)'")
content = content.replace("'#0f766e'", "'var(--text-muted)'")
content = content.replace("'#115e59'", "'var(--text-main)'")
content = content.replace("'#0d9488'", "'var(--text-muted)'")

# Card 4 (Maintenance)
content = re.sub(r"'linear-gradient\(135deg, #fef3c7 0%, #fde68a 100%\)'", "'var(--warning-light)'", content)
content = content.replace("'#fcd34d'", "'var(--border)'")
content = content.replace("'#fde68a'", "'var(--border)'")
content = content.replace("'#92400e'", "'var(--warning)'")
content = content.replace("'#78350f'", "'var(--warning)'")
content = content.replace("'#d97706'", "'var(--warning)'")

# Fix general borders in Refuel Modal
content = content.replace("'1px solid #f1f5f9'", "'1px solid var(--border)'")

with open('src/pages/Vehicles.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
