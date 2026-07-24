const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = [...walk('src'), ...walk('__tests__')];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;
  
  if (content.includes('React.') && !content.includes('import React')) {
    content = 'import React from "react";\n' + content;
    fs.writeFileSync(f, content, 'utf8');
  }
});
console.log('Restored React imports where needed');
