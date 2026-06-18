const fs = require('fs');
const path = require('path');

function posixJoin(...parts) {
  return parts.join('/').replace(/\\\\/g,'/');
}

const cwd = process.cwd();
const albumsRoot = path.join(cwd, 'assets', 'albums');
const dataPath = path.join(cwd, 'data.json');
const IMG_EXTS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'];

if (!fs.existsSync(albumsRoot)) {
  console.error('albums folder not found at', albumsRoot);
  process.exit(1);
}
if (!fs.existsSync(dataPath)) {
  console.error('data.json not found at', dataPath);
  process.exit(1);
}

const folders = fs.readdirSync(albumsRoot, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
let changed = false;

folders.forEach(folder => {
  const folderPath = path.join(albumsRoot, folder);
  const files = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(f => f.isFile() && IMG_EXTS.includes(path.extname(f.name).toLowerCase()))
    .map(f => f.name)
    .sort((a,b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

  const relPaths = files.map(f => posixJoin('assets', 'albums', folder, f));

  // attempt to find matching node(s) in data.sections
  const sections = data.sections || {};
  let matched = 0;
  Object.keys(sections).forEach(secKey => {
    const sec = sections[secKey];
    if (!sec || !Array.isArray(sec.nodes)) return;
    sec.nodes.forEach(node => {
      const folderLower = folder.toLowerCase();
      const idLower = (node.id || '').toLowerCase();
      const labelLower = (node.label || '').toLowerCase();
      if (idLower.includes(folderLower) || labelLower.includes(folderLower)) {
        // update photos
        node.photos = relPaths;
        matched++;
        changed = true;
        console.log(`Updated node '${node.id}' with ${relPaths.length} photos.`);
      }
    });
  });

  if (!matched) {
    console.warn(`No matching node found for folder '${folder}'. Skipped.`);
  }
});

if (changed) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
  console.log('data.json updated with photos arrays.');
} else {
  console.log('No changes made to data.json.');
}
