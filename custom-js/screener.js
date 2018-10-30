var yieldLow;
var yieldHigh;
var tenorLow;
var tenorHigh;
var ratingLow;
var ratingHigh;
var currency;
var region;
var callable;
var unrated;
var chartDrawCount = 0;
var resultsArray = new Array;
var dataPointArray = new Array;
var tickerArray = new Array;
var regressionArray = new Array;
var rolldownRankArray = new Array;

var moody_st;
var moody_ed;
var sp_st;
var sp_ed;
var fitch_st;
var fitch_ed;

$(document).ready(function(){
    document.getElementById('progressCircle').style.visibility = "visible";
    document.getElementById('progressCircle2').style.visibility = "visible";
    //Main functions
    getInputParameters();
    searchBonds();

    //If "include unrated bonds" is true, disable the rating slider.
    $("#unrated").on('select2:select', function (e) {
        if ($("#unrated").val() == "Yes")
        {
            $("#ratingSlider").data("ionRangeSlider").update({
                disable: true
            });
        }
        else
        {
            $("#ratingSlider").data("ionRangeSlider").update({
                disable: false
            });
        }
    });

    //If submit button is pressed, run getInputParameters and searchBonds
    document.getElementById('submit_button').onclick = function() {
        $("#numberOfResults").html("<span class='semi-bold'>Search Results </span>- loading..."+"<span class='progress-circle-indeterminate pull-right' data-color='complete' id='progressCircle'></span>");
        document.getElementById('progressCircle').style.visibility = "visible";
        document.getElementById('progressCircle2').style.visibility = "visible";
        
        //clears the datatable of data
        var table = $('#resultsTable').DataTable();
        table.clear();
        table.draw();
        getInputParameters();
        searchBonds();
    }

    //If reset button is pressed, reload the page
    document.getElementById('reset_button').onclick = function() {
        location.reload();
    }

    //Function to highlight in the yield map the bond selected in rolldown table. Also populates side menu.
    var rankTable = $('#rankTable').DataTable();
    var clickedIndex = undefined;
    $('#rankTable tbody').on( 'click', 'tr', function () {
        //Changes the previously selected point's color back to blue. clickedIndex detects if another bond has previously been selected in the same session.
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
        var clickedTicker = rowData[1];
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

    //Function to highlight in the yield map the bond clicked on the graph. Also populates side menu.
    var canvas = document.getElementById("YieldMap");
    canvas.onclick = function (evt) {
        //Changes the previously selected point's color back to blue. clickedIndex detects if another bond has previously been selected in the same session.
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

function getInputParameters()
{
    var yieldSlider = $("#yieldSlider").data("ionRangeSlider");
    // Get values
    yieldLow = yieldSlider.result.from;
    yieldLow /= 100;
    yieldHigh = yieldSlider.result.to;
    if (yieldHigh == 20)
    {
        yieldHigh = 130;
    }
    yieldHigh /= 100;

    var tenorSlider = $("#tenorSlider").data("ionRangeSlider");
    // Get values
    tenorLow = tenorSlider.result.from;
    tenorHigh = tenorSlider.result.to;
    if (tenorHigh == 30)
    {
        tenorHigh = 99;
    }

    var ratingSlider = $("#ratingSlider").data("ionRangeSlider");
    // Get values
    ratingLow = ratingSlider.result.from;
    ratingHigh = ratingSlider.result.to;

    currency = $("#currency").val();
    region = $("#region").val();
    callable = $("#callable").val();
    unrated = $("#unrated").val();

    if (callable == "Yes")
    {
        callable = "Y";
    }
    else if (callable == "No")
    {
        callable = "N";
    }

    /*
    console.log("currency = " + currency);
    console.log("region = " + region);
    console.log("callable = " + callable);
    console.log("yieldLow = " + yieldLow);
    console.log("yieldHigh = " + yieldHigh);
    console.log("tenorLow = " + tenorLow);
    console.log("tenorHigh = " + tenorHigh);
    console.log("ratingLow = " + ratingLow);
    console.log("ratingHigh = " + ratingHigh);
    */
}

function searchBonds() {
    translateRankings();

    if (window.XMLHttpRequest) {
        // code for IE7+, Firefox, Chrome, Opera, Safari
        xmlhttp = new XMLHttpRequest();
    } else {
        // code for IE6, IE5
        xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
    }
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            //make sure datatables are empty
            var table = $('#resultsTable').DataTable();
            table.clear();

            var response = $.parseJSON(this.responseText);
            //results is the array containing bond details
            var results = $.parseJSON(response[0]);
            results = results.data.list;
            //Load the slope and y-intercept varialbes
            var slope = undefined;
            var yIntercept = undefined;
            //Extract the regression slope and y-intercept from the incoming JSON from server
            slope = parseFloat(response[1]);
            yIntercept = parseFloat(response[2]);
            //Make sure arrays are empty
            dataPointArray = [];
            resultsArray = [];
            tickerArray = [];

            var maxTenor = 0.0;

            for (var i = 0; i < results.length; i++)
            {
                var ticker = results[i].ticker + " " + results[i].cpn + " " + results[i].finalMaturity.substring(results[i].finalMaturity.length-4,results[i].finalMaturity.length);
                var avgRating=0;
                var numberOfRatings=0;
                //Calculate the average rating
                if (results[i].rtgMoody != "N.A." && alphabetToNumbericRankings("moodys", results[i].rtgMoody) != undefined)
                {
                    avgRating += alphabetToNumbericRankings("moodys", results[i].rtgMoody);
                    numberOfRatings++;
                }
                if (results[i].rtgSp != "N.A." && alphabetToNumbericRankings("sp", results[i].rtgSp) != undefined)
                {
                    avgRating += alphabetToNumbericRankings("sp", results[i].rtgSp);
                    numberOfRatings++;
                }
                if (results[i].rtgFitch != "N.A." && alphabetToNumbericRankings("fitch", results[i].rtgFitch) != undefined)
                {
                    avgRating += alphabetToNumbericRankings("fitch", results[i].rtgFitch);
                    numberOfRatings++;
                }
                if (numberOfRatings != 0)
                {
                    avgRating /= numberOfRatings;
                    avgRating = numericToAlphabetRankings("others",Math.round(avgRating));
                }
                else
                {
                    avgRating = "NULL";
                }

                var temp = ([
                    ticker,
                    results[i].obligorName,
                    results[i].currency,
                    parseFloat(results[i].price).toFixed(2),
                    parseFloat(results[i].yield).toFixed(2),
                    parseFloat(results[i].matYear).toFixed(2),
                    results[i].finalMaturity.substring(results[i].finalMaturity.length-4,results[i].finalMaturity.length),
                    (!results[i].nxt_call_dt ? "": results[i].nxt_call_dt.substring(0,11)),
                    avgRating,
                    results[i].isin,
                    results[i].industrySector,
                    results[i].industrySubgroup,
                    results[i].rtgSp,
                    results[i].rtgFitch,
                    results[i].rtgMoody
                    ]);
                
                if($("#callable").val()=="Yes" || !results[i].nxt_call_dt)
                {
                    if (parseFloat(results[i].matYear) > maxTenor)
                    {
                        maxTenor = parseFloat(results[i].matYear).toFixed(4);
                    }
    
                    resultsArray.push(temp);
                    ///////////////////////////////////////////////////////////////
                    /*
                    var dataPoint;
                    dataPoint = {x: parseFloat(results[i].matYear).toFixed(2), y:parseFloat(results[i].yield).toFixed(2)};
                    dataPointArray.push(dataPoint);
                    tickerArray.push(ticker);
                    */
                } 
            }

            //Check if resultsArray is empty. If it is, then notify the users that no bonds match the search parameters.
            if(resultsArray.length == 0)
            {
                //resultsArray is empty
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
                //resultsArray has resultsArray.length items
                $('body').pgNotification({
                    style: 'simple',
                    message: "Loaded " + resultsArray.length + " results.",
                    position: $('.tab-pane.active .position.active').attr('data-placement'),
                    timeout: 3000,
                    type: "success"
                }).show();
            }

            //Calculate datapoints for regression array by calculating a data point per every 0.1 in tenor, then pushing results into regressionArray
            //Clear regression array
            regressionArray = [];

            regressionArray.push({x:0,y:0});
            for(var i = 1; i < maxTenor*10; i++)
            {
                var yValue =  slope * Math.log(i/10) + yIntercept;
                yValue *= 100;
                var regressionPoint = {x: (i/10).toFixed(4), y: yValue.toFixed(4)};
                regressionArray.push(regressionPoint);
            }


            table.rows.add(resultsArray).draw();
            table.columns.adjust();
            table.responsive.recalc();
            console.log("loaded new data");

            $("#numberOfResults").html("<span class='semi-bold'>Search Results </span>- "+resultsArray.length+" results"+"<span class='progress-circle-indeterminate pull-right' data-color='complete' id='progressCircle'></span>");
            document.getElementById('progressCircle').style.visibility = "hidden";
            document.getElementById('progressCircle2').style.visibility = "hidden";
            
            rankRolldown(slope, yIntercept);
        }
    };
    
    xmlhttp.open("POST","../db/getBondlinc-screener.php",true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.send("regionPHP="+encodeURIComponent(region)+"&currencyPHP="+encodeURIComponent(currency)+"&callablePHP="+encodeURIComponent(callable)+"&yield_Low="+encodeURIComponent(yieldLow)+"&yield_High="+encodeURIComponent(yieldHigh)+"&tenor_Low="+encodeURIComponent(tenorLow)+"&tenor_High="+encodeURIComponent(tenorHigh)+"&moody_st="+encodeURIComponent(moody_st)+"&moody_ed="+encodeURIComponent(moody_ed)+"&sp_st="+encodeURIComponent(sp_st)+"&sp_ed="+encodeURIComponent(sp_ed)+"&fitch_st="+encodeURIComponent(fitch_st)+"&fitch_ed="+encodeURIComponent(fitch_ed)+"&unrated="+encodeURIComponent(unrated));
    
}

function rankRolldown(slope, yIntercept, criteria)
{
    rolldownRankArray = [];

    function theoreticalRolldown(x)
    {   
        if (x-1 < 0)
        {
            return 0;
        }
        else
        {
            var y = (x-1 <= 0 ? 0 : slope*Math.log(x-1) + yIntercept);
            //the regression uses yield as a percentage, thus times the result by 100 to display
            return y*100;
        }
    }


    for (var i = 0; i < resultsArray.length; i++)
    {
        //times 100 to get basis points
        var rolldown = ((theoreticalRolldown(resultsArray[i][5]) - resultsArray[i][4])*100);
        var temp = [i, rolldown];
        rolldownRankArray.push(temp);
    }
    
    rolldownRankArray.sort(sortFunction);

    function sortFunction(a, b) {
        if (a[1] === b[1]) {
            return 0;
        }
        else {
            return (a[1] < b[1]) ? -1 : 1;
        }
    }

    //Eliminate x% of the results as input by the user
    if($("#eliminateResults").val()!=0)
    {
        eliminateResults();
    }
    
    function eliminateResults()
    {
        var eliminatePercentage = $("#eliminateResults").val();
        console.log("eliminate percentage = " + eliminatePercentage+"%");
        var rowsToEliminate = Math.round(eliminatePercentage/100 * resultsArray.length);
        console.log ("rows to eliminate = " + rowsToEliminate);

        function deleteRow(arr, row) {
            arr = arr.slice(0); // make copy
            arr.splice(row - 1, 1);
            return arr;
        }

        for (var i=0; i < rowsToEliminate; i++)
        {
            rolldownRankArray = deleteRow(rolldownRankArray,1);
        }
    }

    //Display resuls in one-year rolldown rank table
    var table = $('#rankTable').DataTable();
    table.clear();
    var rolldownRankTable = new Array;
    for (var i = 0; i < rolldownRankArray.length; i++)
    {
        var temp = [i+1, resultsArray[rolldownRankArray[i][0]][0], Math.round(parseFloat(rolldownRankArray[i][1]))];
        rolldownRankTable.push(temp);
    }
    //$("#rankTableData").html(rolldownRankTableHTML);
    table.rows.add(rolldownRankTable).draw();
    table.responsive.recalc();
    table.columns.adjust();
    table.draw();

    /*
    dataPointArray=[];
    tickerArray=[];
    for (var j = 0; j < rolldownRankArray.length; j++)
    {
        var dataPoint;
        dataPoint = {x: resultsArray[rolldownRankArray[j][0]][5], y: resultsArray[rolldownRankArray[j][0]][4]};
        dataPointArray.push(dataPoint);
        tickerArray.push(resultsArray[rolldownRankArray[j][0]][0]);
    }
    */

    //Draw Yield map
    renderCharts();
}

function renderCharts()
{
    console.log("started render charts");

    tickerArray=[];
    for (var j = 0; j < rolldownRankArray.length; j++)
    {
        var dataPoint;
        dataPoint = {x: resultsArray[rolldownRankArray[j][0]][5], y: resultsArray[rolldownRankArray[j][0]][4]};
        dataPointArray.push(dataPoint);
        tickerArray.push(resultsArray[rolldownRankArray[j][0]][0]);
    }

    ctx = document.getElementById("YieldMap").getContext('2d');
    //If a chart has been rendered in the same session, destroy the old chart to prevent errors.
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
    chartDrawCount++;
}

function displayClickPointData(index)
{
    var displayticker = resultsArray[rolldownRankArray[index][0]][0];
    var currency = resultsArray[rolldownRankArray[index][0]][2];
    var price = resultsArray[rolldownRankArray[index][0]][3];
    var yieldtoMaturity = resultsArray[rolldownRankArray[index][0]][4];
    var tenor = resultsArray[rolldownRankArray[index][0]][5];
    var maturity = resultsArray[rolldownRankArray[index][0]][6];
    var callDate = resultsArray[rolldownRankArray[index][0]][7];
    var avgRating = resultsArray[rolldownRankArray[index][0]][8];
    var ISIN = resultsArray[rolldownRankArray[index][0]][9];
    var sector = resultsArray[rolldownRankArray[index][0]][10];
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

function translateRankings()
{
    moody_st=(numericToAlphabetRankings("moodys", ratingLow));
    sp_st=(numericToAlphabetRankings("sp", ratingLow));
    fitch_st=(numericToAlphabetRankings("fitch", ratingLow));

    moody_ed=(numericToAlphabetRankings("moodys", ratingHigh));
    sp_ed=(numericToAlphabetRankings("sp", ratingHigh));
    fitch_ed=(numericToAlphabetRankings("fitch", ratingHigh));
}

function numericToAlphabetRankings(ratingFirm, input)
{
    if (ratingFirm == "moodys")
    {
        switch(input)
        {
            case 0: 
                return "Aaa";
            case 1: 
                return "Aa1";
            case 2: 
                return "Aa2";
            case 3: 
                return "Aa3";
            case 4: 
                return "A1";
            case 5: 
                return "A2";
            case 6: 
                return "A3";
            case 7: 
                return "Baa1";
            case 8: 
                return "Baa2";
            case 9: 
                return "Baa3";
            case 10: 
                return "Ba1";
            case 11: 
                return "Ba2";
            case 12: 
                return "Ba3";
            case 13: 
                return "B1";
            case 14: 
                return "B2";
            case 15: 
                return "B3";
            case 16: 
                return "Caa1";
            case 17: 
                return "Ca";
        }
    }
    else
    {
        switch(input)
        {
            case 0: 
                return "AAA";
            case 1: 
                return "AA+";
            case 2: 
                return "AA";
            case 3: 
                return "AA-";
            case 4: 
                return "A+";
            case 5: 
                return "A";
            case 6: 
                return "A-";
            case 7: 
                return "BBB+";
            case 8: 
                return "BBB";
            case 9: 
                return "BBB-";
            case 10: 
                return "BB+";
            case 11: 
                return "BB";
            case 12: 
                return "BB-";
            case 13: 
                return "B+";
            case 14: 
                return "B";
            case 15: 
                return "B-";
            case 16: 
                return "CCC";
            case 17: 
                return "C";
        }
    }
}

function alphabetToNumbericRankings(ratingFirm, input)
{
    if (ratingFirm == "moody")
    {
        switch(input)
        {
            case "Aaa":
                return 0;
            case "Aa1":
                return 1;
            case "Aa2":
                return 2;
            case "Aa3":
                return 3;
            case "A1":
                return 4;
            case "A2":
                return 5;
            case "A3":
                return 6;
            case "Baa1":
                return 7;
            case "Baa2":
                return 8;
            case "Baa3":
                return 9;
            case "Ba1":
                return 10;
            case "Ba2":
                return 11;
            case "Ba3":
                return 12;
            case "B1":
                return 13;
            case "B2":
                return 14;
            case "B3":
                return 15;
            case "Caa1":
                return 16;
            case "Caa2":
                return 17;
            case "Caa3":
                return 17;
            case "Ca":
                return 17;
            case "C":
                return 17;
            default:
                return undefined;
        }
    }
    else
    {
        switch(input)
        {
            case "AAA":
                return 0;
            case "AA+":
                return 1;
            case "AA":
                return 2;
            case "AA-":
                return 3;
            case "A+":
                return 4;
            case "A":
                return 5;
            case "A-":
                return 6;
            case "BBB+":
                return 7;
            case "BBB":
                return 8;
            case "BBB-":
                return 9;
            case "BB+":
                return 10;
            case "BB":
                return 11;
            case "BB-":
                return 12;
            case "B+":
                return 13;
            case "B":
                return 14;
            case "B-":
                return 15;
            case "CCC+":
                return 16;
            case "CCC":
                return 17;
            case "CCC-":
                return 17;
            case "CC":
                return 17;
            case "C":
                return 17;
            default:
                return undefined;
        }
    }
}