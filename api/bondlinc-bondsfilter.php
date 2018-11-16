<?php
require "../api/bondlinc-auth.php";

error_reporting(0);

header("Content-Type: application/json; charset=UTF-8");
$obj = $_POST["x"];

Requests::register_autoloader();
$headers = array(
    'Content-Type' => 'application/json',
    'Accept' => 'application/json',
    'X-XSRF-TOKEN' => '',
    'Authorization' => 'Bearer'. $token
);
$data = '{ 
    "termQueryMap": { 
        "industrySector.keyword": [ "Financial" ], 
        "bondRelation.currency.currencyCode.keyword": [ "SGD" ] 
    }, 
    "rangeQueryMap":{ 
        "finalMaturityDate": { 
            "gte":"2001-07-10", 
            "lte":"2050-10-20", 
            "format": "yyyy-MM-dd" 
        }, 
        "bondRelation.bondPrice.midPriceClean": { 
            "gte":"0", 
            "lte":"200" 
        } 
    } 
}';

$url ='https://dev2.bondlinc.com/api/bond-with-prices/_search';
$url.='?query=';
$url.='';
$url.='&minDocuments=';
$url.='0';
$url.='&minProspectuses=';
$url.='0';
$url.='&getDocumentInfo=';
$url.='true';

$data = $obj;
$response = Requests::post($url, $headers, $data);

echo json_encode($response);



?>