// Ouvre chaque page du site dans un vrai navigateur (Chromium), en français puis en anglais,
// sur ordinateur et sur téléphone, et signale les erreurs JavaScript, les fichiers manquants
// et les zones de données restées vides.
// Usage (depuis le dossier du site) :  node outils/tester-navigateur.mjs
import { createRequire } from 'node:module';
const { chromium } = createRequire(import.meta.url)('playwright');
import { createServer } from 'node:http';
import { readFile, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const RACINE = new URL('..', import.meta.url).pathname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.xml': 'application/xml', '.txt': 'text/plain' };

const serveur = createServer(async (req, res) => {
  const chemin = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^\/+/, '') || 'index.html';
  try { res.writeHead(200, { 'Content-Type': TYPES[extname(chemin)] || 'application/octet-stream' }); res.end(await readFile(join(RACINE, chemin))); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const base = `http://127.0.0.1:${serveur.address().port}/`;

const pages = (await readdir(RACINE)).filter(f => f.endsWith('.html')).sort();
pages.push('article.html?id=' + JSON.parse(await readFile(join(RACINE, 'base-de-donnees/publications.json'), 'utf8'))[0].id);
const erreurs = [];
const navigateur = await chromium.launch();

for (const [appareil, viewport] of [['ordinateur', { width: 1280, height: 800 }], ['téléphone', { width: 390, height: 844 }]]) {
  for (const langue of ['fr', 'en']) {
    const contexte = await navigateur.newContext({ viewport });
    await contexte.addInitScript(l => { try { localStorage.setItem('sb-lang', l); } catch {} }, langue);
    // Pas d'accès à Internet pendant le test : polices et vidéos externes bloquées.
    await contexte.route(u => !u.href.startsWith(base), r => r.abort());
    for (const page of pages) {
      const p = await contexte.newPage();
      const ici = `${page} (${langue}, ${appareil})`;
      p.on('pageerror', e => erreurs.push(`${ici} : erreur JavaScript « ${e.message} »`));
      p.on('response', r => { if (r.url().startsWith(base) && r.status() >= 400) erreurs.push(`${ici} : fichier manquant ${r.url().slice(base.length)}`); });
      await p.goto(base + page, { waitUntil: 'load' });
      await p.waitForTimeout(150);
      const vides = await p.$$eval('[data-render]', els => els.filter(e => !e.innerHTML.trim()).map(e => e.dataset.render));
      vides.forEach(v => erreurs.push(`${ici} : zone « ${v} » vide`));
      const debord = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (debord > 1) erreurs.push(`${ici} : la page déborde de ${debord} px en largeur`);
      if (langue === 'en' && (await p.getAttribute('html', 'lang')) !== 'en') erreurs.push(`${ici} : la page ne passe pas en anglais`);
      await p.close();
    }
    await contexte.close();
  }
}
await navigateur.close(); serveur.close();

console.log(`${pages.length} pages × 2 langues × 2 appareils contrôlées.`);
if (erreurs.length) { console.log(`\n${erreurs.length} problème(s) :`); erreurs.forEach(e => console.log('  ✗', e)); process.exit(1); }
console.log('\n✓ Navigateur : aucune erreur.');
