# CLAUDE.md · Site web Sucré Bio

Consignes pour Claude (et tout développeur) qui travaille sur ce dossier.

## Le projet
Site vitrine statique, bilingue FR/EN, de SucréBio (édulcorant naturel, SN Industrie SARL, Thiès, Sénégal ; fondateur Amadou Tidiane LY). 16 pages HTML reliées, sans framework ni étape de compilation. Cible finale : WordPress + Elementor (WPML, Yoast SEO, WhatsApp Chat) ; ce dossier sert de maquette fonctionnelle et de source de contenu.

## Règles de marque (impératives)
- L'érythritol est **toujours** décrit comme « un édulcorant naturel issu de la fermentation » (EN : « a natural sweetener from fermentation »). Jamais « chimique », « artificiel », « polyol », « alcool de sucre ». `outils/verifier-site.py` le contrôle.
- Produit : boîte de **100 sticks de 1 g** ; érythritol + extrait de fruit du moine, rien d'autre.
- Toujours garder l'avertissement : SucréBio ne remplace pas un traitement médical.
- Palette vert profond / orange ; titres Cormorant Garamond, texte DM Sans. **Les chiffres s'écrivent en DM Sans** (le 0 de Cormorant ressemble à un « o ») : utiliser `<span class="num">0</span>` dans un titre.
- Ne jamais inventer de faux avis, revendeurs, prix, actualités ou numéros légaux : laisser `null` / « à compléter ».

## Architecture
- Chaque page contient en dur : sprite d'icônes SVG, en-tête, menu mobile, pied de page, assistant. **Une modification de l'en-tête ou du pied de page doit être répétée dans les 16 pages** (rechercher-remplacer).
- Menu, ordre voulu par le client : Accueil · À propos · Produit · Bienfaits · Partenaires ▾ (points-de-vente, devenir-distributeur) · Publications ▾ (blog, actualites) · Contact ▾ (contact, faq). Le `.dd` de la page en cours porte `is-current`.
- Page active : `aria-current="page"` sur le lien de navigation, écrit dans le HTML.
- `assets/js/main.js` : langue, thème, menu, progression, assistant, formulaire → WhatsApp, rendus de données.
- Bilingue : le FR est lu dans le HTML (`data-i18n`, `data-i18n-html`, `data-i18n-attr="attr:cle"`), l'EN dans `assets/js/i18n-en.js`. Toute nouvelle clé doit exister dans les deux. Textes produits uniquement par le JS : objet `UI` dans `main.js`.
- Données : `base-de-donnees/*.json` = source de vérité. Les pages lisent `assets/js/donnees.js` (`window.SB_DATA`), **généré** par `python3 outils/generer-donnees.py` : ne pas l'éditer à la main. Ce détour existe parce que `fetch()` est bloqué quand on ouvre les pages en `file://`.
- Zones remplies par le JS : `data-render="temoignages|faq|villes|revendeurs|pdv|produit|entreprise|publications|article|bandeau|videos"` (`publications` accepte `data-type="blog|actualite"` et `data-limit`) ; textes liés aux coordonnées : `data-bind="telephone_affiche|email"`.
- Liens WhatsApp : tout élément `data-wa` reçoit `https://wa.me/<entreprise.whatsapp>` au chargement.
- Formulaires (contact, demande de distribution) : pas de serveur, ils ouvrent WhatsApp avec le message prérempli (libellés des champs + valeurs). `contact.html?sujet=distributeur` présélectionne le sujet (valeurs : commande, distributeur, produit, partenariat).
- Bandes de photos défilantes (`bandeau`, données `galerie.json`, une liste par page) **uniquement** sur À propos, Bienfaits, Blog, Actualités (choix du client) ; espace vidéo (`videos`, données `videos.json`, attribut `data-page="accueil|produit"`) ; `source: null` = « Vidéo à venir ». Toute animation doit s'arrêter avec `prefers-reduced-motion` et avoir une pause.
- Photos générées par IA : ne pas les afficher en grand (textes d'emballage déformés).
- Un seul e-mail public : `email` = info@sucrebio.com, partout (contact, partenariats, distribution, formulaires). Adresse affichée : « Thiès, Sénégal ».
- Vocabulaire : « conditionné » au Sénégal / à Thiès, jamais « fabriqué » ou « produit ». Ton marketing bien-être, SucréBio au centre ; pas de vocabulaire médical dans les titres.
- Points de vente : on présente SucréBio comme disponible partout ; la recherche (ville, quartier ou « Autour de moi ») propose la direction commerciale quand aucun revendeur n'est trouvé.
- Le client valide chaque proposition avant sa mise en œuvre : proposer, attendre son accord.
- Blog et actualités : une seule page `article.html?id=<id>` affiche chaque publication de `publications.json`. Les articles d'exemple portent `exemple: true`.

## Après chaque modification
```bash
python3 outils/generer-donnees.py   # si un JSON a changé
python3 outils/verifier-site.py     # liens, ancres, traductions, données, règle érythritol
```
Ne pas livrer si le vérificateur signale une erreur.

## Conventions
- Noms de fichiers en minuscules, sans accents, avec tirets.
- CSS mobile-first (`min-width`), variables dans `:root`, mode sombre via `[data-theme]` et `prefers-color-scheme`.
- Pas de dépendance externe hors Google Fonts.
- Rédaction en français, phrases courtes ; chaque texte a sa version anglaise.

## Documentation
`docs/architecture.md` (pages et liens), `docs/base-de-donnees.md` (schémas JSON), `docs/charte-graphique.md`, `docs/a-completer.md` (contenus provisoires), `docs/mise-en-ligne.md`, `docs/historique.md`.
