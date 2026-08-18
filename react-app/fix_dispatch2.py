import re

with open('src/pages/Dispatch.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix Selected vehicle preview panel (which had multiline strings)
content = re.sub(r"background:\s*'#eff6ff'", "background: 'var(--primary-light)'", content)
content = re.sub(r"border:\s*'1\.5px solid #bfdbfe'", "border: '1.5px solid var(--primary)'", content)
content = re.sub(r"background:\s*'#fef9c3'", "background: 'var(--warning-light)'", content)
content = re.sub(r"border:\s*'1\.5px solid #fde047'", "border: '1.5px solid var(--warning)'", content)
content = re.sub(r"color:\s*'#92400e'", "color: 'var(--warning)'", content)

# Input backgrounds are missing in inline styles, which defaults them to white in some cases
content = re.sub(
    r"(border:\s*'1\.5px solid var\(--border\)',\s*fontSize:\s*1[23],\s*color:\s*'var\(--text-(main|muted)\)',)",
    r"\1 background: 'var(--bg-main)',",
    content
)

# Text area background
content = re.sub(
    r"(border:\s*'1\.5px solid var\(--border\)',\s*fontSize:\s*1[23],\s*color:\s*'var\(--text-(main|muted)\)',\s*outline)",
    r"\1", # wait, earlier sub covers this too because it matches the first line. 
    content
)

# Fix remaining explicit hardcoded colors that were missed
content = re.sub(r"'#1e3a8a'", "'var(--text-main)'", content)
content = re.sub(r"'#3b82f6'", "'var(--text-muted)'", content)

with open('src/pages/Dispatch.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
