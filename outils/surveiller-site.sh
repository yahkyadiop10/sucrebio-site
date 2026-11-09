#!/usr/bin/env bash
# Vérifie que le site en ligne répond bien. Utilisé toutes les heures par .github/workflows/surveillance.yml
# et juste après chaque mise en ligne. Usage : bash outils/surveiller-site.sh [https://www.sucrebio.com]
# Sort en erreur (code 1) si un contrôle échoue ; chaque ligne dit ce qui a été vérifié.
SITE="${1:-https://www.sucrebio.com}"
DOMAINE="${SITE#https://www.}"
problemes=0
ok()  { echo "✓ $1"; }
ko()  { echo "✗ $1"; problemes=$((problemes + 1)); }
recup() { curl -sS --max-time 30 --retry 2 --retry-delay 10 -o "$2" -w '%{http_code} %{redirect_url}' "$1" 2>/dev/null || echo "000 "; }

corps=$(mktemp)

# 1. Page d'accueil : répond 200 et c'est bien le site SucréBio (pas l'ancien WordPress).
read -r code _ <<< "$(recup "$SITE/" "$corps")"
if [ "$code" = 200 ] && grep -q 'assets/js/main.js' "$corps" && ! grep -q 'wp-content' "$corps"; then ok "Accueil ($code)"; else ko "Accueil : code $code ou contenu inattendu"; fi

# 2. Pages principales.
for page in a-propos.html produit.html contact.html points-de-vente.html; do
  read -r code _ <<< "$(recup "$SITE/$page" "$corps")"
  [ "$code" = 200 ] && ok "$page ($code)" || ko "$page : code $code"
done

# 3. Fichiers du site (style, script, données).
for f in assets/css/style.css assets/js/main.js assets/js/donnees.js; do
  read -r code _ <<< "$(recup "$SITE/$f" "$corps")"
  [ "$code" = 200 ] && ok "$f ($code)" || ko "$f : code $code"
done

# 4. Page inexistante : vraie erreur 404 avec la page « introuvable » du site.
read -r code _ <<< "$(recup "$SITE/page-inexistante-surveillance" "$corps")"
[ "$code" = 404 ] && ok "Page inexistante (404)" || ko "Page inexistante : code $code au lieu de 404"

# 5. Adresse sans www et sans https : redirigée vers l'adresse officielle.
read -r code cible <<< "$(recup "http://$DOMAINE/" "$corps")"
if [ "$code" = 301 ] && [ "${cible%/}" = "$SITE" ]; then ok "Redirection http://$DOMAINE → $cible"; else ko "Redirection http://$DOMAINE : code $code vers « $cible »"; fi

# 6. Le fichier secret du formulaire ne doit jamais être lisible.
read -r code _ <<< "$(recup "$SITE/api/config.php" "$corps")"
[ "$code" = 403 ] && ok "Fichier secret protégé (403)" || ko "api/config.php : code $code au lieu de 403"

# 7. Formulaire : PHP tourne et la base Neon répond.
read -r code _ <<< "$(recup "$SITE/api/sante" "$corps")"
reponse=$(cat "$corps")
if [ "$code" = 200 ] && grep -q '"neon":true' "$corps"; then ok "Formulaires : PHP et Neon répondent"
elif grep -q '"neon":"non configur' "$corps"; then echo "! Formulaires : clé Neon (DATABASE_URL) pas encore installée"
else ko "Formulaires : code $code, réponse « ${reponse:0:120} »"; fi

# 8. Certificat SSL : valable encore au moins 14 jours.
fin=$(echo | openssl s_client -servername "${SITE#https://}" -connect "${SITE#https://}:443" 2>/dev/null | openssl x509 -noout -enddate 2>/dev/null | cut -d= -f2)
if [ -n "$fin" ]; then
  jours=$(( ($(date -d "$fin" +%s) - $(date +%s)) / 86400 ))
  [ "$jours" -ge 14 ] && ok "Certificat SSL valable encore $jours jours" || ko "Certificat SSL : expire dans $jours jours"
else ko "Certificat SSL illisible"; fi

rm -f "$corps"
echo
if [ "$problemes" -eq 0 ]; then echo "Site en bonne santé."; else echo "$problemes problème(s) détecté(s)."; exit 1; fi
