<?php

ini_set('memory_limit', '32M');

// TODO: Проверить что nfqws вообще установлен

define('NFQWS2', file_exists('/opt/usr/bin/nfqws2') || file_exists('/usr/bin/nfqws2'));
define('ROOT_DIR', (file_exists('/opt/usr/bin/nfqws2') || file_exists('/opt/usr/bin/nfqws')) ? '/opt' : '');
const SCRIPT_NAME = ROOT_DIR ? (NFQWS2 ? 'S51nfqws2' : 'S51nfqws') : (NFQWS2 ? 'nfqws2-keenetic' : 'nfqws-keenetic');
const CONF_DIR = NFQWS2 ? '/etc/nfqws2' : '/etc/nfqws';
const LISTS_DIR = NFQWS2 ? '/etc/nfqws2/lists' : '/etc/nfqws';
const LOG_FILE = NFQWS2 ? '/var/log/nfqws2.log' : '/var/log/nfqws.log';

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

function getFiles(): array
{
    // GLOB_BRACE is unsupported in openwrt
    $lists = array_filter(glob(ROOT_DIR . LISTS_DIR . '/*'), function ($file) {
        return is_file($file) && preg_match('/\.(list|list-opkg|list-old)$/i', $file);
    });
    $baseLists = array_map(fn($file) => basename($file), $lists);

    $confs = array_filter(glob(ROOT_DIR . CONF_DIR . '/*'), function ($file) {
        return is_file($file) && preg_match('/\.(conf|conf-opkg|conf-old|apk-new)$/i', $file);
    });
    $baseConfs = array_map(fn($file) => basename($file), $confs);

    $result = array_merge($baseLists, $baseConfs);

    $logfile = ROOT_DIR . LOG_FILE;
    if (file_exists($logfile)) {
        array_push($result, basename($logfile));
    }

    $priority = [
        'nfqws2.conf' => -7,
        'nfqws.conf' => -7,
        'user.list' => -6,
        'exclude.list' => -5,
        'auto.list' => -4,
        'ipset.list' => -3,
        'ipset_exclude.list' => -2,
        'nfqws.log' => -1
    ];
    usort($result, fn($a, $b) => ($priority[$a] ?? 1) - ($priority[$b] ?? -1));

    return $result;
}

function getFileContent(string $filename): string
{
    if (preg_match('/\.(list|list-opkg|list-old)$/i', $filename)) {
        return file_get_contents(ROOT_DIR . LISTS_DIR . '/' . basename($filename));
    }
    return file_get_contents(ROOT_DIR . CONF_DIR . '/' . basename($filename));
}

function getLogContent(): string
{
    $file = file(ROOT_DIR . LOG_FILE);
    $file = array_reverse($file);
    return implode("", $file);
}

function saveFile(string $filename, string $content): bool
{
    $filename = basename($filename);
    if (preg_match('/\.(list|list-opkg|list-old)$/i', $filename)) {
        $file = ROOT_DIR . LISTS_DIR . '/' . $filename;
    } elseif (preg_match('/\.(log)$/i', $filename)) {
        $file = ROOT_DIR . LOG_FILE;
    } else {
        $file = ROOT_DIR . CONF_DIR . '/' . $filename;
    }
    return file_exists($file) && file_put_contents($file, normalizeString($content)) !== false;
}

function removeFile(string $filename): bool
{
    $filename = basename($filename);
    if (preg_match('/\.(list|list-opkg|list-old)$/i', $filename)) {
        $file = ROOT_DIR . LISTS_DIR . '/' . $filename;
    } else {
        $file = ROOT_DIR . CONF_DIR . '/' . $filename;
    }
    if (file_exists($file)) {
        return unlink($file);
    } else {
        return false;
    }
}

function nfqwsServiceStatus(): bool
{
    $output = null;
    exec(ROOT_DIR . "/etc/init.d/" . SCRIPT_NAME . " status", $output);
    return str_contains($output[0] ?? '', 'is running');
}

function nfqwsServiceAction(string $action): array
{
    $output = null;
    $retval = null;
    exec(ROOT_DIR . "/etc/init.d/" . SCRIPT_NAME . " $action", $output, $retval);
    return array('output' => $output, 'status' => $retval);
}

function nfqwsInstalledVersion(): string
{
    $output = null;
    if (NFQWS2) {
        exec("opkg status nfqws2-keenetic | awk -F': ' '/^Version:/ {print $2}'", $output);
    } else {
        exec("opkg status nfqws-keenetic | awk -F': ' '/^Version:/ {print $2}'", $output);
    }
    return $output[0] ?? '';
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
    $user = preg_grep("/^$username/", $users);

    if ($user) {
        list(, $passwdInDB) = explode(':', array_pop($user));
        if (empty($passwdInDB)) {
            return empty($password);
        }
        if (crypt($password, $passwdInDB) == $passwdInDB) {
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

    session_start();
    if (!isset($_SESSION['auth']) || !$_SESSION['auth']) {
        if ($_POST['cmd'] !== 'login' || !isset($_POST['user']) || !isset($_POST['password']) || !authenticate($_POST['user'], $_POST['password'])) {
            http_response_code(401);
            exit();
        } else {
            $_SESSION['auth'] = true;
        }
    }

    switch ($_POST['cmd']) {
        case 'status':
            $response = array('status' => 0, 'service' => nfqwsServiceStatus(), 'nfqws2' => NFQWS2, 'version' => nfqwsInstalledVersion());
            break;

        case 'filenames':
            $files = getFiles();
            $response = array('status' => 0, 'files' => $files);
            break;

        case 'filecontent':
            if (str_ends_with($_POST['filename'], '.log')) {
                $content = getLogContent();
            } else {
                $content = getFileContent($_POST['filename']);
            }
            $response = array('status' => 0, 'content' => $content, 'filename' => $_POST['filename']);
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
