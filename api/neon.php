<?php
// Accès à Neon pour les scripts PHP du site (hébergement LWS).
// Secret : api/config.php (écrit par GitHub au moment de l'envoi, jamais dans le dépôt)
// ou variable d'environnement DATABASE_URL. Neon est joint par son API HTTPS (port 443).

function neon_url() {
  $config = is_file(__DIR__ . '/config.php') ? (include __DIR__ . '/config.php') : [];
  if (is_array($config) && !empty($config['database_url'])) return $config['database_url'];
  return getenv('DATABASE_URL') ?: null;
}

// Exécute une requête SQL. Renvoie true si elle a réussi.
function neon($url, $requete, $params = []) {
  $hote = parse_url($url, PHP_URL_HOST);
  if (!$hote) { error_log('Neon : DATABASE_URL invalide'); return false; }
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
    error_log('Neon injoignable : ' . ($err ?: 'HTTP ' . $code . ' ' . substr((string) $corps, 0, 300)));
    return false;
  }
  return true;
}
