import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(filePath));
        } else { 
            if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  content = content.replace(/#2B233A/g, '#1A0B2E'); // metro-eggplant
  content = content.replace(/#1D4ED8/g, '#FF007A'); // metro-cobalt
  content = content.replace(/#701A75/g, '#7A00FF'); // metro-plum
  content = content.replace(/#F5EEF2/g, '#E3D8FF'); // metro-mauve
  
  content = content.replace(/bg-\\[#2B233A\\]/g, 'bg-metro-eggplant');
  content = content.replace(/bg-\\[#1D4ED8\\]/g, 'bg-metro-cobalt');
  content = content.replace(/bg-\\[#701A75\\]/g, 'bg-metro-plum');
  content = content.replace(/bg-\\[#F5EEF2\\]/g, 'bg-metro-mauve');

  // Replace dark tailwind default bg
  content = content.replace(/#020617/g, '#050505'); // dark surface
  content = content.replace(/bg-\\[#020617\\]/g, 'bg-[#050505]');

  fs.writeFileSync(file, content);
}
console.log('Replaced colors with CSS vars');
