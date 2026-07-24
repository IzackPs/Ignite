/* eslint-disable */
const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    file = path.join(dir, file);
    if (fs.statSync(file).isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = [...walk('src/components'), ...walk('src/app')];

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let original = content;

  // Fix duplicate imports in shadcn UI
  if (content.includes('import React from "react";\nimport * as React from "react"')) {
    content = content.replace('import React from "react";\n', '');
  }

  // Fix "use client" order
  if (content.startsWith('import React from "react";\n"use client";')) {
    content = content.replace('import React from "react";\n"use client";', '"use client";\nimport React from "react";');
  }

  if (content !== original) {
    fs.writeFileSync(f, content, 'utf8');
  }
});
console.log('Fixed syntax errors');
