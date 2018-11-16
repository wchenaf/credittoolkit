<?php

$dog='wow';
include('../vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = array(
    'client_id' => 'bondweb',
    'username' => 'api-user',
    'password' => 'bond123',
    'grant_type' => 'password'
);
$response = Requests::post('https://auth-dev.bondlinc.com:8443/auth/realms/test/protocol/openid-connect/token', $headers, $data);

$decoded = json_decode($response->body);
$token = $decoded->access_token;
$rftoken= $decoded->refresh_token;
