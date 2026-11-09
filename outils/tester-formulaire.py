#!/usr/bin/env python3
"""Teste les scripts PHP du formulaire sans toucher à Neon (adresse Neon factice).

Lance un petit serveur PHP local et vérifie les réponses : refus des mauvais envois,
champ piège, secret absent, Neon injoignable, bilan de santé.

Usage (depuis le dossier du site) :  python3 outils/tester-formulaire.py
"""
import json, os, subprocess, sys, time, urllib.request, urllib.error
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
PORT = 8765
BASE = f'http://127.0.0.1:{PORT}/api'

def appel(chemin, donnees=None, methode='POST', entetes=None):
    corps = json.dumps(donnees).encode() if donnees is not None else None
    req = urllib.request.Request(BASE + chemin, data=corps, method=methode, headers=entetes or {})
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return r.status, json.loads(r.read() or b'{}')
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read() or b'{}')

def serveur(env):
    p = subprocess.Popen(['php', '-S', f'127.0.0.1:{PORT}', '-t', str(RACINE)], env=env,
                         stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    for _ in range(50):
        try: urllib.request.urlopen(f'http://127.0.0.1:{PORT}/robots.txt', timeout=1); return p
        except Exception: time.sleep(0.1)
    p.kill(); sys.exit('Serveur PHP impossible à lancer')

contact = {'formulaire': 'contact', 'name': 'Awa Test', 'phone': '771234567', 'message': 'Bonjour, ceci est un test.'}
distrib = {'formulaire': 'distributeur', 'name': 'Awa Test', 'phone': '771234567', 'business': 'Boutique', 'type': 'boutique', 'city': 'Thiès'}

# 1) Sans secret
env = {k: v for k, v in os.environ.items() if k != 'DATABASE_URL'}
erreurs = []
def verifier(nom, resultat, attendu):
    code = resultat[0]
    print(('  ✓ ' if code == attendu else '  ✗ ') + f'{nom} ({code})')
    if code != attendu: erreurs.append(nom)

p = serveur(env)
try:
    verifier('GET refusé', appel('/formulaire.php', methode='GET'), 405)
    verifier('origine étrangère refusée', appel('/formulaire.php', {}, entetes={'Origin': 'https://exemple.com'}), 403)
    verifier('champ piège ignoré', appel('/formulaire.php', {'_hp': 'robot'}), 200)
    verifier('nom trop court refusé', appel('/formulaire.php', {**contact, 'name': 'A'}), 400)
    verifier('message trop court refusé', appel('/formulaire.php', {**contact, 'message': 'court'}), 400)
    verifier('distributeur incomplet refusé', appel('/formulaire.php', {**distrib, 'city': ''}), 400)
    verifier('type inconnu refusé', appel('/formulaire.php', {**contact, 'formulaire': 'autre'}), 400)
    verifier('secret absent : erreur 500', appel('/formulaire.php', contact), 500)
    verifier('santé sans secret : 503', appel('/sante.php', methode='GET'), 503)
finally:
    p.kill()

# 2) Neon injoignable (adresse factice)
p = serveur({**env, 'DATABASE_URL': 'postgresql://u:p@ep-test.invalid/db'})
try:
    verifier('Neon injoignable : contact 500', appel('/formulaire.php', contact), 500)
    verifier('Neon injoignable : distributeur 500', appel('/formulaire.php', distrib), 500)
    verifier('Neon injoignable : santé 503', appel('/sante.php', methode='GET'), 503)
finally:
    p.kill()

if erreurs:
    print(f'\n{len(erreurs)} test(s) en échec.'); sys.exit(1)
print('\n✓ Formulaire : tous les tests passent.')
