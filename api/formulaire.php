<?php
// Enregistre dans Neon les envois des formulaires du site (contact et demande de distribution).
// Version PHP pour l'hébergement LWS ; même comportement que api/formulaire.js (Vercel).
// Le .htaccess fait pointer /api/formulaire vers ce fichier.
// Secret : api/config.php (écrit par GitHub au moment de l'envoi, jamais dans le dépôt)
// ou variable d'environnement DATABASE_URL. Rôle Neon « site_web » : ajout de lignes seulement.
// Neon est joint par son API HTTPS (port 443), comme le fait la version Vercel.

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function repondre($code, $ok) {
  http_response_code($code);
  echo json_encode(['ok' => $ok]);
  exit;
}

function txt($v, $max) {
  if (!is_string($v)) return null;
  $s = trim($v);
  $s = function_exists('mb_substr') ? mb_substr($s, 0, $max, 'UTF-8') : substr($s, 0, $max);
  return $s === '' ? null : $s;
}

function longueur($s) {
  return function_exists('mb_strlen') ? mb_strlen($s, 'UTF-8') : strlen($s);
}

// Exécute une requête SQL par l'API HTTP de Neon. Renvoie true si elle a réussi.
function neon($url, $requete, $params) {
  $hote = parse_url($url, PHP_URL_HOST);
  if (!$hote) { error_log('Formulaire : DATABASE_URL invalide'); return false; }
  $api = 'https://' . preg_replace('/^[^.]+\./', 'api.', $hote) . '/sql';
  $ch = curl_init($api);
  curl_setopt_array($ch, [
    CURLOPT_POST => true,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Neon-Connection-String: ' . $url],
    CURLOPT_POSTFIELDS => json_encode(['query' => $requete, 'params' => $params]),
  ]);
  $corps = curl_exec($ch);
  $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  $err = curl_error($ch);
  curl_close($ch);
  if ($corps === false || $code !== 200) {
    error_log('Enregistrement Neon impossible : ' . ($err ?: 'HTTP ' . $code . ' ' . substr((string) $corps, 0, 300)));
    return false;
  }
  return true;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  header('Allow: POST');
  repondre(405, false);
}

// N'accepter que les envois venant du site lui-même.
$origine = $_SERVER['HTTP_ORIGIN'] ?? '';
$hote = $_SERVER['HTTP_X_FORWARDED_HOST'] ?? ($_SERVER['HTTP_HOST'] ?? '');
if ($origine !== '' && parse_url($origine, PHP_URL_HOST) . (parse_url($origine, PHP_URL_PORT) ? ':' . parse_url($origine, PHP_URL_PORT) : '') !== $hote) {
  error_log('Formulaire refusé : origine ' . $origine . ' hôte ' . $hote);
  repondre(403, false);
}

$b = json_decode(file_get_contents('php://input'), true);
if (!is_array($b)) $b = [];
if (!empty($b['_hp'])) { error_log('Formulaire ignoré : champ piège rempli'); repondre(200, true); }

$formulaire = is_string($b['formulaire'] ?? null) ? $b['formulaire'] : '';
function refus($raison, $formulaire) {
  error_log('Formulaire refusé : ' . $raison . ' (' . $formulaire . ')');
  repondre(400, false);
}

$langue = ($b['langue'] ?? '') === 'en' ? 'en' : 'fr';
$nom = txt($b['name'] ?? null, 120);
$telephone = txt($b['phone'] ?? null, 40);
$email = txt($b['email'] ?? null, 200);
$message = txt($b['message'] ?? null, 5000);
if (!$nom || longueur($nom) < 2 || !$telephone || longueur($telephone) < 6) refus('nom ou téléphone', $formulaire);

$config = is_file(__DIR__ . '/config.php') ? (include __DIR__ . '/config.php') : [];
$url = (is_array($config) && !empty($config['database_url'])) ? $config['database_url'] : getenv('DATABASE_URL');
if (!$url) { error_log('Formulaire : DATABASE_URL absente'); repondre(500, false); }

if ($formulaire === 'contact') {
  $sujets = ['commande', 'distributeur', 'produit', 'partenariat'];
  $sujet = in_array($b['subject'] ?? null, $sujets, true) ? $b['subject'] : 'autre';
  if (!$message || longueur($message) < 10) refus('message', $formulaire);
  $ok = neon($url,
    'INSERT INTO messages_contact (nom, telephone, email, sujet, message, langue) VALUES ($1, $2, $3, $4, $5, $6)',
    [$nom, $telephone, $email, $sujet, $message, $langue]);
} elseif ($formulaire === 'distributeur') {
  $commerce = txt($b['business'] ?? null, 160);
  $type = txt($b['type'] ?? null, 60);
  $ville = txt($b['city'] ?? null, 120);
  if (!$commerce || !$type || !$ville) refus('commerce, type ou ville', $formulaire);
  $ok = neon($url,
    'INSERT INTO demandes_distributeur (nom, commerce, type, ville, telephone, email, message, langue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
    [$nom, $commerce, $type, $ville, $telephone, $email, $message, $langue]);
} else {
  refus('type de formulaire', $formulaire);
}

if (!$ok) repondre(500, false);
error_log('Formulaire enregistré : ' . $formulaire);
repondre(200, true);
