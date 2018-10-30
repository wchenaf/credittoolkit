<?php

require "../db/config-sql.php";
require "../common.php";
require "../assets/regression/polynomial/PolynomialRegression.php";

// Create connection
$conn = new mysqli($host, $username, $password, $dbname);
// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
} 

$sql = " SELECT * FROM creditdb WHERE 
        usdytw BETWEEN " . $_POST['yield_Low'] . " AND " . $_POST['yield_High']  . " AND " .
        " ltwYrs BETWEEN " . $_POST['tenor_Low'] . " AND " . $_POST['tenor_High'];

if ($_POST['unrated'] == "No")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " AND " . " avgRatingNumeric BETWEEN " . $_POST['rating_Low'] . " AND " . $_POST['rating_High'];
}
else if ($_POST['unrated'] == "Yes")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " AND " . " ((avgRatingNumeric BETWEEN " . $_POST['rating_Low'] . " AND " . $_POST['rating_High'] . " ) OR " . " avgRatingNumeric is NULL )";
}

if ($_POST['currencyPHP'] !== "Unspecified")
{
    $currency = $_POST['currencyPHP'];
    $GLOBALS['sql'] = $GLOBALS['sql'] . " AND " . " currency = '" . $currency . "'";
}

if ($_POST['callablePHP'] !== "Unspecified")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " AND " .
    " isCall= '" . $_POST['callablePHP'] . "'";
}

$result = $conn->query($GLOBALS['sql']);

$resultsArray = array();
$regressionData = array();

while ($row = mysqli_fetch_array($result)){
    array_push($resultsArray, $row);
    $tenor = log((float)$row["ltwYrs"]);
    $yield = (float)$row["usdytw"];
    array_push($regressionData, array($tenor, $yield) );
}

//Starting regression calculation.
// Precision digits in BC math. 
bcscale( 10 ); 

// Start a regression class 
$regression = new PolynomialRegression( 2 ); 

// Add all the data to the regression analysis. 
foreach ( $regressionData as $dataPoint ) {
    $regression->addData( $dataPoint[ 0 ], $dataPoint[ 1 ] ); 
}

// Get coefficients for the polynomial. 
$coefficients = $regression->getCoefficients(); 

//slope: $coefficients[ 1 ]
//y-intercept: $coefficients[ 0 ]
$slope = $coefficients[ 1 ];
$y = $coefficients[ 0 ];

$returnedItem = array($resultsArray, $slope, $y);
$encoded = json_encode($returnedItem);
echo $encoded;

$conn->close();



?>

