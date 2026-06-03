const fs = require('fs');
const path = require('path');

function replaceColors(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace blue with teal
  content = content.replace(/blue-50(?!0)/g, 'teal-50');
  content = content.replace(/blue-100/g, 'teal-100');
  content = content.replace(/blue-200/g, 'teal-200');
  content = content.replace(/blue-300/g, 'teal-300');
  content = content.replace(/blue-400/g, 'teal-400');
  content = content.replace(/blue-500/g, 'teal-500');
  content = content.replace(/blue-600/g, 'teal-600');
  content = content.replace(/blue-700/g, 'teal-700');
  content = content.replace(/blue-800/g, 'teal-800');
  content = content.replace(/blue-900/g, 'teal-900');
  content = content.replace(/blue-950/g, 'teal-950');

  // Replace indigo with emerald
  content = content.replace(/indigo-50(?!0)/g, 'emerald-50');
  content = content.replace(/indigo-100/g, 'emerald-100');
  content = content.replace(/indigo-200/g, 'emerald-200');
  content = content.replace(/indigo-300/g, 'emerald-300');
  content = content.replace(/indigo-400/g, 'emerald-400');
  content = content.replace(/indigo-500/g, 'emerald-500');
  content = content.replace(/indigo-600/g, 'emerald-600');
  content = content.replace(/indigo-700/g, 'emerald-700');
  content = content.replace(/indigo-800/g, 'emerald-800');
  content = content.replace(/indigo-900/g, 'emerald-900');
  content = content.replace(/indigo-950/g, 'emerald-950');

  // Let's also swap some slate for zinc? Or maybe change the dark mode background
  content = content.replace(/bg-slate-950/g, 'bg-zinc-950');
  content = content.replace(/bg-slate-900/g, 'bg-zinc-900');
  content = content.replace(/bg-slate-50(?!0)/g, 'bg-zinc-50');
  
  // also specifically change "bg-[#020817]" to "bg-[#091114]" (which is a super deep teal/pine)
  content = content.replace(/bg-\[\#020817\]/g, 'bg-[#091114]');
  content = content.replace(/bg-\[\#0B1120\]/g, 'bg-[#0b1418]');

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
console.log('Done replacing theme colors.');
