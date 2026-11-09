# Mise en ligne

## Option A : hébergement statique (le plus simple)
Le dossier fonctionne tel quel sur n'importe quel hébergement de fichiers (Netlify, Vercel, GitHub Pages, cPanel/FTP…).
1. Compléter `docs/a-completer.md`.
2. `python3 outils/generer-donnees.py` puis `python3 outils/verifier-site.py`.
3. Envoyer **tout le contenu** du dossier à la racine du site (sauf `archives/`, `outils/`, `docs/` si vous préférez ne pas les publier).
4. Déclarer `404.html` comme page d'erreur (Netlify et GitHub Pages le font seuls ; sur Apache : `ErrorDocument 404 /404.html` dans `.htaccess`).
5. Activer HTTPS et vérifier que le domaine pointe sur `https://www.sucrebio.com/` (adresse utilisée dans les balises canonical et `sitemap.xml`).
6. Déclarer `https://www.sucrebio.com/sitemap.xml` dans Google Search Console.

## Option B : WordPress + Elementor (cible prévue)
| Ici | Dans WordPress |
|---|---|
| Chaque fichier `.html` | Une page WordPress, même slug (`produit`, `bienfaits`, `a-propos`, `points-de-vente`, `faq`, `contact`…) |
| `assets/css/style.css` | Thème enfant ou Elementor > CSS personnalisé ; couleurs et polices dans les réglages globaux Elementor |
| FR / EN (`i18n-en.js`) | WPML : page FR + traduction EN ; hreflang générés par WPML |
| `faq.json` | Widget Accordéon Elementor + données structurées FAQ de Yoast |
| `temoignages.json`, `points-de-vente.json`, `produits.json` | Type de contenu personnalisé (ACF) ou import CSV/JSON (WP All Import) |
| Formulaire → WhatsApp | Formulaire Elementor Pro (envoi e-mail) ou conserver le lien WhatsApp |
| Assistant `chatbot.json` | Extension Chatbot : reprendre les questions/réponses |
| Bouton WhatsApp flottant | Extension WhatsApp Chat |
| Balises title/description | Yoast SEO (reprendre `pt_*` / `pd_*`) |
| Pages légales | Pages WordPress simples, liées dans le menu du pied de page |

## Hébergement actuel : GitHub + Vercel + Neon (depuis le 31/10/2026)
- **Code :** dépôt GitHub `yahkyadiop10/sucrebio-site`. La branche `main` = le site en ligne. Chaque modification passe par une branche et une demande de fusion (pull request) ; Vercel publie un lien d'aperçu à valider avant fusion.
- **Vercel :** site statique sans compilation, plus une fonction `api/formulaire.js` (région Francfort). Les fichiers listés dans `.vercelignore` (docs, outils, archives) ne sont pas publiés.
- **Neon :** projet `sucrebio`, base `sucrebio` (région Francfort). Schéma dans `neon/schema.sql` :
  - `messages_contact` : envois du formulaire de contact ;
  - `demandes_distributeur` : envois du formulaire « Devenir distributeur ».
  La colonne `traite` sert à marquer une demande comme traitée.
- **Formulaires :** ils ouvrent toujours WhatsApp avec le message prérempli, et envoient en plus une copie à `/api/formulaire`, qui l'enregistre dans Neon. Un champ piège caché (`_hp`) écarte les robots.
- **Secret :** la variable d'environnement Vercel `DATABASE_URL` utilise le rôle Neon `site_web`, qui peut seulement ajouter des lignes (ni lire, ni modifier, ni supprimer). Ne jamais écrire ce secret dans le dépôt.
- **Lire les demandes :** console Neon > projet sucrebio > Tables, ou SQL Editor : `SELECT * FROM messages_contact ORDER BY cree_le DESC;`

## Hébergement de production : LWS, www.sucrebio.com (depuis le 07/11/2026)
- **Envoi automatique :** chaque modification fusionnée dans `main` lance `.github/workflows/mise-en-ligne-lws.yml`. GitHub contrôle le site (`generer-donnees.py`, `verifier-site.py`, syntaxe PHP) ; s'il y a une erreur, rien n'est envoyé. Sinon il envoie les fichiers sur LWS par FTPS (seuls les fichiers modifiés partent). Lancement manuel possible : onglet Actions > Mise en ligne LWS > Run workflow.
- **Non envoyés :** archives, docs, outils, neon, fichiers Vercel et Node (`api/formulaire.js`, `package*.json`, `vercel.json`), CLAUDE.md, README.md.
- **Secrets GitHub** (Settings > Secrets and variables > Actions) : `FTP_SERVEUR`, `FTP_UTILISATEUR`, `FTP_MOT_DE_PASSE`, `FTP_DOSSIER` (dossier du site vu depuis la connexion FTP ; chez LWS la connexion arrive déjà dans `htdocs`, donc `./`), `DATABASE_URL` (chaîne de connexion Neon d'un rôle en ajout seul). Sans secrets FTP, le site est contrôlé mais pas envoyé.
- **Formulaire :** `api/formulaire.php` (même règles que `api/formulaire.js`) écrit dans Neon par l'API HTTPS de Neon (port 443, pas besoin de l'extension PostgreSQL de PHP ; il faut `curl`, présent chez LWS). Le secret est écrit au moment de l'envoi dans `api/config.php`, jamais dans le dépôt ; le `.htaccess` en bloque l'accès.
- **`.htaccess` :** `index.html` servi avant l'`index.php` de l'ancien WordPress resté dans `htdocs`, page 404, redirection vers `https://www.sucrebio.com`, adresse `/api/formulaire` → `api/formulaire.php`, fichiers cachés bloqués (sauf `.well-known`, utile au certificat SSL).
- **Ordre de mise en route :** 1. activer le certificat SSL gratuit (Let's Encrypt) dans l'espace LWS ; 2. créer les secrets GitHub ; 3. fusionner ou lancer le workflow ; 4. tester une page, l'anglais, la 404 et un envoi de formulaire, puis vérifier la ligne dans Neon.
- **Vercel** reste branché au dépôt : il sert aux aperçus avant fusion (`sucrebio-git-<branche>-digitalab2.vercel.app`).
- **E-mails :** ne jamais modifier les enregistrements MX de la zone DNS chez LWS (ils font marcher info@sucrebio.com).

## Tests et surveillance (depuis le 09/11/2026)
Trois protections automatiques, visibles dans l'onglet **Actions** de GitHub :

1. **Avant chaque fusion** (`.github/workflows/controle.yml`, sur chaque pull request) : vérificateur du site, contrôle du PHP, test du formulaire (`outils/tester-formulaire.py` : refus des envois invalides, réponse sans clé Neon), puis chaque page ouverte dans un vrai navigateur, en français et en anglais, sur ordinateur et sur téléphone (`outils/tester-navigateur.mjs` : erreurs JavaScript, fichiers manquants, zones de données vides, débordement horizontal). Case rouge = ne pas fusionner.
2. **À chaque mise en ligne** (`mise-en-ligne-lws.yml`) : les mêmes contrôles rapides avant l'envoi (rien n'est envoyé en cas d'erreur), puis vérification du site en ligne juste après.
3. **Toutes les heures** (`surveillance.yml`) : `outils/surveiller-site.sh` vérifie l'accueil (le site, pas l'ancien WordPress), les pages principales, les fichiers CSS/JS, la vraie erreur 404, la redirection `http://sucrebio.com` → `https://www.sucrebio.com`, la protection de `api/config.php`, le bilan `/api/sante` (PHP + Neon, sans rien écrire) et la validité du certificat SSL (au moins 14 jours). En cas de problème, un ticket « Site en panne » est ouvert dans **Issues** et assigné à yahkyadiop10 (e-mail de GitHub) ; il se ferme tout seul au retour à la normale.

À savoir : GitHub met en pause les tâches programmées d'un dépôt sans aucune modification pendant 60 jours (il prévient par e-mail ; un clic sur « Enable workflow » suffit). Les tâches horaires peuvent avoir quelques minutes de retard.

En local :
```bash
python3 outils/tester-formulaire.py            # formulaire PHP (php requis)
node outils/tester-navigateur.mjs              # navigateur (Playwright requis)
bash outils/surveiller-site.sh                 # site en ligne
```
