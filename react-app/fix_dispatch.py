import re

with open('src/pages/Dispatch.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Status Colors
content = content.replace("bg: '#dcfce7', text: '#16a34a', dot: '#22c55e'", "bg: 'var(--success-light)', text: 'var(--success)', dot: 'var(--success)'")
content = content.replace("bg: '#fef9c3', text: '#ca8a04', dot: '#eab308'", "bg: 'var(--warning-light)', text: 'var(--warning)', dot: 'var(--warning)'")
content = content.replace("bg: '#e0f2fe', text: '#0284c7', dot: '#38bdf8'", "bg: 'var(--primary-light)', text: 'var(--primary)', dot: 'var(--primary)'")

# VehicleCard
content = content.replace("selected ? '2px solid #2463eb' : '2px solid transparent'", "selected ? '2px solid var(--primary)' : '2px solid transparent'")
content = content.replace("selected ? '#eff6ff' : 'white'", "selected ? 'var(--primary-light)' : 'var(--bg-main)'")
content = content.replace("selected ? '0 0 0 3px rgba(36,99,235,0.12)' : '0 1px 4px rgba(0,0,0,0.07)'", "selected ? '0 0 0 3px var(--primary-light)' : '0 1px 4px rgba(0,0,0,0.07)'")
content = content.replace("selected ? '#2463eb' : '#f1f5f9'", "selected ? 'var(--primary)' : 'var(--bg-sidebar)'")

# Priority Colors
content = content.replace("bg: '#fef2f2', text: '#dc2626', border: '#fca5a5'", "bg: 'var(--error-light)', text: 'var(--error)', border: 'var(--error)'")
content = content.replace("bg: '#eff6ff', text: '#2463eb', border: '#93c5fd'", "bg: 'var(--primary-light)', text: 'var(--primary)', border: 'var(--primary)'")

# Selection Preview Panels
content = content.replace("background: '#eff6ff', borderRadius: 10, padding: '10px 14px',\\n                marginBottom: 20, border: '1.5px solid #bfdbfe'", "background: 'var(--primary-light)', borderRadius: 10, padding: '10px 14px',\\n                marginBottom: 20, border: '1.5px solid var(--primary)'")
content = content.replace("background: '#fef9c3', borderRadius: 10, padding: '10px 14px',\\n                marginBottom: 20, border: '1.5px solid #fde047', fontSize: 12, color: '#92400e'", "background: 'var(--warning-light)', borderRadius: 10, padding: '10px 14px',\\n                marginBottom: 20, border: '1.5px solid var(--warning)', fontSize: 12, color: 'var(--warning)'")

# Form Inputs
content = content.replace("border: '1.5px solid #e2e8f0'", "border: '1.5px solid var(--border)'")

# Hardcoded text colors
content = content.replace("color: '#1e3a8a'", "color: 'var(--text-main)'")
content = content.replace("color: '#3b82f6'", "color: 'var(--text-muted)'")

# Icons/Colors
content = content.replace("color: '#2463eb'", "color: 'var(--primary)'")
content = content.replace("color: '#10b981'", "color: 'var(--success)'")
content = content.replace("color: '#f59e0b'", "color: 'var(--warning)'")
content = content.replace("color: '#166534'", "color: 'var(--success)'")
content = content.replace("color: '#dc2626'", "color: 'var(--error)'")

# Message Boxes
content = content.replace("background: '#dcfce7'", "background: 'var(--success-light)'")
content = content.replace("border: '1px solid #86efac'", "border: '1px solid var(--success)'")
content = content.replace("background: '#fef2f2'", "background: 'var(--error-light)'")
content = content.replace("border: '1px solid #fca5a5'", "border: '1px solid var(--error)'")

# Dispatch Logs Stats
content = content.replace("background: '#dcfce7'", "background: 'var(--success-light)'") # Should already be replaced
content = content.replace("color: '#16a34a'", "color: 'var(--success)'")

# Gradient buttons / Icons
# Let's leave linear-gradient(135deg, #2463eb, #3b82f6) as it is usually okay, but we can replace '#2463eb' with 'var(--primary)' if not in gradient

with open('src/pages/Dispatch.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
