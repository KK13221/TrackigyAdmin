import re

with open('src/pages/TripHistory.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Leaflet Popup Theme to adapt to light/dark
content = content.replace("background: #0f172a !important;", "background: var(--bg-sidebar) !important;")
content = content.replace("color: #f8fafc !important;", "color: var(--text-main) !important;")
content = content.replace("border: 1px solid #334155 !important;", "border: 1px solid var(--border) !important;")
content = content.replace("color: #94a3b8 !important;", "color: var(--text-muted) !important;")
content = content.replace("color: #f8fafc !important;", "color: var(--text-main) !important;")

# Inside Popups, fix the text colors that were incorrectly mapped to bg variables
content = content.replace("color: 'var(--bg-sidebar)'", "color: 'var(--text-main)'")
content = content.replace("color: 'var(--bg-main)'", "color: 'var(--text-main)'")
content = content.replace("'1px solid #334155'", "'1px solid var(--border)'")
content = content.replace("color: '#cbd5e1'", "color: 'var(--text-main)'")

# Start/End/Point titles
content = content.replace("color: '#34d399'", "color: 'var(--success)'")
content = content.replace("color: '#38bdf8'", "color: 'var(--primary)'")
content = content.replace("color: '#f87171'", "color: 'var(--error)'")
content = content.replace("color: '#10b981'", "color: 'var(--success)'")
content = content.replace("color: '#ef4444'", "color: 'var(--error)'")

# Fix Start/End Icons which use hardcoded colors that look fine, but we can update text if needed
# The markers use #10b981 and #ef4444 which are universally green and red. It's fine to leave those in the HTML string.

with open('src/pages/TripHistory.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
