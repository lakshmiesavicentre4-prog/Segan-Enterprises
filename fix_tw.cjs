const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/slate-205/g, 'slate-200');
  content = content.replace(/slate-207/g, 'slate-200');
  content = content.replace(/slate-210/g, 'slate-200');
  content = content.replace(/slate-250/g, 'slate-200');
  content = content.replace(/slate-850/g, 'slate-800');
  content = content.replace(/slate-750/g, 'slate-700');
  content = content.replace(/slate-650/g, 'slate-600');
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
            if (file.endsWith('.tsx') || file.endsWith('.ts')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = walkSync('src');
files.forEach(replaceColors);
console.log('Fixed invalid Tailwind color variants.');
