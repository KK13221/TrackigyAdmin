import re

with open('src/pages/VehicleControl.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix CSS injected styles for row-hover
content = content.replace("background-color: #f8fafc !important;", "background-color: var(--bg-main) !important;")

# Fix Search Bar Input missing background
content = content.replace("outline: 'none'", "outline: 'none', background: 'var(--bg-main)', color: 'var(--text-main)'")

# Fix disabled input background
content = content.replace("background: '#f1f5f9'", "background: 'var(--bg-main)'")

# Fix IMEI text color
content = content.replace("color: '#334155'", "color: 'var(--text-main)'")

# Fix Lock / Unlock button and badge colors
content = content.replace("color: isLocked ? '#ef4444' : '#10b981'", "color: isLocked ? 'var(--error)' : 'var(--success)'")
content = content.replace("background: isLocked ? '#ef444415' : '#10b98115'", "background: isLocked ? 'var(--error-light)' : 'var(--success-light)'")
content = content.replace("background: isLocked ? '#ef4444' : '#10b981'", "background: isLocked ? 'var(--error)' : 'var(--success)'")

# Fix Reset Button
content = content.replace("color: '#ef4444', border: '1px solid #ef444430'", "color: 'var(--error)', border: '1px solid var(--error)'")

# Fix Stats Cards - they use hardcoded gradients and borders
# Card 1
content = content.replace("background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe'", "background: 'var(--primary-light)', border: '1px solid var(--primary)'")
content = content.replace("color: '#1e3a8a'", "color: 'var(--primary)'")
# Card 2
content = content.replace("background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #a7f3d0'", "background: 'var(--success-light)', border: '1px solid var(--success)'")
content = content.replace("color: '#064e3b'", "color: 'var(--success)'")
# Card 3
content = content.replace("background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)', border: '1px solid #fca5a5'", "background: 'var(--error-light)', border: '1px solid var(--error)'")
content = content.replace("color: '#7f1d1d'", "color: 'var(--error)'")
# Card 4
content = content.replace("background: 'linear-gradient(135deg, #fdf8f2 0%, #fef3c7 100%)', border: '1px solid #fde68a'", "background: 'var(--warning-light)', border: '1px solid var(--warning)'")
content = content.replace("color: '#78350f'", "color: 'var(--warning)'")

# Replace icons background hex with global vars in stats cards
content = content.replace("background: '#10b981'", "background: 'var(--success)'")
content = content.replace("background: '#ef4444'", "background: 'var(--error)'")
content = content.replace("background: '#f59e0b'", "background: 'var(--warning)'")

# View / Edit buttons
content = content.replace("border: '1px solid var(--primary-light)'", "border: '1px solid var(--primary)'")

with open('src/pages/VehicleControl.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
