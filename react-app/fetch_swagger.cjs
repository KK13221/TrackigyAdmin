const fs = require('fs');
fetch('http://139.59.1.109:5000/api-docs/swagger-ui-init.js')
  .then(res => res.text())
  .then(text => {
    fs.writeFileSync('swagger-ui-init.js', text);
    console.log('done');
  });
