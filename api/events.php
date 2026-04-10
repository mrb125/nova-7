<?php
require_once 'config.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

checkApiKey();
$db = getDB();
$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'push') {
    $body = json_decode(file_get_contents('php://input'), true);
    $id = 'evt_' . time() . '_' . bin2hex(random_bytes(3));
    $body['id'] = $id; $body['timestamp'] = time() * 1000;
    $stmt = $db->prepare('INSERT INTO events (id, event_json, created_at) VALUES (?, ?, ?)');
    $stmt->execute([$id, json_encode($body), time()]);
    // Keep only last 30 events
    $db->exec("DELETE FROM events WHERE id NOT IN (SELECT id FROM events ORDER BY created_at DESC LIMIT 30)");
    json_response(['ok' => true, 'event' => $body]);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET' && $action === 'get') {
    $rows = $db->query('SELECT event_json FROM events ORDER BY created_at DESC LIMIT 30')->fetchAll(PDO::FETCH_ASSOC);
    json_response(array_map(fn($r) => json_decode($r['event_json']), $rows));
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'clear') {
    $db->exec('DELETE FROM events');
    json_response(['ok' => true]);
}

json_response(['error' => 'Unknown action'], 400);
