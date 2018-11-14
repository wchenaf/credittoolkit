<?php
error_reporting(0);
require "../db/bondlinc-auth.php";

Requests::register_autoloader();
$headers = array(
    'Accept' => 'application/json',
    'X-XSRF-TOKEN' => '',
    'Authorization' => 'Bearer'. $token
);

$url ='https://dev2.bondlinc.com/bondweb/api/bond-with-prices';
$url.='?isin.equals=';
$url.='SGXF11720293';
$url.='&getDocumentInfo=';
$url.='true';

$response = Requests::get($url, $headers);

$result = json_encode($response);
echo $result;

// $decoded = json_decode($response->body);
// $bondData = $decoded->data;
// echo '<p>'.$bondData.'</p>';
// echo '<p>'.serialize($bondData).'</p>';

?>



