<?php
// Enregistre dans Neon les envois des formulaires du site (contact et demande de distribution).
// Version PHP pour l'hébergement LWS ; même comportement que api/formulaire.js (Vercel).
// Le .htaccess fait pointer /api/formulaire vers ce fichier.
// Accès à Neon : api/neon.php. Rôle Neon dédié : ajout de lignes seulement.

require __DIR__ . '/neon.php';

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

if ($formulaire === 'contact') {
  $sujets = ['commande', 'distributeur', 'produit', 'partenariat'];
  $sujet = in_array($b['subject'] ?? null, $sujets, true) ? $b['subject'] : 'autre';
  if (!$message || longueur($message) < 10) refus('message', $formulaire);
  $requete = 'INSERT INTO messages_contact (nom, telephone, email, sujet, message, langue) VALUES ($1, $2, $3, $4, $5, $6)';
  $params = [$nom, $telephone, $email, $sujet, $message, $langue];
} elseif ($formulaire === 'distributeur') {
  $commerce = txt($b['business'] ?? null, 160);
  $type = txt($b['type'] ?? null, 60);
  $ville = txt($b['city'] ?? null, 120);
  if (!$commerce || !$type || !$ville) refus('commerce, type ou ville', $formulaire);
  $requete = 'INSERT INTO demandes_distributeur (nom, commerce, type, ville, telephone, email, message, langue) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)';
  $params = [$nom, $commerce, $type, $ville, $telephone, $email, $message, $langue];
} else {
  refus('type de formulaire', $formulaire);
}

$url = neon_url();
if (!$url) { error_log('Formulaire : DATABASE_URL absente'); repondre(500, false); }
if (!neon($url, $requete, $params)) repondre(500, false);
error_log('Formulaire enregistré : ' . $formulaire);
repondre(200, true);
