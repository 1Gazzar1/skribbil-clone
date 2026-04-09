const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src');

const replacements = {
  'bg-white': 'bg-zinc-900',
  'bg-slate-50': 'bg-zinc-800',
  'bg-slate-100': 'bg-zinc-800',
  'bg-slate-200': 'bg-zinc-700',
  'border-slate-100': 'border-zinc-800',
  'border-slate-200': 'border-zinc-700',
  'text-slate-800': 'text-zinc-100',
  'text-slate-700': 'text-zinc-200',
  'text-slate-600': 'text-zinc-300',
  'text-slate-500': 'text-zinc-400',
  'text-slate-400': 'text-zinc-500',
  'bg-blue-50': 'bg-blue-900/30',
  'bg-primary/10': 'bg-primary/20',
  'border-primary/20': 'border-primary/30',
  'bg-white/80': 'bg-zinc-950/80',
  'border-white': 'border-zinc-900',
  'bg-amber-100': 'bg-amber-900/40',
  'text-amber-800': 'text-amber-200',
  'text-amber-950': 'text-amber-950' // leave alone
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
console.log('Replaced colors to dark mode in src/');
