
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const yaml = require('js-yaml');

const manifest = yaml.load(fs.readFileSync('ext/manifest.json', 'utf8'));
const name = manifest.name;
const version = manifest.version;
const crxName = `${name}-${version}.crx`;

const dir = 'pkg';
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}
const product = path.join(dir, crxName);

execSync('"brave" --pack-extension=ext');
fs.renameSync('ext.crx', product);
console.log(`Built ${product}`);

let updates = fs.readFileSync('updates.xml', 'utf8');
updates = updates.replace(/\d\.\d\.\d/, version);
fs.writeFileSync('updates.xml', updates);
console.log('Updated "updates.xml"');