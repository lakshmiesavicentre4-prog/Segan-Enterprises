const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/bg-zinc-950/g, 'bg-[#091114]');
  content = content.replace(/bg-zinc-900/g, 'bg-[#0b1418]');
  content = content.replace(/dark:bg-slate-905\/70/g, 'dark:bg-[#0b1418]/70');
  content = content.replace(/dark:bg-slate-905/g, 'dark:bg-[#0b1418]');
  content = content.replace(/dark:bg-slate-850/g, 'dark:bg-[#131f24]');
  content = content.replace(/dark:bg-slate-950\/60/g, 'dark:bg-[#091114]/60');
  content = content.replace(/dark:bg-slate-950\/50/g, 'dark:bg-[#091114]/50');
  
  // also check if "bg-[#091114]" was already applied and avoid doubling
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
console.log('Done fixing theme.');
