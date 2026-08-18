import os

def replace_in_file(path):
    with open(path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # CSS Replacements
    if path.endswith('.css'):
        content = content.replace('background: white;', 'background: var(--bg-sidebar);')
        content = content.replace('background-color: white;', 'background-color: var(--bg-sidebar);')
        content = content.replace('background: #ffffff;', 'background: var(--bg-sidebar);')
        content = content.replace('background-color: #ffffff;', 'background-color: var(--bg-sidebar);')
        content = content.replace('background: #ffffff !important;', 'background: var(--bg-sidebar) !important;')
        content = content.replace('background: #f8fafc;', 'background: var(--bg-main);')
        content = content.replace('background-color: #f8fafc;', 'background-color: var(--bg-main);')
        content = content.replace('border-bottom: 1px solid #e2e8f0;', 'border-bottom: 1px solid var(--border);')
        content = content.replace('border: 1px solid #e2e8f0;', 'border: 1px solid var(--border);')
        content = content.replace('border-color: #e2e8f0;', 'border-color: var(--border);')
        
    # JSX Replacements (Inline styles)
    elif path.endswith('.jsx'):
        # Inline hex replacements
        content = content.replace("'#ffffff'", "'var(--bg-sidebar)'")
        content = content.replace("'#f8fafc'", "'var(--bg-main)'")
        content = content.replace("'#fafbfc'", "'var(--bg-main)'")
        content = content.replace("'#0f172a'", "'var(--text-main)'")
        content = content.replace("'#1e293b'", "'var(--text-main)'")
        content = content.replace("'#475569'", "'var(--text-muted)'")
        content = content.replace("'#64748b'", "'var(--text-muted)'")
        content = content.replace("'#94a3b8'", "'var(--text-muted)'")
        content = content.replace("'#e2e8f0'", "'var(--border)'")

        # Specific component replacements (like cards)
        content = content.replace("background: 'white'", "background: 'var(--bg-sidebar)'")
        content = content.replace("backgroundColor: 'white'", "backgroundColor: 'var(--bg-sidebar)'")
        # Be careful not to replace text color white
        # We leave 'white' text alone

    if content != original_content:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {path}")

for root, _, files in os.walk('d:/Divya Projets/Create _api/TrackigyAdminPanel/react-app/src'):
    for file in files:
        if file.endswith('.css') or file.endswith('.jsx'):
            replace_in_file(os.path.join(root, file))
print('Done!')
