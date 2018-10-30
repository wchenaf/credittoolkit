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

$sql = " SELECT * FROM creditdb WHERE";

//Using issuer to search for bonds by the same issuer as some firms might issue bonds under multiple companies  
if ($_POST['ISIN'] != "Undefined")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " issuer IN ( SELECT issuer FROM creditdb WHERE isin ='" . $_POST['ISIN'] . "')";

}
else if($_POST['firmName'] != "Undefined")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " issuer IN ( SELECT issuer FROM creditdb WHERE corpName ='" . $_POST['firmName'] . "')"; 

}
else if($_POST['ticker'] != "Undefined")
{
    $GLOBALS['sql'] = $GLOBALS['sql'] . " issuer IN ( SELECT issuer FROM creditdb WHERE ticker ='" . $_POST['ticker'] . "')";

}


$result = $conn->query($GLOBALS['sql']);

$phpresultsArray = array();
$regressionData = array();

while ($row = mysqli_fetch_array($result)){
    array_push($phpresultsArray, $row);
    
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

$returnedItem = array($phpresultsArray, $slope, $y);

$encoded = json_encode($returnedItem);
echo $encoded;

$conn->close();


/*
A previous version of the code that directly outputs HTML.

while($row = mysqli_fetch_array($result)) {
    echo "<tr>";
    echo "<th>" . $row['ticker'] . "</th>";
    echo "<th>" . $row['corpName'] . "</th>";
    echo "<th>" . $row['currency'] . "</th>";
    echo "<th>" . $row['midPrice'] . "</th>";
    echo "<th>" . $row['usdytw'] . "</th>";
    $years = round(floatval($row['ltwYrs']),2);
    echo "<th>" . $years . "</th>";
    echo "<th>" . $row['maturity'] . "</th>";
    echo "<th>" . $row['nxtCall'] . "</th>";
    $rating = round(floatval($row['avgRating']));
    echo "<th>" . $rating . "</th>";
    echo "<th>" . $row['ISIN'] . "</th>";
    echo "<th>" . $row['sector'] . "</th>";
    echo "<th>" . $row['subSector'] . "</th>";
    echo "<th>" . $row['sp'] . "</th>";
    echo "<th>" . $row['fitch'] . "</th>";
    echo "<th>" . $row['moodys'] . "</th>";
    echo "</tr>";
}
*/

?>

