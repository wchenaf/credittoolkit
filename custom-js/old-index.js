var yieldLow;
var yieldHigh;
var tenorLow;
var tenorHigh;
var ratingLow;
var ratingHigh;
var currency;
var callable;
var unrated;
var chartDrawCount = 0;
var resultsArray = new Array;
var dataPointArray = new Array;
var tickerArray = new Array;
var regressionArray = new Array;

function getInputParameters()
{
    var yieldSlider = $("#yieldSlider").data("ionRangeSlider");
    // Get values
    yieldLow = yieldSlider.result.from;
    yieldLow /= 100;
    yieldHigh = yieldSlider.result.to;
    if (yieldHigh == 20)
    {
        yieldHigh = 100;
    }
    yieldHigh /= 100;

    var tenorSlider = $("#tenorSlider").data("ionRangeSlider");
    // Get values
    tenorLow = tenorSlider.result.from;
    tenorHigh = tenorSlider.result.to;
    if (tenorHigh == 30)
    {
        tenorHigh = 200;
    }

    var ratingSlider = $("#ratingSlider").data("ionRangeSlider");
    // Get values
    ratingLow = ratingSlider.result.from;
    ratingHigh = ratingSlider.result.to;

    currency = $("#currency").val();
    callable = $("#callable").val();
    unrated = $("#unrated").val();
    console.log("unrated = " + unrated);
    if (callable == "Yes")
    {
        callable = "Y";
    }
    else if (callable == "No")
    {
        callable = "N";
    }

    console.log("currency = " + currency);
    console.log("callable = " + callable);
    console.log("yieldLow = " + yieldLow);
    console.log("yieldHigh = " + yieldHigh);
    console.log("tenorLow = " + tenorLow);
    console.log("tenorHigh = " + tenorHigh);
    console.log("ratingLow = " + ratingLow);
    console.log("ratingHigh = " + ratingHigh);
}

function searchBonds() {
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var table = $('#resultsTable').DataTable();
            table.clear();
            
            var response = $.parseJSON(this.responseText);
            var results = response[0];
            //Load the slope and y-intercept varialbes
            var slope = undefined;
            var yIntercept = undefined;
            //Extract the regression slope and y-intercept from the incoming JSON from server
            slope = parseFloat(response[1])*100;
            yIntercept = parseFloat(response[2])*100;

            //If search has occurred in the same session, clear arrays for new data
            if (chartDrawCount > 0)
            {
                dataPointArray = [];
                resultsArray = [];
                tickerArray = [];
            }

            var maxTenor = 0.0;

            for (var i = 0; i < results.length; i++)
            {
                var temp = ([
                    results[i][4],
                    results[i][5],
                    results[i][6],
                    parseFloat(results[i][9]).toFixed(2),
                    parseFloat(results[i][10]*100).toFixed(2),
                    parseFloat(results[i][12]).toFixed(2),
                    results[i][13],
                    results[i][14],
                    results[i][24],
                    results[i][3],
                    results[i][29],
                    results[i][30],
                    results[i][19],
                    results[i][20],
                    results[i][18]
                    ]);

                if (parseFloat(results[i][12]) > maxTenor)
                {
                    maxTenor = parseFloat(results[i][12]).toFixed(4);
                }

                resultsArray.push(temp);
                var dataPoint;
                dataPoint = {x: parseFloat(results[i][12]).toFixed(2), y:parseFloat(results[i][10]*100).toFixed(2)};
                dataPointArray.push(dataPoint);
                tickerArray.push(results[i][4]);
            }

            //Calculate datapoints for regression array by calculating a data point per every 0.1 in tenor, then pushing results into regressionArray
            regressionArray = [];
            if (slope == 0 && yIntercept == 0)
            {
                $('body').pgNotification({
                    style: 'simple',
                    message: "Failed to load regression.",
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "danger"
                }).show();
            }
            for(var i = 1; i < maxTenor*10; i++)
            {
                var yValue =  slope * Math.log(i/10) + yIntercept;
                var regressionPoint = {x: (i/10).toFixed(4), y: yValue.toFixed(4)};
                regressionArray.push(regressionPoint);
            }

            if(resultsArray.length == 0)
            {
                $('body').pgNotification({
                    style: 'flip',
                    message: "No bonds match search criteria",
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "danger"
                }).show();
            }
            else
            {
                $('body').pgNotification({
                    style: 'simple',
                    message: "Loaded " + resultsArray.length + " results.",
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "success"
                }).show();
            }

            table.rows.add(resultsArray).draw();
            console.log("loaded new data");
            table.columns.adjust();
            table.responsive.recalc();
            document.getElementById('progressCircle').style.visibility = "hidden";
            document.getElementById('progressCircle2').style.visibility = "hidden";
            
            //Draw Yield map
            renderCharts();
            chartDrawCount++;
            rankRolldown(slope, yIntercept);
        }
    };
    
    xmlhttp.open("POST","../db/getResults-screener.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("currencyPHP="+encodeURIComponent(currency)+"&callablePHP="+encodeURIComponent(callable)+"&yield_Low="+encodeURIComponent(yieldLow)+"&yield_High="+encodeURIComponent(yieldHigh)+"&tenor_Low="+encodeURIComponent(tenorLow)+"&tenor_High="+encodeURIComponent(tenorHigh)+"&rating_Low="+encodeURIComponent(ratingLow)+"&rating_High="+encodeURIComponent(ratingHigh)+"&unrated="+encodeURIComponent(unrated));
    
}

function rankRolldown(slope, yIntercept, criteria)
{
    function theoreticalRolldown(x)
    {   
        if (x-1 < 0)
        {
            return 0;
        }
        else
        {
            var y = (x-1 <= 0 ? 0 : slope*Math.log(x-1) + yIntercept);
            return y;
        }
    }

    var rolldownRankArray = new Array;

    for (var i = 0; i < resultsArray.length; i++)
    {
        
        var rolldown = ((theoreticalRolldown(resultsArray[i][5]) - resultsArray[i][4])*100);
        var temp = [i, rolldown];
        rolldownRankArray.push(temp);
        //console.log("rolldown " + rolldown + " = yvalue (" + resultsArray[i][3] + ") - theoretical y (" + theoreticalRolldown(resultsArray[i][4]) + ")")
    }
    
    rolldownRankArray.sort(sortFunction);
    //console.log(rolldownRankArray);

    function sortFunction(a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] < b[1]) ? -1 : 1;
        }
    }

    //Display resuls in one-year rolldown rank table
    var table = $('#rankTable').DataTable();
    table.clear();
    var rolldownRankTable = new Array;
    for (var i = 0; i < rolldownRankArray.length; i++)
    {
        var temp = [resultsArray[rolldownRankArray[i][0]][0], Math.round(parseFloat(rolldownRankArray[i][1]))];
        rolldownRankTable.push(temp);
    }
    //$("#rankTableData").html(rolldownRankTableHTML);
    table.rows.add(rolldownRankTable).draw();
    table.responsive.recalc();
    table.columns.adjust();
    table.draw();
    rolldownRankTable = [];
        
    rolldownRankArray = [];
}

function renderCharts()
{
    console.log("started render charts");
    ctx = document.getElementById("YieldMap").getContext('2d');
    if (chartDrawCount > 0)
    {
        YieldMap.destroy();
        YieldMap = undefined;
    }
    YieldMap = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tickerArray,
            datasets: [{
                label: "Search Results",
                data: dataPointArray,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                radius: 3,
                showLine: false
            },
            {
                type: 'line',
                label: "Regression",
                data: regressionArray,
                backgroundColor: ["rgba(76,78,80, .7)"],
                lineTension: 0,
                fill: false,
                pointRadius: 0,
                pointHitRadius: 0,
                pointHoverRadius: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                xAxes: [{
                    type: 'linear',
                    position: 'bottom',
                    scaleLabel: {
                        display: true,
                        labelString: 'Tenor (Years)'
                    }
                }],
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: 'Yield (%)'
                    }
                }]
            },
            tooltips: {
                callbacks: {
                   label: function(tooltipItem, data) {
                      var label = data.labels[tooltipItem.index];
                      return label + ': (Tenor: ' + tooltipItem.xLabel + ' yrs, Yield: ' + tooltipItem.yLabel + '%)';
                   }
                }
             }
        }
    });
    YieldMap.update();
}

function displayClickPointData(index)
{
    var displayticker = resultsArray[index][0];
    var currency = resultsArray[index][2];
    var price = resultsArray[index][3];
    var yieldtoMaturity = resultsArray[index][4];
    var tenor = resultsArray[index][5];
    var maturity = resultsArray[index][6];
    var callDate = resultsArray[index][7];
    var avgRating = resultsArray[index][8];
    var ISIN = resultsArray[index][9];
    var sector = resultsArray[index][10];
    $("#chartTicker").html("<span class='semi-bold'>Ticker: </span>"+displayticker);
    $("#chartCurrency").html("<span class='semi-bold'>Currency: </span>"+currency);
    $("#chartPrice").html("<span class='semi-bold'>Price: </span>"+price);
    $("#chartYield").html("<span class='semi-bold'>Yield: </span>"+yieldtoMaturity);
    $("#chartTenor").html("<span class='semi-bold'>Tenor: </span>"+tenor);
    $("#chartMaturity").html("<span class='semi-bold'>Maturity: </span>"+maturity);
    $("#chartCallDate").html("<span class='semi-bold'>Call Date: </span>"+callDate);
    $("#chartAverageRating").html("<span class='semi-bold'>Average Rating: </span>"+avgRating);
    $("#chartISIN").html("<span class='semi-bold'>ISIN: </span>"+ISIN);
    $("#chartSector").html("<span class='semi-bold'>Sector: </span>"+sector);
}

$(document).ready(function(){
    console.log("started index.js");
    document.getElementById('progressCircle').style.visibility = "visible";
    document.getElementById('progressCircle2').style.visibility = "visible";
    getInputParameters();
    searchBonds();

    document.getElementById('submit_button').onclick = function() {
        document.getElementById('progressCircle').style.visibility = "visible";
        document.getElementById('progressCircle2').style.visibility = "visible";
        
        var table = $('#resultsTable').DataTable();
        table.clear();
        table.draw();
        getInputParameters();
        searchBonds();
    }

    document.getElementById('reset_button').onclick = function() {
        location.reload();
    }

    //Function to highlight in the same issuer yield map the bond selected in rolldown table. Also populates side menu.
    var rankTable = $('#rankTable').DataTable();
    var clickedIndex = undefined;
    $('#rankTable tbody').on( 'click', 'tr', function () {
        if(clickedIndex != undefined)
        {
            let meta = YieldMap.getDatasetMeta(0);
            let point = meta.data[clickedIndex];
            point.custom = point.custom || {};
            point.custom.backgroundColor = "rgba(54, 162, 235, 0.2)";
            point.custom.borderColor = 'rgba(54, 162, 235, 1)';

            clickedIndex = undefined;
        }
        var rowData = rankTable.row( this ).data();
        var clickedTicker = rowData[0];
        clickedIndex = tickerArray.indexOf(clickedTicker);
        //Get point object and change the radius/color
        let meta = YieldMap.getDatasetMeta(0);
        let point = meta.data[clickedIndex];
        point.custom = point.custom || {};
        point.custom.backgroundColor = "rgba(226, 0, 15, 0.5)";
        point.custom.borderColor = "rgba(226, 0, 15, 1)";
        YieldMap.update(0);
        displayClickPointData(clickedIndex);
    } );
    //Function to highlight in the same issuer yield map the bond clicked on the graph. Also populates side menu.
    var canvas = document.getElementById("YieldMap");
    canvas.onclick = function (evt) {
        if(clickedIndex != undefined)
        {
            let meta = YieldMap.getDatasetMeta(0);
            let point = meta.data[clickedIndex];
            point.custom = point.custom || {};
            point.custom.backgroundColor = "rgba(54, 162, 235, 0.2)";
            point.custom.borderColor = 'rgba(54, 162, 235, 1)';

            clickedIndex = undefined;
        }
        var activePoints = YieldMap.getElementsAtEvent(evt);
        if (activePoints !== undefined)
        {
            var clickedLabel = YieldMap.data.labels[activePoints[0]._index];
           
            let meta = YieldMap.getDatasetMeta(0);
            let point = meta.data[activePoints[0]._index];
            point.custom = point.custom || {};
            point.custom.backgroundColor = "rgba(226, 0, 15, 0.5)";
            point.custom.borderColor = "rgba(226, 0, 15, 1)";
            clickedIndex = activePoints[0]._index;
            YieldMap.update(0);

            displayClickPointData(activePoints[0]._index);
        }
    };
});