#!/usr/bin/env python3
"""Regénère assets/js/donnees.js à partir des fichiers JSON de base-de-donnees/.

Les pages lisent les données via ce fichier .js (et non directement les .json)
pour fonctionner aussi quand on ouvre index.html par double-clic (file://),
où le navigateur bloque fetch() sur les fichiers locaux.

Usage (depuis le dossier du site) :  python3 outils/generer-donnees.py
"""
import json
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent
SOURCE = RACINE / "base-de-donnees"
CIBLE = RACINE / "assets" / "js" / "donnees.js"

donnees = {}
for fichier in sorted(SOURCE.glob("*.json")):
    cle = fichier.stem.replace("-", "_")  # points-de-vente.json -> points_de_vente
    try:
        donnees[cle] = json.loads(fichier.read_text(encoding="utf-8"))
    except json.JSONDecodeError as e:
        raise SystemExit(f"JSON invalide dans {fichier.name} : {e}")

entete = ("/* FICHIER GÉNÉRÉ : ne pas modifier à la main.\n"
          "   Source : base-de-donnees/*.json  ·  Commande : python3 outils/generer-donnees.py */\n")
CIBLE.write_text(entete + "window.SB_DATA = " + json.dumps(donnees, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
print(f"{CIBLE.relative_to(RACINE)} regénéré ({', '.join(donnees)})")
