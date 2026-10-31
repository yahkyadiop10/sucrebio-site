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
