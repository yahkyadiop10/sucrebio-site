#!/usr/bin/env python3
"""Contrôle rapide du site avant mise en ligne.

Vérifie :
  1. que chaque lien interne (href/src) pointe vers un fichier qui existe,
  2. que chaque ancre (#id) visée existe dans la page cible,
  3. que chaque texte traduisible (data-i18n…) a sa traduction anglaise dans assets/js/i18n-en.js,
  4. que les fichiers JSON de base-de-donnees/ sont valides et que assets/js/donnees.js est à jour,
  5. que la règle de marque sur l'érythritol est respectée,
  6. que la galerie et les vidéos pointent vers des fichiers présents.

Usage (depuis le dossier du site) :  python3 outils/verifier-site.py
"""
import json, re, sys
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote

RACINE = Path(__file__).resolve().parent.parent
erreurs, avertissements = [], []

class Page(HTMLParser):
    def __init__(self):
        super().__init__(); self.ids, self.liens, self.cles = set(), [], set()
    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if 'id' in a: self.ids.add(a['id'])
        for k in ('href', 'src'):
            if a.get(k): self.liens.append(a[k])
        for k in ('data-i18n', 'data-i18n-html'):
            if a.get(k): self.cles.add(a[k])
        if a.get('data-i18n-attr'):
            for p in a['data-i18n-attr'].split(';'):
                self.cles.add(p.split(':')[1])

pages = {}
for f in sorted(RACINE.glob('*.html')):
    p = Page(); p.feed(f.read_text(encoding='utf-8')); pages[f.name] = p

# Ancres créées par le JavaScript (FAQ : #q-<id>)
faq = json.loads((RACINE / 'base-de-donnees/faq.json').read_text(encoding='utf-8'))
pages['faq.html'].ids |= {f"q-{q['id']}" for q in faq}

# Liens présents dans les données (FAQ, chatbot)
liens_donnees = []
for jf in (RACINE / 'base-de-donnees').glob('*.json'):
    liens_donnees += [(jf.name, h) for h in re.findall(r'href=\\?"([^"\\]+)', jf.read_text(encoding='utf-8'))]

def verifier_lien(origine, lien):
    if lien.startswith(('http://', 'https://', 'mailto:', 'tel:', 'data:', '//')) or lien == '#':
        return
    u = urlsplit(lien)
    cible = unquote(u.path) if u.path else origine
    if '/' not in cible and cible.endswith('.html'):
        if cible not in pages:
            erreurs.append(f'{origine} : lien vers une page absente « {lien} »'); return
        if u.fragment and u.fragment not in pages[cible].ids:
            erreurs.append(f'{origine} : ancre absente « {lien} »')
    elif not (RACINE / cible).exists():
        erreurs.append(f'{origine} : fichier absent « {lien} »')
    elif u.fragment and cible.endswith('.html') and u.fragment not in pages.get(cible, Page()).ids:
        erreurs.append(f'{origine} : ancre absente « {lien} »')

for nom, p in pages.items():
    for lien in p.liens:
        if lien.startswith('#') and len(lien) > 1:
            if lien[1:] not in p.ids and not lien.startswith('#i-'):
                erreurs.append(f'{nom} : ancre interne absente « {lien} »')
        else:
            verifier_lien(nom, lien)
for nom, lien in liens_donnees:
    verifier_lien(f'base-de-donnees/{nom}', lien)

# Symboles d'icônes
sprite_ids = pages['index.html'].ids
for nom, p in pages.items():
    for lien in p.liens:
        if lien.startswith('#i-') and lien[1:] not in p.ids:
            erreurs.append(f'{nom} : icône absente « {lien} »')

# Traductions anglaises
en_js = (RACINE / 'assets/js/i18n-en.js').read_text(encoding='utf-8')
EN = json.loads(en_js[en_js.index('window.SB_EN =') + 14:].strip().rstrip(';'))
for nom, p in pages.items():
    for k in sorted(p.cles - EN.keys()):
        erreurs.append(f'{nom} : traduction anglaise manquante pour « {k} »')

# Base de données
donnees = {}
for jf in sorted((RACINE / 'base-de-donnees').glob('*.json')):
    try:
        donnees[jf.stem.replace('-', '_')] = json.loads(jf.read_text(encoding='utf-8'))
    except json.JSONDecodeError as e:
        erreurs.append(f'base-de-donnees/{jf.name} : JSON invalide ({e})')
djs = (RACINE / 'assets/js/donnees.js').read_text(encoding='utf-8')
try:
    actuel = json.loads(djs[djs.index('window.SB_DATA =') + 16:].strip().rstrip(';'))
    if actuel != donnees:
        erreurs.append('assets/js/donnees.js n\'est pas à jour : lancez  python3 outils/generer-donnees.py')
except ValueError:
    erreurs.append('assets/js/donnees.js illisible : lancez  python3 outils/generer-donnees.py')

# Règle de marque : l'érythritol est « un édulcorant naturel issu de la fermentation »
interdits = re.compile(r'érythritol[^.<]{0,40}\b(chimique|artificiel|synthétique|polyol|alcool de sucre)', re.I)
for f in list(RACINE.glob('*.html')) + list((RACINE / 'base-de-donnees').glob('*.json')):
    for m in interdits.finditer(f.read_text(encoding='utf-8')):
        erreurs.append(f'{f.name} : formulation de l\'érythritol contraire à la charte « {m.group(0)} »')

# Publications (blog et actualités)
ids = set()
for pub in donnees.get('publications', []):
    pid = pub.get('id', '?')
    if pid in ids: erreurs.append(f'publications.json : identifiant en double « {pid} »')
    ids.add(pid)
    if pub.get('type') not in ('blog', 'actualite'):
        erreurs.append(f'publications.json : « {pid} » a un type invalide (blog ou actualite)')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2}', str(pub.get('date', ''))):
        erreurs.append(f'publications.json : « {pid} » date invalide (format AAAA-MM-JJ)')
    if pub.get('image') and not (RACINE / pub['image']).exists():
        erreurs.append(f'publications.json : « {pid} » image absente « {pub["image"]} »')
    for champ in ('titre', 'resume', 'contenu'):
        if not all((pub.get(champ) or {}).get(l) for l in ('fr', 'en')):
            erreurs.append(f'publications.json : « {pid} » {champ} incomplet (fr et en requis)')
if any(p.get('exemple') for p in donnees.get('publications', [])):
    avertissements.append('publications.json : des articles d\'exemple sont encore publiés')

# Galerie (bandes défilantes) et vidéos
for page_g, liste in donnees.get('galerie', {}).items():
    if f'{page_g}.html' not in pages:
        erreurs.append(f'galerie.json : page inconnue « {page_g} »')
    for i, g in enumerate(liste):
        if not g.get('image') or not (RACINE / g['image']).exists():
            erreurs.append(f'galerie.json : {page_g}, image n°{i + 1} absente « {g.get("image")} »')
        if not all((g.get('alt') or {}).get(l) for l in ('fr', 'en')):
            erreurs.append(f'galerie.json : {page_g}, image n°{i + 1} sans texte alternatif fr et en')
for nom, p in pages.items():
    if 'data-galerie' in (RACINE / nom).read_text(encoding='utf-8'):
        g = re.search(r'data-galerie="([^"]+)"', (RACINE / nom).read_text(encoding='utf-8')).group(1)
        if g not in donnees.get('galerie', {}):
            erreurs.append(f'{nom} : bande de photos « {g} » absente de galerie.json')
vids = set()
for v in donnees.get('videos', []):
    vid = v.get('id', '?')
    if vid in vids: erreurs.append(f'videos.json : identifiant en double « {vid} »')
    vids.add(vid)
    if v.get('type') not in ('youtube', 'fichier'):
        erreurs.append(f'videos.json : « {vid} » a un type invalide (youtube ou fichier)')
    if v.get('categorie') not in ('produit', 'autre-produit', 'evenement'):
        erreurs.append(f'videos.json : « {vid} » catégorie invalide (produit, autre-produit ou evenement)')
    if v.get('type') == 'fichier' and v.get('source') and not (RACINE / v['source']).exists():
        erreurs.append(f'videos.json : « {vid} » fichier vidéo absent « {v["source"]} »')
    if v.get('affiche') and not (RACINE / v['affiche']).exists():
        erreurs.append(f'videos.json : « {vid} » affiche absente « {v["affiche"]} »')
    for pg in v.get('pages') or []:
        if pg not in ('accueil', 'produit'):
            erreurs.append(f'videos.json : « {vid} » page inconnue « {pg} » (accueil ou produit)')
    for champ in ('titre', 'description'):
        if not all((v.get(champ) or {}).get(l) for l in ('fr', 'en')):
            erreurs.append(f'videos.json : « {vid} » {champ} incomplet (fr et en requis)')
if donnees.get('videos') and not any(v.get('source') for v in donnees['videos']):
    avertissements.append('videos.json : aucune vidéo en ligne, l\'espace vidéo affiche « Vidéo à venir »')

# Contenus à compléter (rappel, pas bloquant)
ent = donnees.get('entreprise', {})
for champ in ('rccm', 'ninea', 'hebergeur'):
    if not ent.get(champ): avertissements.append(f'entreprise.json : « {champ} » à compléter')
if any(t.get('exemple') for t in donnees.get('temoignages', [])):
    avertissements.append('temoignages.json : des avis d\'exemple sont encore affichés')
if not donnees.get('points_de_vente', {}).get('revendeurs'):
    avertissements.append('points-de-vente.json : aucun revendeur renseigné')
if not ent.get('moyens_paiement', {}).get('confirme'):
    avertissements.append('entreprise.json : moyens de paiement à confirmer (CGV)')

print(f'{len(pages)} pages contrôlées.')
for a in avertissements: print('  À compléter :', a)
if erreurs:
    print(f'\n{len(erreurs)} erreur(s) :'); [print('  ✗', e) for e in erreurs]; sys.exit(1)
print('\n✓ Aucune erreur : liens, ancres, traductions et données sont cohérents.')
