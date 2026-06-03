const fs = require('fs');
const path = require('path');

function applyTN(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Revert teal back to TN primary blue
  content = content.replace(/teal-/g, 'blue-');
  
  // Clean up dark mode premium background palettes
  content = content.replace(/bg-\[\#091114\]/g, 'bg-[#020817]');
  content = content.replace(/bg-\[\#0b1418\]/g, 'bg-[#0A1128]');
  content = content.replace(/bg-zinc-50/g, 'bg-slate-50');

  // Update specific gradient secondary accents to Amber
  content = content.replace(/from-emerald-500/g, 'from-amber-400');
  content = content.replace(/to-emerald-500/g, 'to-amber-500');

  fs.writeFileSync(filePath, content);
}

function walkSync(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walkSync(file));
        } else { 
            if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkSync('src');
files.push('index.html');
files.forEach(applyTN);
console.log('TN Premium styling applied to JSX files.');
