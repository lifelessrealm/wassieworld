import {mkdir,writeFile,readFile} from 'node:fs/promises';
const endpoint='https://fonts.googleapis.com/css2?family=DM+Sans:wght@400..700&family=Space+Grotesk:wght@400..700&display=swap';
const response=await fetch(endpoint,{headers:{'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'}});if(!response.ok)throw Error('Could not resolve existing fonts');
const css=await response.text(),latin=[...css.matchAll(/\/\* latin \*\/\s*(@font-face\s*\{[^}]+\})/g)].map(m=>m[1]);await mkdir('public/fonts',{recursive:true});
let local='/* Bundled Latin variable fonts, SIL OFL licenses in public/fonts/. */\n';
for(const [family,id,folder]of [['DM Sans','dm-sans','dmsans'],['Space Grotesk','space-grotesk','spacegrotesk']]){
 const block=latin.find(b=>b.includes(`'${family}'`));if(!block)throw Error(`Missing Latin face ${family}`);const url=block.match(/url\(([^)]+)\)/)?.[1];if(!url||new URL(url).hostname!=='fonts.gstatic.com')throw Error('Unexpected font host');
 const font=await fetch(url);if(!font.ok)throw Error('Font download failed');await writeFile(`public/fonts/${id}-latin.woff2`,Buffer.from(await font.arrayBuffer()));
 const license=await fetch(`https://raw.githubusercontent.com/google/fonts/main/ofl/${folder}/OFL.txt`);if(!license.ok)throw Error('Font license unavailable');await writeFile(`public/fonts/${id}-OFL.txt`,await license.text());
 local+=`@font-face{font-family:'${family}';font-style:normal;font-weight:400 700;font-display:swap;src:url('/fonts/${id}-latin.woff2') format('woff2')}\n`;
}
await writeFile('src/fonts.css',local);const style=await readFile('src/style.css','utf8');await writeFile('src/style.css',style.replace(/^@import url\([^\n]+\);/m,"@import './fonts.css';"));console.log('Bundled two existing Latin variable fonts and their OFL licenses.');
