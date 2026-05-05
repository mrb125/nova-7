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

if ($action === 'get') {
    $name = $_GET['teamName'] ?? '';
    $stmt = $db->prepare('SELECT unlocked_up_to FROM unlocks WHERE team_name = ?');
    $stmt->execute([$name]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    json_response(['unlockedUpTo' => $row ? (int)$row['unlocked_up_to'] : 1]);
}

if ($action === 'set') {
    $name = $body['teamName'] ?? ''; $level = (int)($body['level'] ?? 1);
    $stmt = $db->prepare('INSERT OR REPLACE INTO unlocks (team_name, unlocked_up_to) VALUES (?, ?)');
    $stmt->execute([$name, $level]);
    json_response(['ok' => true]);
}

if ($action === 'all') {
    $rows = $db->query('SELECT * FROM unlocks')->fetchAll(PDO::FETCH_ASSOC);
    json_response($rows);
}

json_response(['error' => 'Unknown action'], 400);
