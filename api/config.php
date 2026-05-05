<?php
define('DB_FILE', __DIR__ . '/nova7.sqlite');
define('API_KEY', getenv('NOVA7_API_KEY') ?: 'nova7_dev_key');

function getDB(): PDO {
    $pdo = new PDO('sqlite:' . DB_FILE);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec("
        CREATE TABLE IF NOT EXISTS teams (
            team_name TEXT PRIMARY KEY,
            state_json TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS unlocks (
            team_name TEXT PRIMARY KEY,
            unlocked_up_to INTEGER NOT NULL DEFAULT 1
        );
        CREATE TABLE IF NOT EXISTS events (
            id TEXT PRIMARY KEY,
            event_json TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS credentials (
            team_name TEXT PRIMARY KEY,
            password TEXT NOT NULL,
            character_id TEXT NOT NULL,
            created_at INTEGER NOT NULL
        );
    ");
    return $pdo;
}

function checkApiKey(): void {
    $key = $_SERVER['HTTP_X_API_KEY'] ?? $_GET['api_key'] ?? '';
    if ($key !== API_KEY) {
        http_response_code(401);
        echo json_encode(['error' => 'Unauthorized']);
        exit;
    }
}

function json_response(mixed $data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json');
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Headers: Content-Type, X-Api-Key');
    echo json_encode($data);
    exit;
}
