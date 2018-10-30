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
/*
$usdytwLOW = "0.95";
$usdytwHIGH = "1.5";
$ltwYrsLOW = "-3";
$ltwYrsHIGH = "+2";
$avgRatingNumericLOW = "-5";
$avgRatingNumericHIGH = "+0";

$sql = " SELECT * FROM creditdb WHERE";

if ($_POST['ISIN'] != "Undefined")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " usdytw BETWEEN ( SELECT (usdytw * " . $usdytwLOW . ") as usdytwLOW FROM creditdb WHERE ISIN = '" . $_POST['ISIN'] . "') AND ( SELECT (usdytw * " . $usdytwHIGH . ") as usdytwHIGH FROM creditdb WHERE ISIN = '" . $_POST['ISIN'] . "') ".
    "AND ltwYrs BETWEEN ( SELECT (ltwYrs " . $ltwYrsLOW . ") as ltwYrsLOW FROM creditdb WHERE ISIN = '" . $_POST['ISIN'] . "') AND ( SELECT (ltwYrs " . $ltwYrsHIGH . ") as ltwYrsHIGH FROM creditdb WHERE ISIN = '" . $_POST['ISIN'] . "') ".
    "AND avgRatingNumeric BETWEEN ( SELECT (avgRatingNumeric " . $avgRatingLOW . ") as avgRatingLOW FROM creditdb WHERE ISIN = '" . $_POST['ISIN'] . "') AND ( SELECT (avgRatingNumeric " . $avgRatingHIGH . ") as avgRatingHIGH FROM creditdb WHERE ISIN = '" . $_POST['ISIN'] . "') ";
}
elseif($_POST['ticker'] != "Undefined")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " usdytw BETWEEN ( SELECT (usdytw * " . $usdytwLOW . ") as usdytwLOW FROM creditdb WHERE ticker = '" . $_POST['ticker'] . "') AND ( SELECT (usdytw * " . $usdytwHIGH . ") as usdytwHIGH FROM creditdb WHERE ticker = '" . $_POST['ticker'] . "') ".
    "AND ltwYrs BETWEEN ( SELECT (ltwYrs " . $ltwYrsLOW . ") as ltwYrsLOW FROM creditdb WHERE ticker = '" . $_POST['ticker'] . "') AND ( SELECT (ltwYrs " . $ltwYrsHIGH . ") as ltwYrsHIGH FROM creditdb WHERE ticker = '" . $_POST['ticker'] . "') ".
    "AND avgRatingNumeric BETWEEN ( SELECT (avgRatingNumeric " . $avgRatingLOW . ") as avgRatingLOW FROM creditdb WHERE ticker = '" . $_POST['ticker'] . "') AND ( SELECT (avgRatingNumeric " . $avgRatingHIGH . ") as avgRatingHIGH FROM creditdb WHERE ticker = '" . $_POST['ticker'] . "') ";
}
*/

$sql = " SELECT * FROM creditdb WHERE";

$GLOBALS['sql'] = $GLOBALS['sql'] . " (usdytw BETWEEN " . $_POST['yield_Low'] . " AND " . $_POST['yield_High']  . 
                ") AND " . " (ltwYrs BETWEEN " . $_POST['tenor_Low'] . " AND " . $_POST['tenor_High'] .
                ") AND " . " (avgRatingNumeric BETWEEN " . $_POST['rating_High'] . " AND " . $_POST['rating_Low'] .")";

$result = $conn->query($GLOBALS['sql']);

$phpresultsArray = array();
$regressionData = array();

while ($row = mysqli_fetch_array($result)){
    array_push($phpresultsArray, $row);
    
    $tenor = log((float)$row["ltwYrs"]);
    $yield = (float)$row["usdytw"];
    //array_push($regressionData, array($tenor, $yield) );
}

$globalResult = $conn->query("SELECT * FROM creditdb");
while ($globalRow = mysqli_fetch_array($globalResult)){
    $tenor = log((float)$globalRow["ltwYrs"]);
    $yield = (float)$globalRow["usdytw"];
    array_push($regressionData, array($tenor, $yield) );
}

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

$returnedItem = array($phpresultsArray, $slope, $y);

$encoded = json_encode($returnedItem);
echo $encoded;

$conn->close();

?>

