<?php

ini_set('memory_limit', '32M');

define('NFQWS2', file_exists('/opt/usr/bin/nfqws2') || file_exists('/usr/bin/nfqws2'));
define('ROOT_DIR', (file_exists('/opt/usr/bin/nfqws2') || file_exists('/opt/usr/bin/nfqws')) ? '/opt' : '');
const CONF_FILE = ROOT_DIR . '/etc/nfqws_web.conf';
const SCRIPT_NAME = ROOT_DIR ? (NFQWS2 ? 'S51nfqws2' : 'S51nfqws') : (NFQWS2 ? 'nfqws2-keenetic' : 'nfqws-keenetic');
const CONF_DIR = NFQWS2 ? '/etc/nfqws2' : '/etc/nfqws';
const LISTS_DIR = NFQWS2 ? '/etc/nfqws2/lists' : '/etc/nfqws';
const LOGS_DIR = '/var/log';
const LUA_DIR = '/etc/nfqws2/lua';

function normalizeString(string $s): string
{
  // Convert all line-endings to UNIX format.
  $s = str_replace(array("\r\n", "\r", "\n"), "\n", $s);

  // Don't allow out-of-control blank lines.
  $s = preg_replace("/\n{3,}/", "\n\n", $s);

  $lastChar = substr($s, -1);
  if ($lastChar !== "\n" && !empty($s)) {
    $s .= "\n";
  }

  return $s;
}

/**
 * Делает GET, проверяет финальный HTTP-статус 2xx и то, что тело реально начало приходить.
 * Читает максимум первые $limitKb КБ и обрывает соединение после этого.
 * 204 No Content считается OK даже без тела.
 */
function checkResponseBodyReadable(string $url, int $limitKb = 50): bool
{
  $limitBytes = $limitKb * 1024;

  $received = 0;
  $statusCode = null;
  $statusOk = false;
  $bodyStarted = false;
  $reachedLimit = false;

  $ch = curl_init($url);

  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => false,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_MAXREDIRS => 5,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_CONNECTTIMEOUT => 5,
    // Helpful on embedded/POSIX systems so timeouts don't rely on signals
    CURLOPT_NOSIGNAL => 1,

    // Читаем статус (последний, с учётом редиректов)
    CURLOPT_HEADERFUNCTION => function ($ch, $header) use (&$statusOk, &$statusCode) {
      if (preg_match('#^HTTP/\d+\.\d+\s+(\d+)#', $header, $m)) {
        $code = (int)$m[1];
        $statusCode = $code;
        $statusOk = ($code >= 200 && $code < 300);
      }
      return strlen($header);
    },

    // Читаем тело, но не сохраняем
    CURLOPT_WRITEFUNCTION => function ($ch, $chunk) use (
      &$received,
      $limitBytes,
      &$statusOk,
      &$bodyStarted,
      &$reachedLimit
    ) {
      // Если статус не 2xx — дальше тело читать не надо
      if (!$statusOk) {
        return 0;
      }

      $len = strlen($chunk);
      if ($len > 0) {
        $bodyStarted = true;
        $received += $len;
      }

      // если дошли до лимита — обрываем
      if ($received >= $limitBytes) {
        $reachedLimit = true;
        return 0;
      }

      return $len;
    },

    // Если соединение "подвисло" и не качает — быстрее возвращаемся
    CURLOPT_LOW_SPEED_LIMIT => 1,  // bytes/sec
    CURLOPT_LOW_SPEED_TIME => 10,  // seconds
  ]);

  curl_exec($ch);
  curl_close($ch);

//  // 204 считаем ок даже без тела
//  if ($statusOk && $statusCode === 204) {
//    return true;
//  }
//
//  // Для остальных 2xx: true если тело реально начало приходить.
//  if ($statusOk && ($bodyStarted || $reachedLimit)) {
//    return true;
//  }
//
//  return false;

  // Считаем запрос успешным, если мы вообще получили HTTP-ответ (любой код: 2xx/3xx/4xx/5xx).
  // Неуспех — это когда ответа нет совсем (DNS не резолвится, таймаут, нет соединения и т.п.),
  // в этом случае статусная строка не будет получена и $statusCode останется null.
  return $statusCode !== null;
}

function baseFileName(string $filename): string
{
  $filename = basename($filename);
  if (str_ends_with($filename, '.gz')) {
    $filename = substr($filename, 0, -3);
  }
  return $filename;
}

function getFilePath(string $filename): string
{
  $filename = baseFileName($filename);
  if (preg_match('/\.(list|list-opkg|list-old)$/i', $filename)) {
    $path = ROOT_DIR . LISTS_DIR . '/' . basename($filename);
  } else if (preg_match('/\.log$/i', $filename)) {
    $path = ROOT_DIR . LOGS_DIR . '/' . basename($filename);
  } else if (preg_match('/\.lua$/i', $filename)) {
    $path = ROOT_DIR . LUA_DIR . '/' . basename($filename);
  } else {
    $path = ROOT_DIR . CONF_DIR . '/' . basename($filename);
  }
  return $path;
}

function getFiles(string $type = null): array
{
  function getSortPriority(string $filename): int
  {
    $priority = [
      'nfqws2.conf' => -81,
      'nfqws.conf' => -80,
      'user.list' => -64,
      'exclude.list' => -63,
      'auto.list' => -62,
      'ipset.list' => -61,
      'ipset_exclude.list' => -60,
      'nfqws2.log' => -11,
      'nfqws.log' => -10,
      'nfqws2-debug.log' => -9,
      'nfqws-debug.log' => -8,
    ];

    if (array_key_exists($filename, $priority)) {
      return $priority[$filename];
    }
    if (str_ends_with($filename, '.conf')) {
      return -70;
    }
    if (str_ends_with($filename, '.list')) {
      return -50;
    }
    if (str_ends_with($filename, '.lua')) {
      return -30;
    }
    if (str_ends_with($filename, '.log')) {
      return 0;
    }
    return 10;
  }

  $result = [];

  if (empty($type) || $type == 'conf') {
    // GLOB_BRACE is unsupported in openwrt
    $confs = array_filter(glob(ROOT_DIR . CONF_DIR . '/*'), function ($file) {
      return is_file($file) && preg_match('/\.(conf|conf-opkg|conf-old|apk-new)$/i', $file);
    });
    $baseConfs = array_map(fn($file) => baseFileName($file), $confs);
    $result = array_merge($result, $baseConfs);
  }

  if (empty($type) || $type == 'list') {
    // GLOB_BRACE is unsupported in openwrt
    $lists = array_filter(glob(ROOT_DIR . LISTS_DIR . '/*'), function ($file) {
      return is_file($file) && preg_match('/\.(list|list\.gz|list-opkg|list-old)$/i', $file);
    });
    $baseLists = array_map(fn($file) => baseFileName($file), $lists);
    $result = array_merge($result, $baseLists);
  }

  if (empty($type) || $type == 'log') {
    // GLOB_BRACE is unsupported in openwrt
    $logs = array_filter(glob(ROOT_DIR . LOGS_DIR . '/nfqws*'), function ($file) {
      return is_file($file) && preg_match('/\.log$/i', $file);
    });
    $baseLogs = array_map(fn($file) => baseFileName($file), $logs);
    $result = array_merge($result, $baseLogs);
  }

  if (NFQWS2 && empty($type) || $type == 'lua') {
    // GLOB_BRACE is unsupported in openwrt
    $luas = array_filter(glob(ROOT_DIR . LUA_DIR . '/*'), function ($file) {
      return is_file($file) && preg_match('/\.(lua|lua\.gz)$/i', $file);
    });
    $baseLuas = array_map(fn($file) => baseFileName($file), $luas);
    $result = array_merge($result, $baseLuas);
  }

  usort($result, fn($a, $b) => getSortPriority($a) - getSortPriority($b));

  return $result;
}

function getFileContent(string $filename): string
{
  $path = getFilePath($filename);

  if (file_exists($path)) {
    return file_get_contents($path);
  } else if (file_exists($path . '.gz')) {
    return file_get_contents('compress.zlib://' . $path . '.gz');
  }
  return '';
}

function getLogContent(string $filename): string
{
  $filename = baseFileName($filename);
  $file = file(ROOT_DIR . LOGS_DIR . '/' . $filename);
  $file = array_reverse($file);
  return implode("", $file);
}

function createFile(string $filename): bool
{
  $base = baseFileName($filename);
  $stem = pathinfo($base, PATHINFO_FILENAME);
  if ($base === '' || $base === '.' || $base === '..' || trim($stem) === '') {
    return false;
  }
  if (!preg_match('/^[a-zA-Z0-9_-]+$/', $stem)) {
    return false;
  }
  $path = getFilePath($filename);
  if (file_exists($path)) {
    return false;
  }
  return file_put_contents($path, '') !== false;
}

function saveFile(string $filename, string $content): bool
{
  $path = getFilePath($filename);
  return file_put_contents($path, normalizeString($content)) !== false;
}

function removeFile(string $filename): bool
{
  $path = getFilePath($filename);
  if (file_exists($path)) {
    return unlink($path);
  } else {
    return false;
  }
}

function nfqwsServiceStatus(): array
{
  $output = null;
  $path = ROOT_DIR . "/etc/init.d/" . SCRIPT_NAME;
  if (!file_exists($path)) {
    return array('service' => false, 'status' => 1);
  }

  exec($path . " status", $output);
  $running = str_contains($output[0] ?? '', 'is running');
  return array('service' => $running, 'status' => 0);
}

function nfqwsServiceAction(string $action): array
{
  $output = null;
  $retval = null;
  exec(ROOT_DIR . "/etc/init.d/" . SCRIPT_NAME . " $action", $output, $retval);
  return array('output' => $output, 'status' => $retval);
}

function nfqwsInstalledVersionOpkg(): string
{
  $output = null;
  if (NFQWS2) {
    exec("opkg status nfqws2-keenetic | awk -F': ' '/^Version:/ {print $2}'", $output);
  } else {
    exec("opkg status nfqws-keenetic | awk -F': ' '/^Version:/ {print $2}'", $output);
  }
  return $output[0] ?? '';
}

function nfqwsInstalledVersionApk(): string
{
  $output = null;
  if (NFQWS2) {
    exec("apk list --installed nfqws2-keenetic | awk -F'nfqws2-keenetic-| ' '{print $2}'", $output);
  } else {
    exec("apk list --installed nfqws-keenetic | awk -F'nfqws2-keenetic-| ' '{print $2}'", $output);
  }
  return $output[0] ?? '';
}


function nfqwsInstalledVersion(): string
{
  return file_exists('/usr/bin/apk') ? nfqwsInstalledVersionApk() : nfqwsInstalledVersionOpkg();
}

function opkgUpgradeAction(): array
{
  $output = null;
  $retval = null;
  if (NFQWS2) {
    exec("opkg update && opkg upgrade nfqws2-keenetic nfqws-keenetic-web", $output, $retval);
  } else {
    exec("opkg update && opkg upgrade nfqws-keenetic nfqws-keenetic-web", $output, $retval);
  }
  if (empty($output)) {
    $output[] = 'Nothing to update';
  }
  return array('output' => $output, 'status' => $retval);
}

function apkUpgradeAction(): array
{
  $output = null;
  $retval = null;
  if (NFQWS2) {
    exec("apk --update-cache add nfqws2-keenetic nfqws-keenetic-web", $output, $retval);
  } else {
    exec("apk --update-cache add nfqws-keenetic nfqws-keenetic-web", $output, $retval);
  }
  if (empty($output)) {
    $output[] = 'Nothing to update';
  }
  return array('output' => $output, 'status' => $retval);
}

function upgradeAction(): array
{
  return file_exists('/usr/bin/apk') ? apkUpgradeAction() : opkgUpgradeAction();
}

function authenticate($username, $password): bool
{
  $passwdFile = ROOT_DIR . '/etc/passwd';
  $shadowFile = ROOT_DIR . '/etc/shadow';

  $users = file(file_exists($shadowFile) ? $shadowFile : $passwdFile);
  $user = preg_grep("/^" . preg_quote($username, '/') . ":/", $users);

  if ($user) {
    list(, $passwdInDB) = explode(':', array_pop($user));
    if (empty($passwdInDB)) {
      return empty($password);
    }
    if (hash_equals(crypt($password, $passwdInDB), $passwdInDB)) {
      return true;
    }
  }

  return false;
}

function main(): void
{
  if (!isset($_SERVER['REQUEST_METHOD']) || $_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(302);
    header('Location: index.html');
    exit();
  }

  $config = parse_ini_file(CONF_FILE, true);
  $authEnabled = $config['auth']['enabled'];

  session_start();
  if ($authEnabled && (!isset($_SESSION['auth']) || !$_SESSION['auth'])) {
    if ($_POST['cmd'] !== 'login' || !isset($_POST['user']) || !isset($_POST['password']) || !authenticate($_POST['user'], $_POST['password'])) {
      http_response_code(401);
      exit();
    } else {
      $_SESSION['auth'] = true;
    }
  }

  switch ($_POST['cmd']) {
    case 'status':
      $status = nfqwsServiceStatus();
      $response = array('status' => $status['status'], 'service' => $status['service'], 'nfqws2' => NFQWS2, 'version' => nfqwsInstalledVersion(), 'anonym' => !$authEnabled);
      break;

    case 'filenames':
      $files = getFiles($_POST['type'] ?? null);
      $response = array('status' => 0, 'files' => $files);
      break;

    case 'filecontent':
      if (str_ends_with($_POST['filename'], '.log')) {
        $content = getLogContent($_POST['filename']);
      } else {
        $content = getFileContent($_POST['filename']);
      }
      $response = array('status' => 0, 'content' => $content, 'filename' => $_POST['filename']);
      break;

    case 'filecreate':
      $result = createFile($_POST['filename']);
      $response = array('status' => $result ? 0 : 1, 'filename' => $_POST['filename']);
      break;

    case 'filesave':
      $result = saveFile($_POST['filename'], $_POST['content']);
      $response = array('status' => $result ? 0 : 1, 'filename' => $_POST['filename']);
      break;

    case 'fileremove':
      $result = removeFile($_POST['filename']);
      $response = array('status' => $result ? 0 : 1, 'filename' => $_POST['filename']);
      break;

    case 'reload':
    case 'restart':
    case 'stop':
    case 'start':
      $response = nfqwsServiceAction($_POST['cmd']);
      break;

    case 'upgrade':
      $response = upgradeAction();
      break;

    case 'login':
      $response = array('status' => 0);
      break;

    case 'logout':
      $_SESSION['auth'] = false;
      $response = array('status' => 0);
      break;

    case 'check':
      $response = array('status' => 0, 'result' => checkResponseBodyReadable($_POST['url']));
      break;

    default:
      http_response_code(405);
      exit();
  }

  header('Content-Type: application/json; charset=utf-8');
  http_response_code(200);
  echo json_encode($response);
  exit();
}

main();
