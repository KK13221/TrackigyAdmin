const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.jsx')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'react-app/src'));

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;
  
  content = content.replace(/\(savedUser\.role \|\| ''\)\.toLowerCase\(\) === 'admin'/g, "['admin', 'superadmin'].includes((savedUser.role || '').toLowerCase())");
  content = content.replace(/\(user\?\.role \|\| ''\)\.toLowerCase\(\) === 'admin'/g, "['admin', 'superadmin'].includes((user?.role || '').toLowerCase())");
  content = content.replace(/\(user\.role \|\| ''\)\.toLowerCase\(\) === 'admin'/g, "['admin', 'superadmin'].includes((user.role || '').toLowerCase())");
  content = content.replace(/\(userData\.role \|\| ''\)\.toLowerCase\(\) === 'admin'/g, "['admin', 'superadmin'].includes((userData.role || '').toLowerCase())");
  
  content = content.replace(/role !== 'admin'/g, "!['admin', 'superadmin'].includes(role)");
  content = content.replace(/role === 'admin'/g, "['admin', 'superadmin'].includes(role)");
  
  if (original !== content) {
    fs.writeFileSync(file, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
