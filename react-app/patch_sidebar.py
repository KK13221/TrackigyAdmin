import sys

with open('src/components/Sidebar.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

old_item = "{ icon: 'history', label: 'Play Back', view: 'play-back' },"
new_item = "{ icon: 'history', label: 'Play Back', view: 'play-back' },\n  { icon: 'share_location', label: 'Live Tracking', view: 'live-tracking' },"
if old_item in content and 'Live Tracking' not in content:
    content = content.replace(old_item, new_item)

with open('src/components/Sidebar.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched Sidebar.jsx')
