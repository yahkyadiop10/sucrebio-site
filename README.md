# Site web Sucré Bio

Site vitrine bilingue (français / anglais) de **SucréBio**, l'édulcorant naturel 0 sucre, 0 calorie de SN Industrie SARL (Thiès, Sénégal).

Version multipage issue de la V3 (une seule page, conservée dans `archives/`).

## Ouvrir le site

Double-cliquez sur **`index.html`** : le site s'ouvre dans votre navigateur et toutes les pages sont reliées entre elles. Aucune installation n'est nécessaire (les polices se chargent depuis Google Fonts quand vous êtes connecté).

Pour le tester comme sur un vrai hébergement (facultatif) :

```bash
cd "Site web Sucré Bio"
python3 -m http.server 8000      # puis ouvrir http://localhost:8000
```

## Les pages

Menu : **Accueil · À propos · Produit · Bienfaits · Partenaires ▾ · Publications ▾ · Contact ▾**

| Page | Fichier | Contenu |
|---|---|---|
| Accueil | `index.html` | Accroche, chiffres clés, bénéfices, « Pour qui ? », accès aux autres pages, avis |
| Produit | `produit.html` | Composition, fiche produit, comparatif avec le sucre, mode d'emploi |
| Bienfaits | `bienfaits.html` | Les 8 avantages du produit, bienfaits par profil (diabète, sport, dents, poids), comparatif avec le sucre, avertissement médical |
| À propos | `a-propos.html` | Fondateur, engagement, vision et mission, fiche entreprise |
| Points de vente *(menu Partenaires)* | `points-de-vente.html` | Canaux de vente, villes desservies, revendeurs |
| Devenir distributeur *(menu Partenaires)* | `devenir-distributeur.html` | Avantages, profils, étapes, formulaire de demande (WhatsApp) |
| Blog *(menu Publications)* | `blog.html` | Conseils et recettes |
| Actualités *(menu Publications)* | `actualites.html` | Nouvelles de la marque |
| Article | `article.html?id=…` | Affiche une publication du blog ou des actualités |
| Contact *(menu Contact)* | `contact.html` | Coordonnées + formulaire qui ouvre WhatsApp |
| FAQ *(menu Contact)* | `faq.html` | 10 questions fréquentes |
| Mentions légales | `mentions-legales.html` | Éditeur, hébergeur, propriété intellectuelle |
| Confidentialité | `confidentialite.html` | Données personnelles |
| CGV | `cgv.html` | Commandes, prix, paiement |
| Livraison & retours | `livraison-retours.html` | Zones, délais, retours |
| Erreur 404 | `404.html` | Page affichée pour une adresse inconnue |

Plan détaillé et liens entre les pages : [`docs/architecture.md`](docs/architecture.md).

## Organisation du dossier

```
Site web Sucré Bio/
├── index.html … 404.html      les 16 pages
├── assets/
│   ├── css/style.css          styles communs
│   ├── js/main.js             langue, thème, menu, assistant, formulaire, affichage des données
│   ├── js/i18n-en.js          traductions anglaises
│   ├── js/donnees.js          copie de la base de données lisible par les pages (générée)
│   ├── img/                   logo, stick, boîte, dent, mises en situation, pastilles
│   └── videos/                vidéos MP4 hébergées avec le site (facultatif)
├── base-de-donnees/           LA base de données (fichiers JSON à modifier)
├── docs/                      documentation
├── outils/                    scripts de mise à jour et de vérification
├── archives/                  ancienne version une page (V3)
├── sitemap.xml, robots.txt    référencement
├── CLAUDE.md                  consignes pour Claude
└── README.md                  ce fichier
```

## Modifier le contenu

- **Textes fixes d'une page** (titres, paragraphes) : directement dans le fichier `.html` de la page, et la traduction anglaise dans `assets/js/i18n-en.js` (même clé que l'attribut `data-i18n`).
- **Articles du blog et actualités, FAQ, avis clients, points de vente, fiche produit, coordonnées, réponses de l'assistant, photos des bandes défilantes (`galerie.json`), vidéos (`videos.json`)** : dans `base-de-donnees/*.json`, puis lancez :

```bash
python3 outils/generer-donnees.py     # met à jour assets/js/donnees.js
python3 outils/verifier-site.py       # contrôle liens, traductions, données
```

Détail des fichiers de données : [`docs/base-de-donnees.md`](docs/base-de-donnees.md).

## Avant la mise en ligne

Plusieurs contenus sont encore provisoires (articles et avis d'exemple, RCCM/NINEA, hébergeur, revendeurs, moyens de paiement). La liste complète : [`docs/a-completer.md`](docs/a-completer.md). Mise en ligne et passage à WordPress : [`docs/mise-en-ligne.md`](docs/mise-en-ligne.md).

## Contact

SucréBio · SN Industrie SARL · Route de Mbour sur l'autoroute, en face de Thiès Ville Neuve, Thiès, Sénégal
WhatsApp +221 76 142 55 30 · info@sucrebio.com · www.sucrebio.com
