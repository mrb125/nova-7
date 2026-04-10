<?php
require_once 'config.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

checkApiKey();
$db = getDB();
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

if ($method === 'POST' && $action === 'save') {
    $body = json_decode(file_get_contents('php://input'), true);
    $teamName = $body['teamName'] ?? '';
    if (!$teamName) json_response(['error' => 'Missing teamName'], 400);
    $stmt = $db->prepare('INSERT OR REPLACE INTO teams (team_name, state_json, updated_at) VALUES (?, ?, ?)');
    $stmt->execute([$teamName, json_encode($body), time()]);
    json_response(['ok' => true]);
}

if ($method === 'GET' && $action === 'load') {
    $teamName = $_GET['teamName'] ?? '';
    if (!$teamName) json_response(['error' => 'Missing teamName'], 400);
    $stmt = $db->prepare('SELECT state_json FROM teams WHERE team_name = ?');
    $stmt->execute([$teamName]);
    $row = $stmt->fetch(PDO::FETCH_ASSOC);
    json_response($row ? json_decode($row['state_json']) : null);
}

if ($method === 'GET' && $action === 'all') {
    $stmt = $db->query('SELECT state_json FROM teams ORDER BY updated_at DESC');
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    $teams = [];
    foreach ($rows as $row) {
        $t = json_decode($row['state_json'], true);
        $teams[$t['teamName']] = $t;
    }
    json_response($teams);
}

json_response(['error' => 'Unknown action'], 400);
