import re

with open('src/pages/AssignToAdmin.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace Stats Cards Backgrounds
content = re.sub(r"background: 'linear-gradient\(135deg, #ffffff, #f8fafc\)'", "background: 'var(--bg-main)'", content)

# Replace Stats Cards Numbers
content = content.replace("'#10b981'", "'var(--success)'")
content = content.replace("'#f59e0b'", "'var(--warning)'")

# Replace IMEI backgrounds
content = content.replace("'#f1f5f9'", "'var(--bg-main)'")

# Replace badges
content = content.replace("'#fef3c7'", "'var(--warning-light)'")
content = content.replace("'#d97706'", "'var(--warning)'")
content = re.sub(r"rgba\(217, 119, 6, 0.15\)", "var(--warning)", content)

content = content.replace("'#ecfdf5'", "'var(--success-light)'")
content = re.sub(r"rgba\(16, 185, 129, 0.15\)", "var(--success)", content)

# Pagination color inherit to var(--text-main)
content = content.replace("color: currentPage === page ? 'white' : 'inherit'", "color: currentPage === page ? 'white' : 'var(--text-main)'")

# Fix missing background in input
content = content.replace("fontSize: 13, outline: 'none' }}", "fontSize: 13, outline: 'none', background: 'var(--bg-sidebar)', color: 'var(--text-main)' }}")


with open('src/pages/AssignToAdmin.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
