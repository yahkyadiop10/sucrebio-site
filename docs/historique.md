# Historique des versions

## V5 · 31 octobre 2026 · ton de grande marque, finition premium
- Ton marketing bien-être : SucréBio au centre, associé à un bienfait ressenti (légèreté, plaisir, énergie, sourire). Plus de vocabulaire médical dans les titres et accroches ; les ingrédients sont nommés sur la page Produit et dans la FAQ.
- Signature : « La douceur, en toute légèreté » (EN : « Sweetness, made light »).
- Accueil : bouton principal « Découvrir SucréBio », WhatsApp en second ; pastilles flottantes en verre dépoli (une troisième : 100 % d'origine naturelle) ; anneaux autour du produit ; bandeau défilant en italique avec bords fondus.
- En-tête : « Commander » devient « Où acheter » (lien vers les points de vente) sur les 16 pages.
- Finition : boutons en dégradé avec reflet, cartes et chiffres clés plus raffinés, assistant plus discret, WhatsApp reste le bouton flottant principal.
- Accueil : les 4 cartes à chiffres deviennent 4 « moments SucréBio » en photo (café, thé en famille, douceurs maison, cuisine) ; la carte « bien-être » affiche des pastilles au lieu des zéros.
- Points de vente : recherche par ville / quartier ou « Autour de moi » ; sans revendeur proche, message de prise en charge personnalisée par la direction commerciale (WhatsApp ou e-mail). Frise « Notre déploiement » retirée : SucréBio est présenté comme disponible partout.
- Un seul e-mail partout : info@sucrebio.com (commercial@sucrebio.sn retiré, formulaires compris). Adresse : « Thiès, Sénégal ». « Conditionné » remplace « fabriqué ».
- À venir avec les données du client : tableau nutritionnel et section « Qualité et transparence ».

## V4.4 · octobre 2026 · deux e-mails, bandes ciblées
- Deux adresses : info@sucrebio.com (informations, contact général) et commercial@sucrebio.sn (partenariats, distribution), affichées selon la page ; l'assistant donne l'adresse commerciale pour les partenariats.
- Bandes de photos limitées à 4 pages, chacune avec ses images : À propos (scènes de vie), Bienfaits (déclinaisons du produit), Blog (usages), Actualités (la marque). Retirées de l'Accueil, de Produit, de Points de vente et de Devenir distributeur.

## V4.3 · octobre 2026 · animations et vidéos
- Bandes de photos défilantes en haut de 8 pages (ramenées à 4 en V4.4) (accueil, à propos, produit, bienfaits, points de vente, devenir distributeur, blog, actualités), alimentées par `base-de-donnees/galerie.json` : 5 mises en situation et les pastilles « 0 sucre 0 calorie » et « Protège vos dents ».
- Grand espace vidéo sur l'accueil et la page Produit, alimenté par `base-de-donnees/videos.json` (YouTube chargé au clic, ou fichier MP4 dans `assets/videos/`) ; 3 emplacements « Vidéo à venir » en attendant les vidéos.
- Bouton pause sur chaque bande ; aucun défilement si le visiteur a demandé de réduire les animations.
- Le vérificateur contrôle aussi la galerie et les vidéos.

## V4.2 · octobre 2026 · nouvel ordre du menu
- Barre de menu réorganisée : Accueil · À propos · Produit · Bienfaits · Partenaires · Publications · Contact (même ordre dans le menu mobile).
- La FAQ passe dans un menu déroulant Contact (Nous contacter, FAQ).
- Page Bienfaits enrichie : « Pourquoi choisir SucréBio ? » (chiffres clés et 8 avantages), bienfaits par profil, comparatif avec le sucre.

## V4.1 · octobre 2026 · menus Partenaires et Publications
- Deux menus déroulants dans l'en-tête : **Partenaires** (Points de vente, Devenir distributeur) et **Publications** (Blog, Actualités) ; regroupés aussi dans le menu mobile et le pied de page.
- Nouvelle page Devenir distributeur avec formulaire de demande envoyé via WhatsApp.
- Nouvelles pages Blog et Actualités, et page Article commune (`article.html?id=…`), alimentées par `base-de-donnees/publications.json` (4 articles d'exemple).
- Accueil : section « Nos dernières publications ».
- Les liens « Devenir revendeur » mènent maintenant à Devenir distributeur ; FAQ et assistant mis à jour.

## V4 · octobre 2026 · site multipage
- Passage d'une page unique à 12 pages reliées : Accueil, Produit, Bienfaits, À propos, Points de vente, FAQ, Contact, 4 pages légales, 404.
- Navigation avec page active, fil d'Ariane, bandeaux de liens vers la page suivante, pied de page complet.
- Pages légales devenues de vraies pages (elles étaient des fenêtres).
- Base de données JSON (`base-de-donnees/`) : entreprise, produits, FAQ, points de vente, avis, assistant.
- Fiche produit, fiche entreprise, frise des villes, FAQ (10 questions) et avis affichés depuis la base.
- FAQ enrichie : contenu de la boîte, conservation, où acheter, devenir revendeur.
- Lien `contact.html?sujet=revendeur` qui présélectionne le sujet du formulaire.
- Images séparées dans `assets/img/` (elles étaient intégrées en base64).
- `sitemap.xml`, `robots.txt`, balises canonical et Open Graph par page.
- Outils : `generer-donnees.py`, `verifier-site.py`.

## V3 · octobre 2026 · une page
Refonte complète du design, corrections, formulaire vers WhatsApp. Conservée dans `archives/sucrebio-v3-une-page.html`.

## V1 – V2
Identité visuelle, sections, chatbot, bilingue, puis optimisation mobile-first et UX. Fichiers non conservés.
