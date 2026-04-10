<?php
require_once 'config.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

checkApiKey();
$db = getDB();
$body = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $_GET['action'] ?? '';

if ($action === 'register') {
    $name = $body['teamName'] ?? ''; $pw = $body['password'] ?? ''; $char = $body['characterId'] ?? '';
    if (!$name || !$pw || !$char) json_response(['error' => 'Missing fields'], 400);
    $check = $db->prepare('SELECT 1 FROM credentials WHERE LOWER(team_name) = LOWER(?)');
    $check->execute([$name]);
    if ($check->fetch()) json_response(['ok' => false, 'error' => 'Name taken']);
    $stmt = $db->prepare('INSERT INTO credentials (team_name, password, character_id, created_at) VALUES (?, ?, ?, ?)');
    $stmt->execute([$name, password_hash($pw, PASSWORD_DEFAULT), $char, time()]);
    json_response(['ok' => true]);
}

if ($action === 'login') {
    $name = $body['teamName'] ?? ''; $pw = $body['password'] ?? '';
    $stmt = $db->prepare('SELECT * FROM credentials WHERE team_name = ?');
    $stmt->execute([$name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$row || !password_verify($pw, $row['password'])) json_response(['ok' => false]);
    json_response(['ok' => true, 'characterId' => $row['character_id']]);
}

if ($action === 'all') {
    $rows = $db->query('SELECT team_name, character_id, created_at FROM credentials')->fetchAll(PDO::FETCH_ASSOC);
    json_response($rows);
}

json_response(['error' => 'Unknown action'], 400);
