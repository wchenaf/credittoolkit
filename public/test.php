<?php
require "../db/config.php";
require "../assets/regression/polynomial/PolynomialRegression.php";
$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, "https://dev.bondlinc.com/bondWeb/Api/login");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, "{\"lang\":\"en-US\",\"uid\":\"".$uid."\",\"pass\":\"".$pass."\"}");
curl_setopt($ch, CURLOPT_POST, 1);

$headers = array();
$headers[] = "Content-Type: application/x-www-form-urlencoded";
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

$result = curl_exec($ch);
if (curl_errno($ch)) {
    echo 'Error:' . curl_error($ch);
}
curl_close ($ch);

$decoded = json_decode($result);

$token = $decoded->data->auth_token;
echo '<h2>'.$token.'</h2>';


include('../vendor/rmccue/requests/library/Requests.php');
Requests::register_autoloader();
$headers = array();
$data = '{"lang":"en-US","uid":"eric","pass":"1111"}';
$response = Requests::post('https://dev.bondlinc.com/bondWeb/Api/login', $headers, $data);

$decoded = json_decode($response->body);
$token = $decoded->data->auth_token;
echo '<h2>'.$token.'</h2>';


?>