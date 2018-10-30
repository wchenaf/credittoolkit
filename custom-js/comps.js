$(document).ready(function(){
    document.getElementById('progressCircle').style.visibility = "hidden";
    $("#progressCircle2").hide();
    $("#sameFirmGraphDiv").hide();
    $("#compFirmGraphDiv").hide();
    $("#compFirmResultsTable").hide();
    document.getElementById('compsProgressCircle').style.visibility = "hidden";
    $("#progressCircle3").hide();

    $("#searchParameter").on('select2:select', function (e) {
        getSearchParameters();
        console.log("changed search parameter");
      });

    //Detect custom comp search
    $("#customCompSearch").click(function()
    {
        document.getElementById('compsProgressCircle').style.visibility = "visible";
        $("#progressCircle3").show();
        getComps(); 
    });

    //Updates UI (ISIN,Company Name, Ticker) if user makes a new selection.
    document.getElementById('searchCriteria').onchange =function() 
    {
        checkSearchCriteria();
    };
    
    $('body').pgNotification({
        style: 'flip',
        message: "Please input ISIN or company name, followed by enter.",
        position: $('.tab-pane.active .position.active').attr('data-placement'),
        timeout: 4000,
        type: "warning"
    }).show();

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
        displayClickPointData(clickedIndex, "same firm");
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

            displayClickPointData(activePoints[0]._index,"same firm");
        }
    };

    //Function to highlight in the comps yield map the bond selected in rolldown table. Also populates side menu.
    var compClickedIndex = undefined;
    
    var compRankTable = $('#compsRankTable').DataTable();
    
    $('#compsRankTable tbody').on( 'click', 'tr', function () {
        if(compClickedIndex != undefined)
        {
            let meta = compYieldMap.getDatasetMeta(0);
            let point = meta.data[compClickedIndex];
            point.custom = point.custom || {};
            point.custom.backgroundColor = 'rgba(69, 201, 4, 0.2)';
            point.custom.borderColor = 'rgba(69, 201, 4, 1)';

            compClickedIndex = undefined;
        }
        var rowData = compRankTable.row( this ).data();
        var clickedTicker = rowData[0];
        compClickedIndex = compsTickerArray.indexOf(clickedTicker); 
        //Get point object and change the radius/color
        let meta = compYieldMap.getDatasetMeta(0); 
        let point = meta.data[compClickedIndex];
        point.custom = point.custom || {};
        point.custom.backgroundColor = "rgba(226, 0, 15, 0.5)";
        point.custom.borderColor = "rgba(226, 0, 15, 1)";
        compYieldMap.update(0);
        displayClickPointData(compClickedIndex, "comps");
    } );
    
    //Function to highlight in the comps yield map the bond clicked on the graph. Also populates side menu.
    var compCanvas = document.getElementById("compYieldMap");
    compCanvas.onclick = function (evt) {
        if(compClickedIndex != undefined)
        {
            let meta = compYieldMap.getDatasetMeta(0);
            let point = meta.data[compClickedIndex];
            point.custom = point.custom || {};
            point.custom.backgroundColor = 'rgba(69, 201, 4, 0.2)';
            point.custom.borderColor = 'rgba(69, 201, 4, 1)';

            compClickedIndex = undefined;
        }
        var compActivePoints = compYieldMap.getElementsAtEvent(evt);
        if (compActivePoints !== undefined)
        {
            var clickedLabel = compYieldMap.data.labels[compActivePoints[0]._index];
           
            let meta = compYieldMap.getDatasetMeta(0);
            let point = meta.data[compActivePoints[0]._index];
            point.custom = point.custom || {};
            point.custom.backgroundColor = "rgba(226, 0, 15, 0.5)";
            point.custom.borderColor = "rgba(226, 0, 15, 1)";
            compClickedIndex = compActivePoints[0]._index;
            compYieldMap.update(0);

            displayClickPointData(compActivePoints[0]._index, "comps");
        }
    };

});

var companyName;
var noOfResults;
var dataPointArray = new Array;
var tickerArray = new Array;
var resultsArray = new Array;
var regressionArray = new Array;
var ctx;
var YieldMap;
var compYieldMap;
var chartDrawCount = 0;
var compChartDrawCount=0;

var compsDataPointArray = new Array;
var compsResultsArray = new Array;
var compsTickerArray = new Array;
var compsRegressionArray = new Array;
var compnoOfResults;


function displayClickPointData(index, criteria)
{
    if (criteria == "same firm")
    {
        var displayticker = resultsArray[index][0];
        var currency = resultsArray[index][1];
        var price = resultsArray[index][2];
        var yieldtoMaturity = resultsArray[index][3];
        var tenor = resultsArray[index][4];
        var maturity = resultsArray[index][5];
        var callDate = resultsArray[index][6];
        var avgRating = resultsArray[index][7];
        var ISIN = resultsArray[index][8];
        var sector = resultsArray[index][9];
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
    else
    {        
        var displayticker = compsResultsArray[index][0];
        var currency = compsResultsArray[index][1];
        var price = compsResultsArray[index][2];
        var yieldtoMaturity = compsResultsArray[index][3];
        var tenor = compsResultsArray[index][4];
        var maturity = compsResultsArray[index][5];
        var callDate = compsResultsArray[index][6];
        var avgRating = compsResultsArray[index][7];
        var ISIN = compsResultsArray[index][8];
        var sector = compsResultsArray[index][9];
        $("#compchartTicker").html("<span class='semi-bold'>Ticker: </span>"+displayticker);
        $("#compchartCurrency").html("<span class='semi-bold'>Currency: </span>"+currency);
        $("#compchartPrice").html("<span class='semi-bold'>Price: </span>"+price);
        $("#compchartYield").html("<span class='semi-bold'>Yield: </span>"+yieldtoMaturity);
        $("#compchartTenor").html("<span class='semi-bold'>Tenor: </span>"+tenor);
        $("#compchartMaturity").html("<span class='semi-bold'>Maturity: </span>"+maturity);
        $("#compchartCallDate").html("<span class='semi-bold'>Call Date: </span>"+callDate);
        $("#compchartAverageRating").html("<span class='semi-bold'>Average Rating: </span>"+avgRating);
        $("#compchartISIN").html("<span class='semi-bold'>ISIN: </span>"+ISIN);
        $("#compchartSector").html("<span class='semi-bold'>Sector: </span>"+sector);
    }
    
}

function checkSearchCriteria()
{
    var searchCriteria = $("#searchCriteria").val();
    if (searchCriteria == "ISIN")
    {
        $("#parameterLabel").html("ISIN");
        $('#searchParameter').attr("placeholder","Please input ISIN");
    }
    else if (searchCriteria == "Company")
    {
        $("#parameterLabel").html("Company Name");
        $('#searchParameter').attr("placeholder","Please input Company Name");
    }
    else
    {
        $("#parameterLabel").html("Ticker");
        $('#searchParameter').attr("placeholder","Please input ticker");
    }
}

function getSearchParameters()
{
    //console.log("started getSearchParameters");
    var ISIN = "Undefined";
    var firmName = "Undefined";
    var ticker = "Undefined";
    if ($("#searchCriteria").val() == "ISIN")
    {
        var ISIN = $("#searchParameter").val();
        $("#sameFirmGraphDiv").show();
        $("#compFirmGraphDiv").show();
        $("#compFirmResultsTable").show();
    }
    else if ($("#searchCriteria").val() == "Company")
    {
        var firmName = $("#searchParameter").val();
        $("#sameFirmGraphDiv").show();
        $("#compFirmGraphDiv").hide();
        $("#compFirmResultsTable").hide();
    }
    else
    {
        var ticker = $("#searchParameter").val();
        $("#sameFirmGraphDiv").show();
        $("#compFirmGraphDiv").show();
        $("#compFirmResultsTable").show();
    }
    //console.log("ISIN = " + ISIN);
    //console.log("firmName = " + firmName);

    searchBonds(ISIN, firmName, ticker);

}

function renderCharts()
{
    $("#sameIssuerMapTitle").html(companyName);
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
                label: companyName,
                data: dataPointArray,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.2)'
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)'
                ],
                borderWidth: 1,
                radius: 10,
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

function renderCompCharts()
{
    $("#sameIssuerMapTitle").html(companyName);
    ctx = document.getElementById("compYieldMap").getContext('2d');
    if (compChartDrawCount > 0)
    {
        compYieldMap.destroy();
        compYieldMap = undefined;
    }
    compYieldMap = new Chart(ctx, {
        type: 'line',
        data: {
            labels: compsTickerArray,
            datasets: [{
                label: "Comparables",
                data: compsDataPointArray,
                backgroundColor: [
                    'rgba(69, 201, 4, 0.2)'
                ],
                borderColor: [
                    'rgba(69, 201, 4, 1)'
                ],
                borderWidth: 1,
                radius: 5,
                showLine: false
            },
            {
                type: 'line',
                label: "Regression",
                data: compsRegressionArray,
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
    compYieldMap.update();
}

function showData()
{
    $("#information").html("Issuing Company");
    $("#company").html(companyName);
    $("#noOfResults").html(noOfResults + " matches");
}

function searchBonds(ISIN, firmName, ticker) {
    tickerArray = [];
    document.getElementById('progressCircle').style.visibility = "visible";
    $("#progressCircle2").show();
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            dataPointArray=[];
            resultsArray = [];
            var table = $('#resultsTable').DataTable();
            table.clear();
            
            var encoded = $.parseJSON(this.responseText);
            var results = encoded[0];
            //Load the slope and y-intercept varialbes
            var slope = undefined;
            var yIntercept = undefined;

            //Extract the regression slope and y-intercept from the incoming JSON from server
            slope = parseFloat(encoded[1])*100;
            yIntercept = parseFloat(encoded[2])*100;
            
            //Push query results into the array resultsArray
            //Keep track of the maximum tenor to determine limit to rendering regression line
            var maxTenor = 0.0;
            for (var i = 0; i < results.length; i++)
            {
                var temp = ([
                    results[i][4],                              //ticker
                    results[i][6],                              //currency
                    parseFloat(results[i][9]).toFixed(2),       //price
                    parseFloat(results[i][10]*100).toFixed(2),  //yield
                    parseFloat(results[i][12]).toFixed(2),      //tenor
                    results[i][13],                             //maturity
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
                //Prepare data for scatter plot
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

            //Use regression formula to calculate one-year rolldown for all the data points
            rankRolldown(slope, yIntercept, "same firm");

            //Variables used as reference for comparables calculations.
            var referenceYield;
            var referenceTenor;
            var referenceRating;

            //Display the results of the query in UI side panels + show relevant notifications
            if(resultsArray.length == 0)
            {
                var notificationMessage;
                if ($("#searchCriteria").val() == "ISIN")
                {
                    notificationMessage = "ISIN: " + $("#searchParameter").val();
                    
                }
                else if ($("#searchCriteria").val() == "Company")
                {
                    notificationMessage = "Company Name: " + $("#searchParameter").val(); 
                    
                }
                else
                {
                    notificationMessage = "Ticker: " + $("#searchParameter").val(); 
                }
                $('body').pgNotification({
                    style: 'simple',
                    message: "No bonds match search criteria " + notificationMessage,
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "danger"
                }).show();

                noOfResults = 0;
            }
            else
            {
                companyName = results[0][5];
                noOfResults = resultsArray.length;

                if ($("#searchCriteria").val() == "ISIN" || $("#searchCriteria").val() == "Ticker")
                {
                    $("#information").html("Issue Information <i class='fa fa-chevron-right'></i>");
                    //console.log(resultsArray);
                    var count;
                    for (var i = 0; i < resultsArray.length; i++)
                    {
                        if (resultsArray[i][8] == $("#searchParameter").val() || resultsArray[i][0] == $("#searchParameter").val())
                        {
                            count = i;
                            break;
                        }
                    }
                    $("#company").html("<p style='color:white;font-size: 17px !important;'>Ticker: "+resultsArray[count][0]+"</p>"+"<p style='color:white;font-size: 17px !important;'>"+"Yield: "+resultsArray[count][3]+"</p>"+"<p style='color:white;font-size: 17px !important;'>Tenor: "+resultsArray[count][4]+"</p>");
                    $("#noOfResults").html(companyName+"<br>"+noOfResults + " matches");
                    //Load information for comps reference bond
                    $("#compReferenceTicker").html(resultsArray[count][0]);
                    $("#compReferenceCurrency").html(resultsArray[count][1]);
                    $("#compReferencePrice").html(resultsArray[count][2]);
                    $("#compReferenceYield").html(resultsArray[count][3]);
                    $("#compReferenceTenor").html(resultsArray[count][4]);
                    $("#compReferenceMaturity").html(resultsArray[count][5]);
                    $("#compReferenceCallDate").html(resultsArray[count][6]);
                    $("#compReferenceAverageRating").html(resultsArray[count][7]);
                    $("#compReferenceISIN").html(resultsArray[count][8]);
                    $("#compReferenceSector").html(resultsArray[count][9]);
                    referenceYield = parseFloat(resultsArray[count][3]);
                    referenceTenor = parseFloat(resultsArray[count][4]);
                    referenceRating = parseFloat(results[count][25]);
                }
                else
                {
                    //Show data in side panel
                    showData();
                }
                $('body').pgNotification({
                    style: 'simple',
                    message: resultsArray.length + " results found for " + $("#searchCriteria").val() + ": " +$("#searchParameter").val(),
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "success"
                }).show();
                $("#sameIssuerTableTitle").html("Bonds by Same Issuer - " + resultsArray.length + " results");
            }
            

            //Draw datatable
            table.rows.add(resultsArray).draw();
            console.log("loaded new data");
            table.responsive.recalc();
            table.columns.adjust();
            table.draw();
            //document.getElementById('progressCircle').style.visibility = "hidden";


            //Render yield map chart
            renderCharts();
            chartDrawCount++;
            document.getElementById('progressCircle').style.visibility = "hidden";
            $("#progressCircle2").hide();

            //Start comparables data fetch if searching by ISIN or ticker.

            if ($("#searchCriteria").val() == "ISIN" || $("#searchCriteria").val() == "Ticker")
            {
                //Set comp search variables in front end
                setCompSearchParameters(referenceYield, referenceTenor, referenceRating);
                getComps(ISIN, firmName, ticker);
            }
        }
    };
    
    xmlhttp.open("POST","../db/getSameFirmResults-comps.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("ISIN="+encodeURIComponent(ISIN)+"&firmName="+encodeURIComponent(firmName)+"&ticker="+encodeURIComponent(ticker)); 
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

    if (criteria == "same firm")
    {
        for (var i = 0; i < resultsArray.length; i++)
        {
           
            var rolldown = ((theoreticalRolldown(resultsArray[i][4]) - resultsArray[i][3])*100);
            var temp = [i, rolldown];
            rolldownRankArray.push(temp);
            //console.log("rolldown " + rolldown + " = yvalue (" + resultsArray[i][3] + ") - theoretical y (" + theoreticalRolldown(resultsArray[i][4]) + ")")
        }
    }
    else
    {
        for (var i = 0; i < compsResultsArray.length; i++)
        {
           
            var rolldown = (theoreticalRolldown(compsResultsArray[i][4]) - compsResultsArray[i][3])*100;
            var temp = [i, rolldown];
            rolldownRankArray.push(temp);
            //console.log("rolldown " + rolldown + " = yvalue (" + resultsArray[i][3] + ") - theoretical y (" + theoreticalRolldown(resultsArray[i][4]) + ")")
        }
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

    if (criteria == "same firm")
    {
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
    }
    else
    {
        //Display resuls in one-year rolldown rank table
        var table = $('#compsRankTable').DataTable();
        table.clear();
        var rolldownRankTable = new Array;
        for (var i = 0; i < rolldownRankArray.length; i++)
        {
            var temp = [compsResultsArray[rolldownRankArray[i][0]][0], Math.round(parseFloat(rolldownRankArray[i][1]))];
            rolldownRankTable.push(temp);
        }
        //$("#rankTableData").html(rolldownRankTableHTML);
        table.rows.add(rolldownRankTable).draw();
        table.responsive.recalc();
        table.columns.adjust();
        table.draw();
        rolldownRankTable = [];
    }
    rolldownRankArray = [];
}

function setCompSearchParameters(referenceYield, referenceTenor, referenceRating)
{
    if(isNaN(referenceYield))
    {
        $('body').pgNotification({
            style: 'simple',
            message: "Bond does not have yield data. Please manually revise comparable parameters.",
            position: $('.tab-pane.active .position.active').attr('data-placement'),
            timeout: 8000,
            type: "danger"
        }).show();
    }
    if(isNaN(referenceTenor))
    {
        $('body').pgNotification({
            style: 'simple',
            message: "Bond does not have tenor data. Please manually revise comparable parameters.",
            position: $('.tab-pane.active .position.active').attr('data-placement'),
            timeout: 8000,
            type: "danger"
        }).show();
    }
    if(isNaN(referenceRating))
    {
        $('body').pgNotification({
            style: 'simple',
            message: "Bond is not rated. Please manually revise comparable parameters.",
            position: $('.tab-pane.active .position.active').attr('data-placement'),
            timeout: 8000,
            type: "danger"
        }).show();
    }
    referenceYield = (isNaN(referenceYield) ? 0 : referenceYield);
    referenceTenor = (isNaN(referenceTenor) ? 0 : referenceTenor);
    referenceRating = (isNaN(referenceRating) ? 17 : referenceRating);

    $("#yieldLow").val((referenceYield*0.95).toFixed(2));
    $("#yieldHigh").val((referenceYield*1.5).toFixed(2));
    $("#tenorLow").val(((referenceTenor-3) < 0 ? 0 : (referenceTenor-3)).toFixed(2));
    $("#tenorHigh").val((referenceTenor+2).toFixed(2));
    $("#ratingHigh").val((Math.round((referenceRating-5) < 0 ? 0 : (referenceRating-5))).toString()).change();
    $("#ratingLow").val((Math.round(referenceRating+1)).toString()).change();
}

function getComps(ISIN, firmName, ticker)
{
    compsTickerArray=[];
    compsRegressionArray=[];
    compsResultsArray=[];
    document.getElementById('compsProgressCircle').style.visibility = "visible";
    $("#progressCircle3").show();

    //Get comps search parameters from front end.   
    var yieldLow = (parseFloat($("#yieldLow").val())/100).toFixed(4);
    var yieldHigh = (parseFloat($("#yieldHigh").val())/100).toFixed(4);
    var tenorLow = parseFloat($("#tenorLow").val());
    var tenorHigh = parseFloat($("#tenorHigh").val());
    var ratingLow = parseFloat($("#ratingLow").val());
    var ratingHigh = parseFloat($("#ratingHigh").val());

    //Start AJAX call to database
    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            compsDataPointArray=[];
            compsResultsArray = [];
            var table = $('#compsResultsTable').DataTable();
            table.clear();
            
            var encoded = $.parseJSON(this.responseText);
            var results = encoded[0];
            //Load the slope and y-intercept varialbes
            var compSlope = undefined;
            var compyIntercept = undefined;

            //Extract the regression slope and y-intercept from the incoming JSON from server
            compSlope = parseFloat(encoded[1])*100;
            compyIntercept = parseFloat(encoded[2])*100;
            
            //Push query results into the array resultsArray
            //Keep track of the maximum tenor to determine limit to rendering regression line
            var maxTenor = 0.0;
            for (var i = 0; i < results.length; i++)
            {
                var temp = ([
                    results[i][4],                              //ticker
                    results[i][6],                              //currency
                    parseFloat(results[i][9]).toFixed(2),       //price
                    parseFloat(results[i][10]*100).toFixed(2),  //yield
                    parseFloat(results[i][12]).toFixed(2),      //tenor
                    results[i][13],                             //maturity
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

                compsResultsArray.push(temp);
                //Prepare data for scatter plot
                var dataPoint;
                dataPoint = {x: parseFloat(results[i][12]).toFixed(2), y:parseFloat(results[i][10]*100).toFixed(2)};
                compsDataPointArray.push(dataPoint);
                compsTickerArray.push(results[i][4]);
            }

            //Calculate datapoints for regression array by calculating a data point per every 0.1 in tenor, then pushing results into regressionArray
            compsRegressionArray = [];
            if (compSlope == 0 && compyIntercept == 0)
            {
                $('body').pgNotification({
                    style: 'simple',
                    message: "Failed to load comp regression.",
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "danger"
                }).show();
            }
            for(var i = 1; i < maxTenor*11; i++)
            {
                var compyValue =  compSlope * Math.log(i/10) + compyIntercept;
                var regressionPoint = {x: (i/10).toFixed(4), y: compyValue.toFixed(4)};
                compsRegressionArray.push(regressionPoint);
            }

            //Use regression formula to calculate one-year rolldown for all the data points
            rankRolldown(compSlope, compyIntercept, "comps");

            //Display the results of the query in UI side panels + show relevant notifications
            if(compsResultsArray.length == 0)
            {
                var notificationMessage;
                if ($("#searchCriteria").val() == "ISIN")
                {
                    notificationMessage = "ISIN = " + $("#searchParameter").val();
                    
                }
                else if ($("#searchCriteria").val() == "Company")
                {
                    notificationMessage = "Company Name = " + $("#searchParameter").val(); 
                    
                }
                else
                {
                    notificationMessage = "Ticker = " + $("#searchParameter").val(); 
                }
                $('body').pgNotification({
                    style: 'simple',
                    message: "No comparable bonds match search criteria " + notificationMessage,
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "danger"
                }).show();

                compnoOfResults = 0;
            }
            else
            {
                compnoOfResults = compsResultsArray.length;

                $('body').pgNotification({
                    style: 'simple',
                    message: compsResultsArray.length + " comp results found for " + $("#searchCriteria").val() + ": " +$("#searchParameter").val(),
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "success"
                }).show();
                $("#compsTableTitle").html("Comparable Bonds - " + compsResultsArray.length + " results")
            }
            

            //Draw datatable
            table.rows.add(compsResultsArray).draw();
            console.log("loaded comp data");
            table.responsive.recalc();
            table.columns.adjust();
            table.draw();
            //document.getElementById('progressCircle').style.visibility = "hidden";


            //Render yield map chart
            renderCompCharts();
            compChartDrawCount++;
            document.getElementById('compsProgressCircle').style.visibility = "hidden";
            $("#progressCircle3").hide();
        }
    };
    //need to send over reference bond characteristics to search for comps
    xmlhttp.open("POST","../db/getCompFirmResults-comps.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("ISIN="+encodeURIComponent(ISIN)+"&firmName="+encodeURIComponent(firmName)+"&ticker="+encodeURIComponent(ticker)+"&yield_Low="+encodeURIComponent(yieldLow)+"&yield_High="+encodeURIComponent(yieldHigh)+"&tenor_Low="+encodeURIComponent(tenorLow)+"&tenor_High="+encodeURIComponent(tenorHigh)+"&rating_Low="+encodeURIComponent(ratingLow)+"&rating_High="+encodeURIComponent(ratingHigh));
    //Resetting Parameters
    //ISIN = "Undefined";
    //firmName = "Undefined";
    //ticker = "Undefined";   
}

//potential problem: would clearing the ISIN, firmName, and ticker at the end of each search affect the comp and same firm research results?