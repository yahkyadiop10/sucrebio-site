# Architecture du site

## Plan du site

```
Accueil (index.html)
├── À propos (a-propos.html)
├── Produit (produit.html)            #utilisation = mode d'emploi
├── Bienfaits (bienfaits.html)        avantages, profils #b-diabete #b-sport #b-dents #b-poids, comparatif
├── Partenaires (menu déroulant)
│   ├── Points de vente (points-de-vente.html)
│   └── Devenir distributeur (devenir-distributeur.html)   #formulaire
├── Publications (menu déroulant)
│   ├── Blog (blog.html)
│   ├── Actualités (actualites.html)
│   └── Article (article.html?id=<id>)   une page pour toutes les publications
├── Contact (menu déroulant)
│   ├── Nous contacter (contact.html)   ?sujet=commande|distributeur|produit|partenariat
│   └── FAQ (faq.html)                 #q-<id> = une question (ex. faq.html#q-diabete)
└── Informations
    ├── Mentions légales (mentions-legales.html)
    ├── Confidentialité (confidentialite.html)
    ├── CGV (cgv.html)
    └── Livraison & retours (livraison-retours.html)
404.html : page d'erreur (à déclarer chez l'hébergeur)
```

## Liens présents sur chaque page
- **En-tête**, dans cet ordre : Accueil, À propos, Produit, Bienfaits, **Partenaires ▾** (Points de vente, Devenir distributeur), **Publications ▾** (Blog, Actualités), **Contact ▾** (Nous contacter, FAQ) ; le logo mène aussi à l'Accueil ; FR/EN ; bouton « Commander » (WhatsApp). Les menus s'ouvrent au survol (souris) ou au clic (tactile, clavier) ; Échap les ferme. Le menu parent de la page en cours est surligné (`class="dd is-current"`).
- **Menu mobile** : les mêmes liens dans le même ordre, les sous-pages regroupées sous les intitulés Partenaires, Publications et Contact.
- **Fil d'Ariane** (pages intérieures) : Accueil / Page.
- **Pied de page** : toutes les pages du site (colonnes Navigation, Partenaires, Publications ; FAQ et Contact dans Navigation), les 4 pages légales, WhatsApp, e-mail, mode sombre.
- **Boutons flottants** : retour en haut, assistant, WhatsApp.

## Liens entre les pages (parcours)

| Depuis | Vers |
|---|---|
| Accueil, accroche | Produit, WhatsApp |
| Accueil, « Pour qui ? » | Bienfaits #b-diabete, #b-sport, #b-dents |
| Accueil, « Explorer » | Produit, Bienfaits, Points de vente, À propos |
| Accueil, « Nos dernières publications » | les 3 publications les plus récentes, Blog, Actualités |
| Accueil, bandeau final | WhatsApp, Points de vente |
| Produit | WhatsApp, Points de vente, Bienfaits, FAQ |
| Bienfaits | FAQ, Produit |
| À propos | Devenir distributeur, Points de vente |
| Points de vente | Devenir distributeur, WhatsApp |
| Devenir distributeur | formulaire → WhatsApp, Points de vente, FAQ |
| Blog ↔ Actualités | l'un vers l'autre ; chaque carte → article.html?id=… |
| Article | retour au Blog ou aux Actualités, « À lire aussi » (3 autres publications), liens dans le texte |
| FAQ (réponses) | Produit #utilisation, Points de vente, Devenir distributeur, Contact, WhatsApp |
| FAQ, bandeau final | Contact, WhatsApp |
| Pages légales | entre elles, Contact |
| Assistant (toutes pages) | Produit, Bienfaits, Points de vente, Devenir distributeur, Blog, Actualités, FAQ, WhatsApp |

## Fichiers communs

| Fichier | Rôle |
|---|---|
| `assets/css/style.css` | Tous les styles (repris de la V3 + composants multipage : `.page-hero`, `.crumbs`, `.cta-band`, `.explore`, `.facts`, `.prose`, `.legal-nav`, menus `.dd`, cartes `.posts`/`.post`) |
| `assets/js/main.js` | Langue, thème, en-tête, menus déroulants, menu mobile, apparition au défilement, formulaires → WhatsApp, assistant, rendus de données (dont blog, actualités, article, bandes de photos `bandeau`, espace vidéo `videos`) |
| `assets/js/i18n-en.js` | Traductions anglaises (`window.SB_EN`) |
| `assets/js/donnees.js` | Base de données pour les pages (`window.SB_DATA`), générée |

Ordre de chargement en bas de chaque page : `donnees.js` → `i18n-en.js` → `main.js`.

## Comment fonctionne la traduction
1. Chaque texte traduisible porte une clé : `data-i18n="cle"` (texte), `data-i18n-html="cle"` (texte avec balises), `data-i18n-attr="aria-label:cle;alt:cle2"` (attributs).
2. Au chargement, `main.js` mémorise le français présent dans la page.
3. En anglais, il remplace par `SB_EN[cle]` ; en français, il remet le texte mémorisé.
4. Le choix est mémorisé dans le navigateur (`sb-lang`), il suit donc le visiteur de page en page.

Titre d'onglet et meta description : clés `pt_<page>` et `pd_<page>`.

## Ajouter un article (blog ou actualité)
Pas besoin de créer de page : ajoutez une entrée dans `base-de-donnees/publications.json`, lancez `python3 outils/generer-donnees.py`. L'article apparaît dans la bonne liste, sur l'accueil s'il est parmi les 3 plus récents, et à l'adresse `article.html?id=<id>`. Ajoutez cette adresse dans `sitemap.xml`.

## Bandes de photos et vidéos
- Bande défilante, sur 4 pages seulement (À propos, Bienfaits, Blog, Actualités) : `<div class="photo-band" data-render="bandeau" data-galerie="bienfaits" data-sens="inverse"></div>`, placée juste après l'en-tête de page (`.page-hero`). Images lues dans la liste `galerie.json` de la page.
- Deux adresses e-mail dans `entreprise.json` : `email` (info@sucrebio.com, informations et contact général : pied de page, Contact, mentions légales) et `email_commercial` (commercial@sucrebio.sn, partenariats et distribution : Contact, Devenir distributeur, Points de vente, assistant). `data-bind="email|email_commercial"` met aussi à jour le lien `mailto:`.
- Espace vidéo : `<div class="vid" data-render="videos" data-page="accueil"></div>` dans une section `.videos-sec`. Vidéos lues dans `videos.json` (champ `pages`). Sans vidéo pour la page, la section se masque.

## Ajouter une page
1. Copier une page intérieure (par ex. `bienfaits.html`) sous un nouveau nom.
2. Changer `<title>`, meta description, canonical, `data-page`, les clés `pt_`/`pd_`, le fil d'Ariane et le contenu de `<main>`.
3. Ajouter le lien dans l'en-tête (lien simple ou dans un menu déroulant `.dd__menu`), le menu mobile et le pied de page **des 16 pages**, et dans `sitemap.xml`.
4. Ajouter les traductions dans `i18n-en.js`, puis lancer `python3 outils/verifier-site.py`.
