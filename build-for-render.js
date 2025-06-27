import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

console.log('🚀 Building for Render deployment...');

// Build main app
console.log('📦 Building main app...');
execSync('npm run build', { stdio: 'inherit' });

// Build admin app
console.log('📦 Building admin app...');
execSync('cd admin && npm run build', { stdio: 'inherit' });

// Copy admin build to main dist folder
console.log('📁 Copying admin build to main dist...');
const adminDistPath = path.join('admin', 'dist');
const mainDistPath = 'dist';
const adminInMainPath = path.join(mainDistPath, 'admin');

// Create admin directory in main dist
if (!fs.existsSync(adminInMainPath)) {
  fs.mkdirSync(adminInMainPath, { recursive: true });
}

// Copy all files from admin/dist to dist/admin
function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

copyDir(adminDistPath, adminInMainPath);

console.log('✅ Build complete!');
console.log('📁 Main app: ./dist/');
console.log('📁 Admin app: ./dist/admin/');
console.log('🌐 Ready for Render deployment!'); 