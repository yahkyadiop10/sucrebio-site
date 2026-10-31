# À compléter avant la mise en ligne

`python3 outils/verifier-site.py` rappelle automatiquement les points marqués ⚙.

| # | Quoi | Où | État |
|---|---|---|---|
| 1 | Vrais avis clients (avec accord), puis `exemple: false` | `base-de-donnees/temoignages.json` | ⚙ exemples affichés |
| 2 | Numéros RCCM et NINEA | `entreprise.json` (`rccm`, `ninea`) + texte de `mentions-legales.html` | ⚙ à compléter |
| 3 | Nom et adresse de l'hébergeur | `entreprise.json` (`hebergeur`) + `mentions-legales.html` | ⚙ à compléter |
| 4 | Moyens de paiement définitifs | `cgv.html` (+ EN dans `i18n-en.js`, clé `lgl_cgv`), puis `confirme: true` dans `entreprise.json` | ⚙ à confirmer |
| 5 | Liste des revendeurs | `points-de-vente.json` (`revendeurs`) | ⚙ vide |
| 6 | Villes du déploiement (Mbour, Saint-Louis, Touba, Afrique de l'Ouest) | `points-de-vente.json` (`villes`) | à valider |
| 7 | Prix de la boîte (sinon « Sur demande ») | `produits.json` (`prix_xof`) | facultatif |
| 8 | Photo produit propre du stick (badge dent illisible) | `assets/img/stick.webp` | à remplacer |
| 9 | Liens réseaux sociaux | `entreprise.json` (`reseaux_sociaux`) | pas encore affichés |
| 10 | Image de partage (réseaux sociaux) 1200 × 630 | balises `og:image` des pages | utilise `box.webp` |
| 11 | Validation des allégations santé (IG 0, dents) | Bienfaits, FAQ, articles | à faire relire |
| 12 | Articles du blog et actualités : relire, dater, puis `exemple: false` (ou remplacer) | `base-de-donnees/publications.json` | ⚙ 4 exemples publiés |
| 13 | Conditions de distribution (ce qui est promis aux distributeurs) | `devenir-distributeur.html` | à valider |
| 14 | Vidéos (présentation, cuisine, événements) : renseigner `source` | `base-de-donnees/videos.json` (+ fichiers MP4 dans `assets/videos/`) | ⚙ 3 emplacements « Vidéo à venir » |
| 15 | Photos manquantes pour les bandes : au bureau (À propos), thé à la sénégalaise et petit-déjeuner (Bienfaits), visuel propre de la boîte | `assets/img/` + `base-de-donnees/galerie.json` | à fournir |
| 16 | Vraies photos (les mises en situation actuelles sont générées par IA) | `assets/img/scene-*.webp`, `galerie.json` | facultatif |
