<?php
// Bilan de santé pour la surveillance : le PHP tourne et Neon répond (requête « SELECT 1 », rien n'est écrit).
// Le .htaccess fait pointer /api/sante vers ce fichier.
require __DIR__ . '/neon.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
$url = neon_url();
$neon = $url ? neon($url, 'SELECT 1') : false;
http_response_code($neon ? 200 : 503);
echo json_encode(['ok' => $neon, 'php' => true, 'neon' => $url ? $neon : 'non configuré']);
