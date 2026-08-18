import re

with open('src/pages/CreateAdmin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Success banner message
content = content.replace("'rgba(16, 185, 129, 0.1)'", "'var(--success-light)'")
content = content.replace("'#059669'", "'var(--success)'")

# Role badges
content = content.replace("'rgba(36, 99, 235, 0.1)'", "'var(--primary-light)'")
content = content.replace("'#2563eb'", "'var(--primary)'")

# Delete button
content = content.replace("'rgba(239, 68, 68, 0.1)'", "'var(--error-light)'")
content = content.replace("'#ef4444'", "'var(--error)'")

# Pagination buttons & modal close buttons
content = content.replace("'#f1f5f9'", "'var(--bg-main)'")

with open('src/pages/CreateAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
