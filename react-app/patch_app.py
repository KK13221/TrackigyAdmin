import sys

with open('src/App.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Import LiveTracking
if 'import LiveTracking from' not in content:
    content = content.replace("import MapPage from './pages/MapPage';", "import MapPage from './pages/MapPage';\nimport LiveTracking from './pages/LiveTracking';")

# 2. Add to switch statement
if "case 'live-tracking':" not in content:
    content = content.replace("case 'play-back':\n        return <PlayBack user={user} />;", "case 'play-back':\n        return <PlayBack user={user} />;\n      case 'live-tracking':\n        return <LiveTracking user={user} />;")

# 3. Update getPageInfo
old_live = "'live-tracking': { title: 'Play Back', subtitle: 'Real-time asset tracking and movement history.' }"
new_live = "'live-tracking': { title: 'Live Tracking', subtitle: 'Real-time asset tracking and tail generation.' },\n      'play-back': { title: 'Play Back', subtitle: 'Historical route and asset tracking.' }"
if old_live in content:
    content = content.replace(old_live, new_live)
elif "'play-back': { title: 'Play Back'" not in content:
    content = content.replace("'dashboard': { title: 'Dashboard', subtitle: 'Real-time performance metrics and operational capacity.' },", "'dashboard': { title: 'Dashboard', subtitle: 'Real-time performance metrics and operational capacity.' },\n      'live-tracking': { title: 'Live Tracking', subtitle: 'Real-time asset tracking and tail generation.' },\n      'play-back': { title: 'Play Back', subtitle: 'Historical route and asset tracking.' },")

# 4. Make isEdgeToEdge also apply to live-tracking
content = content.replace("const isEdgeToEdge = activeView === 'play-back';", "const isEdgeToEdge = activeView === 'play-back' || activeView === 'live-tracking';")

with open('src/App.jsx', 'w', encoding='utf-8') as f:
    f.write(content)
print('Patched App.jsx')
