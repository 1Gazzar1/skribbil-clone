const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  'bg-zinc-900': 'bg-white',
  'bg-zinc-800': 'bg-blue-50',
  'border-zinc-700': 'border-blue-200',
  'border-zinc-800': 'border-blue-100',
  'text-zinc-100': 'text-slate-800',
  'text-zinc-200': 'text-slate-700',
  'text-zinc-300': 'text-slate-600',
  'text-zinc-400': 'text-slate-500',
  'text-zinc-500': 'text-slate-400',
  'bg-zinc-950/80': 'bg-white/80',
  'bg-zinc-700': 'bg-blue-100',
  'bg-zinc-200': 'bg-slate-200',
};

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let newContent = content;
      for (const [key, value] of Object.entries(replacements)) {
        newContent = newContent.replace(new RegExp(key, 'g'), value);
      }
      fs.writeFileSync(fullPath, newContent);
    }
  }
}

processDirectory(directoryPath);
console.log('Reverted colors to light mode in src/');
