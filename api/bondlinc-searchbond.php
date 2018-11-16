<?php
error_reporting(0);
require "../api/bondlinc-auth.php";

Requests::register_autoloader();
$headers = array(
    'Accept' => 'application/json',
    'X-XSRF-TOKEN' => '',
    'Authorization' => 'Bearer'. $token
);

$url ='https://dev2.bondlinc.com/api/bond-with-prices';
$url.='?isin.equals=';
$url.='SGXF11720293';
$url.='&getDocumentInfo=';
$url.='true';

$response = Requests::get($url, $headers);

echo json_encode($response);


?>



