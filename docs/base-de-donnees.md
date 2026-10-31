# Base de données

Le site étant statique, la « base de données » est un ensemble de fichiers **JSON** dans `base-de-donnees/`. C'est la seule source à modifier ; les pages lisent une copie générée (`assets/js/donnees.js`).

Pourquoi JSON : lisible et modifiable dans n'importe quel éditeur, sans serveur ni logiciel, et facile à importer plus tard dans WordPress (ACF, WP All Import) ou dans une vraie base SQL.

## Mettre à jour
1. Modifier le fichier `.json` (attention aux virgules et guillemets).
2. `python3 outils/generer-donnees.py`
3. `python3 outils/verifier-site.py`

Textes bilingues : `{ "fr": "…", "en": "…" }`. Une valeur `null` signifie « pas encore connu » : le site affiche « à compléter » ou un texte d'attente, jamais une valeur inventée.

## `entreprise.json` : coordonnées et informations légales
| Champ | Exemple | Utilisé par |
|---|---|---|
| `whatsapp` | `"221761425530"` (sans + ni espaces) | tous les liens WhatsApp, le formulaire |
| `telephone_affiche` | `"+221 76 142 55 30"` | pied de page, contact, fiche entreprise |
| `email` | `"info@sucrebio.com"` | informations et contact général : pied de page, Contact, mentions légales, fiche entreprise |
| `email_commercial` | `"commercial@sucrebio.sn"` | partenariats et distribution : Contact, Devenir distributeur, Points de vente, fiche entreprise, assistant |
| `raison_sociale`, `marque`, `fondateur` | | À propos |
| `adresse` | `{fr, en}` | À propos |
| `rccm`, `ninea`, `hebergeur` | `null` → « à compléter » | À propos |
| `moyens_paiement` | `{confirme, fr[], en[]}` | rappel du vérificateur (CGV) |
| `reseaux_sociaux` | `facebook`, `instagram`, `tiktok` | réservé (pas encore affiché) |

## `produits.json` : liste des produits
Tableau ; la page Produit affiche le premier élément.
`id`, `nom{}`, `format{}`, `sticks_par_boite`, `poids_stick_g`, `ingredients[{fr,en}]`, `conservation{}`, `origine{}`, `prix_xof` (nombre en francs CFA, ou `null` → « Sur demande, par WhatsApp »), `disponible`, `image`.

## `faq.json` : questions fréquentes
Tableau de `{ id, categorie, question{fr,en}, reponse{fr,en} }`. Les réponses acceptent des liens HTML (`<a href="produit.html">…</a>`, `<a data-wa href="#">…</a>` pour WhatsApp). Chaque question a son adresse : `faq.html#q-<id>`. Catégories utilisées : `produit`, `sante`, `utilisation`, `commande`.

## `points-de-vente.json`
- `villes[]` : `{ nom{fr,en}, statut }` avec `statut` = `disponible` | `bientot` | `prochaine_etape` (frise « Notre déploiement »).
- `revendeurs[]` : vide pour l'instant (message d'attente affiché). Format d'un revendeur :

```json
{ "nom": "Pharmacie Exemple", "ville": "Thiès", "adresse": { "fr": "…", "en": "…" },
  "type": { "fr": "Pharmacie", "en": "Pharmacy" }, "telephone": "+221 …" }
```

## `publications.json` : blog et actualités
Tableau d'articles, triés automatiquement du plus récent au plus ancien.

| Champ | Exemple | Rôle |
|---|---|---|
| `id` | `"erythritol-explique"` | identifiant unique, minuscules et tirets ; adresse `article.html?id=erythritol-explique` |
| `type` | `"blog"` ou `"actualite"` | page où l'article est listé |
| `date` | `"2026-10-01"` | format AAAA-MM-JJ |
| `exemple` | `true` | affiche le badge « Exemple » ; passer à `false` pour un vrai article |
| `image` | `"assets/img/box.webp"` | image de couverture (dans `assets/img/`) |
| `titre`, `resume` | `{fr, en}` | carte et en-tête de l'article |
| `contenu` | `{fr, en}` | texte en HTML : `<p>`, `<h2>`, `<ul><li>`, `<a href="produit.html">`, `<strong>`, `<em>` |

**Les 4 articles actuels sont des exemples** rédigés à partir des informations du site : à relire, dater et valider (ou remplacer) avant la mise en ligne. Le vérificateur contrôle les identifiants, types, dates, images et traductions.

## `temoignages.json` : avis clients
`{ nom, lieu{fr,en}, texte{fr,en}, note (1-5), exemple (true = badge « Exemple d'avis »), couleur (pastille) }`. **Les 3 avis actuels sont des exemples** à remplacer par de vrais avis (avec l'accord des clients), puis passer `exemple` à `false`.

## `chatbot.json` : réponses de l'assistant
Par langue : `accueil`, `suggestions[]` (boutons rapides), `repli` (si rien ne correspond), `regles[]` = `{ motifs, reponse }`. `motifs` est une expression régulière (mots-clés séparés par `|`, sans tenir compte des majuscules). La première règle qui correspond l'emporte : mettre les règles les plus précises en premier.

## `galerie.json` : bandes de photos défilantes
Une liste d'images **par page**. Les bandes n'apparaissent que sur 4 pages, chacune avec ses propres images : `a-propos` (scènes de vie), `bienfaits` (déclinaisons du produit), `blog` (usages), `actualites` (la marque).

```json
{ "a-propos": [ { "image": "assets/img/scene-famille-the.webp", "alt": { "fr": "…", "en": "…" } } ], "bienfaits": [ … ] }
```

| Champ | Exemple | Rôle |
|---|---|---|
| `image` | `"assets/img/scene-cafe.webp"` | photo WebP dans `assets/img/` (640 × 480 conseillé) |
| `alt` | `{fr, en}` | description de l'image pour les lecteurs d'écran (obligatoire) |
| `badge` | `true` | facultatif : image dans un disque blanc (pastilles, logos) |
| `format` | `"portrait"` | facultatif : vignette verticale (boîte, packshot) |

Pour ajouter une photo : la convertir en WebP, la déposer dans `assets/img/`, l'ajouter dans la liste de la page, puis `python3 outils/generer-donnees.py`. Photos attendues : au bureau (À propos), thé à la sénégalaise et petit-déjeuner (Bienfaits), visuel propre de la boîte.

## `videos.json` : espace vidéo (accueil et produit)
Tableau de vidéos. La première vidéo prévue pour la page s'affiche en grand ; les suivantes forment la liste à côté (cliquer pour changer).

| Champ | Exemple | Rôle |
|---|---|---|
| `id` | `"presentation-sucrebio"` | identifiant unique |
| `type` | `"youtube"` ou `"fichier"` | vidéo YouTube, ou fichier MP4 déposé dans `assets/videos/` |
| `source` | `"https://youtu.be/XXXXXXXXXXX"` ou `"assets/videos/presentation.mp4"` | lien YouTube (toutes les formes acceptées) ou chemin du fichier ; **`null` = « Vidéo à venir »** |
| `affiche` | `"assets/img/scene-sticks-16x9.webp"` | image d'attente 16:9 (1280 × 720) ; sans affiche, une vidéo YouTube prend sa miniature |
| `categorie` | `"produit"`, `"autre-produit"`, `"evenement"` | étiquette affichée |
| `pages` | `["accueil", "produit"]` | pages où la vidéo apparaît |
| `date` | `"2026-11-20"` ou `null` | facultatif (pour vos archives) |
| `titre`, `description` | `{fr, en}` | texte sous la vidéo |

**Les 3 entrées actuelles sont des emplacements vides** (`source: null`) : il suffit de renseigner `source` quand la vidéo est prête. Une vidéo YouTube ne se charge qu'au clic (domaine `youtube-nocookie.com`), ce qui garde les pages légères. Remarque : ouvert par double-clic (`file://`), YouTube peut refuser de lire la vidéo ; tout fonctionne une fois le site en ligne, et le lien « Ouvrir sur YouTube » reste disponible.
