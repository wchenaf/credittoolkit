<?php include "../templates/header.php"; ?>
<!-- START PAGE CONTENT WRAPPER -->
<div class="page-content-wrapper ">
<!-- START PAGE CONTENT -->
<div class="content sm-gutter">
  <!-- START CONTAINER FLUID -->
  <div class="container-fluid p-t-30 p-l-25 p-r-25 p-b-0 sm-padding-10">
    <div class="row">
      <div class="col-lg-4 col-xl-3 col-xlg-2 ">
        <div class="row">
          <div class="col-md-12 m-b-10">
            <!-- Search Bonds By -->
            <div class="widget-8 card no-border bg-white no-margin widget-loader-bar">
              <div class="container-xs-height full-height">
                <div class="row-xs-height">
                  <div class="col-xs-height col-top">
                    <div class="card-header  top-left top-right">
                      <div class="card-title text-black hint-text">
                        <span class="font-montserrat fs-11 all-caps">Search Bonds by <i
                            class="fa fa-chevron-right"></i>
                                            </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="row-xs-height">
                  <div class="col-xs-height col-top relative">
                    <div class="row">
                      <div class="col-sm-12">
                        <div class="p-l-20 p-r-20">
                          <div class="form-group form-group-default p-t-15 p-b-0">
                            <select class="cs-select input-sm cs-skin-slide cs-transparent form-control" data-init-plugin="cs-select" id="searchCriteria">
                              <option value="Ticker">Ticker</option>
                              <option value="Company">Company Name</option>
                              <option value="ISIN">ISIN</option>
                            </select>
                          </div>
                          <form class="m-t-10" role="form">
                            <div class="form-group form-group-default form-group-default-select2 required">
                              <label class="label-sm" id="parameterLabel">Ticker</label>
                              <select class="full-width" data-placeholder="Please select" data-init-plugin="select2" id="searchParameter">
                                <option></option>
                                <?php
                                require "../db/config-sql.php";
                                require "../common.php";
                                
                                // Create connection
                                $conn = new mysqli($host, $username, $password, $dbname);
                                // Check connection
                                if ($conn->connect_error) {
                                    die("Connection failed: " . $conn->connect_error);
                                } 

                                $sql =  " SELECT DISTINCT ticker FROM creditdb ";
                                
                                $result = $conn->query($sql);
                                
                                $resultsArray = array();
                                
                                echo "<optgroup label='Ticker'>";
                                while ($row = mysqli_fetch_array($result)){
                                    echo "<option value = '" . $row["ticker"] . "'>" . $row["ticker"] . "</option>";
                                }
                                echo "</optgroup>";

                                $sql =  " SELECT DISTINCT corpName FROM creditdb ";
                                
                                $result = $conn->query($sql);
                                
                                $resultsArray = array();
                                
                                echo "<optgroup label='Company Name'>";
                                while ($row = mysqli_fetch_array($result)){
                                    echo "<option value = '" . $row["corpName"] . "'>" . $row["corpName"] . "</option>";
                                }
                                echo "</optgroup>";

                                $sql =  " SELECT DISTINCT isin FROM creditdb ";
                                
                                $result = $conn->query($sql);
                                
                                $resultsArray = array();
                                
                                echo "<optgroup label='ISIN'>";
                                while ($row = mysqli_fetch_array($result)){
                                    echo "<option value = '" . $row["isin"] . "'>" . $row["isin"] . "</option>";
                                }
                                echo "</optgroup>";
                                
                                $conn->close();    
                                
                              ?>
                              </select>
                            </div>
                          </form>
                          
                        </div>
                      </div>
                      <div class="col-sm-6">
                      </div>
                    </div>
                    <div class='widget-8-chart line-chart' data-line-color="black" data-points="true" data-point-color="warning" data-stroke-width="2">
                      <svg></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- Search Bonds By -->
          </div>
        </div>
        <div class="row">
          <div class="col-lg-12 m-b-10">
            <!-- Issuing Firm -->
            <div class="widget-9 card no-border bg-success no-margin widget-loader-bar">
              <div class="full-height d-flex flex-column">
                <div class="card-header ">
                  <div class="card-title text-black">
                    <span class="font-montserrat fs-11 all-caps" id="information">Issuing Company <i
                          class="fa fa-chevron-right"></i>
                          </span>
                  </div>
                  <div class="card-controls">
                    <ul>
                      <li><a href="#" class="card-refresh text-black" data-toggle="refresh"><i class="card-icon card-icon-refresh"></i></a>
                      </li>
                    </ul>
                  </div>
                </div>
                <div class="p-l-20">
                  <h3 class="no-margin p-b-0 text-white" id="company">-</h3>
                </div>
              </div>
            </div>
            <!-- Issuing Firm -->
          </div>
        </div>
        <div class="row">
        <div class="col-lg-12 m-b-10">
          <!-- Bonds by Same Issuing Firm - no. of Results -->
          <div class="widget-9 card no-border bg-warning no-margin widget-loader-bar">
            <div class="full-height d-flex flex-column">
              <div class="card-header ">
                <div class="card-title text-black">
                  <span class="font-montserrat fs-11 all-caps">Bonds by Same Issuer <i
            class="fa fa-chevron-right"></i>
                        </span>
                </div>
                <div class="card-controls">
                  <ul>
                    <li><a href="#" class="card-refresh text-black" data-toggle="refresh"><i class="card-icon card-icon-refresh"></i></a>
                    </li>
                  </ul>
                </div>
              </div>
              <div class="p-l-20">
                <h4 class="no-margin p-b-5 text-black" id="noOfResults">-</h4>
              </div>
            </div>
          </div>
          <!-- Bonds by Same Issuing Firm - no. of Results -->
        </div>
      </div>
      </div>
      <div class="col-lg-8 col-xl-9 col-xlg-9 m-b-10">
        <div class="row">
          <div class="col-md-12">
            <!-- Bonds by Same Issuer -->
            <div class="col-lg-12">
            <div class="card card-default">
                <div class="card-header  separator">
                  <h4><span class="semi-bold" id="sameIssuerTableTitle">Bonds by Same Issuer</span><span class="progress-circle-indeterminate pull-right" data-color="complete" id="progressCircle"></span></h4>
                </div>
              <div class="card-block" style="width:100%">
                <!-- Start of Card Content -->
                <table id="resultsTable" class="table table-striped table-bordered dt-responsive table-condensed nowrap center-block" cellspacing="0" width="100%">
                  <thead>
                    <tr>
                      <th>Ticker</th>
                      <th>Currency</th>
                      <th>Price</th>
                      <th>Yield</th>
                      <th>Tenor</th>
                      <th>Maturity</th>
                      <th>Call Date</th>
                      <th>Avg Rating</th>
                      <th>ISIN</th>
                      <th>Sector</th>
                      <th>Sub Sector</th>
                      <th>S&ampP Rating</th>
                      <th>Fitch Rating</th>
                      <th>Moodys Rating</th>
                    </tr>
                  </thead>
                  <tbody ID="TableData">
                    
                  </tbody>
                </table>
                <!-- End of Card Content -->
              </div>
            </div>
          </div>
          <!-- Bonds by Same Issuer -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END CONTAINER FLUID -->
  <!-- START SAME FIRM YIELD MAP AND ROLLDOWN -->
  <div class="card card-transparent p-t-0 p-l-25 p-r-25 p-b-0" id="sameFirmGraphDiv">
    <div class="card-block no-padding">
      <div id="card-circular-minimal" class="card card-default">
        <div class="row">
          <!-- START card -->
          <div class="card-header col-lg-12 p-l-20 p-r-20">
            <div class="card-title">same issuer yield map - click on datapoints for more information</div>
            <span class="progress-circle-indeterminate pull-right" data-color="complete" id="progressCircle2"></span>
          </div>
          
          <div class="card-block d-flex flex-wrap row">
            <div class="col-lg-2 no-padding">
              <div class="p-r-0">
              <h4><span class="semi-bold" id="sameIssuerMapTitle">Same Issuer Yield Map</span></h4>
                <hr style="height:0pt; visibility:hidden;" />
                <h5 id="chartTicker"><span class='semi-bold'>Ticker: </span></h5>
                <h5 id="chartCurrency"><span class='semi-bold'>Currency: </span></h5>
                <h5 id="chartPrice"><span class='semi-bold'>Price:</span></h5>
                <h4 id="chartYield"><span class='semi-bold'>Yield:</span></h5>
                <h5 id="chartTenor"><span class='semi-bold'>Tenor:</span></h5>
                <h5 id="chartMaturity"><span class='semi-bold'>Maturity:</span></h5>
                <h5 id="chartCallDate"><span class='semi-bold'>Call Date:</span></h5>
                <h5 id="chartAverageRating"><span class='semi-bold'>Average Rating:</span></h5>
                <h5 id="chartISIN"><span class='semi-bold'>ISIN:</span></h5>
                <h5 id="chartSector"><span class='semi-bold'>Sector:</span></h5>
              </div>
            </div>
            <div class="col-lg-7 sm-no-padding">
              <canvas id="YieldMap" width="250" height="220"></canvas>
            </div>
            <div class="col-lg-3 sm-no-padding">
              <h4><span class="semi-bold">  Rolldown Rankings</span></h4>
              <table id="rankTable" class="table table-condensed table-condensed2 center-block table-hover" cellspacing="0" width="100%">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>BPS</th>
                  </tr>
                </thead>
                <tbody ID="rankTableData">

                </tbody>
              </table>
            </div>
          </div>
        <!-- END card -->
        </div> 
      </div>
    </div>
  </div>
  <!-- END SAME FIRM YIELD MAP AND ROLLDOWN -->

<!-- Comps Search Criteria -->
  <!-- START CONTAINER FLUID -->
  <div class="container-fluid p-t-0 p-l-25 p-r-25 p-b-0" id="compFirmResultsTable">
    <div class="row">
      <!-- Start Reference Bond Info -->
      <div class="col-lg-3 col-xl-3 col-xlg-3" style="height:100%">
        <div data-pages="card" class="card card-default bg-info" id="card-basic">
          <div class="card-header  separatorwhite">
          <font color="white"><strong>REFERENCE BOND</strong></font>
            <div class="card-controls">
              <ul>
                <li><a data-toggle="collapse" class="card-collapse" style="color: white"><i
          class="card-icon card-icon-collapse" style="color: white"></i></a>
                </li>
              </ul>
            </div>
          </div>
          <div class="card-block">
            <br>
            <p style="color:#ffffff"><span><strong>Ticker: </strong></span><span id="compReferenceTicker"></span></p>
            <p style="color:#ffffff"><span><strong>Currency: </strong></span><span id="compReferenceCurrency"></span></p>
            <p style="color:#ffffff"><span><strong>Price: </strong></span><span id="compReferencePrice"></span></p>
            <p style="color:#ffffff"><span><strong>Yield: </strong></span><span id="compReferenceYield"></span></p>
            <p style="color:#ffffff"><span><strong>Tenor: </strong></span><span id="compReferenceTenor"></span></p>
            <p style="color:#ffffff"><span><strong>Maturity: </strong></span><span id="compReferenceMaturity"></span></p>
            <p style="color:#ffffff"><span><strong>Call Date: </strong></span><span id="compReferenceCallDate"></span></p>
            <p style="color:#ffffff"><span><strong>Average Rating: </strong></span><span id="compReferenceAverageRating"></span></p>
            <p style="color:#ffffff"><span><strong>ISIN: </strong></span><span id="compReferenceISIN"></span></p>
            <p style="color:#ffffff"><span><strong>Sector: </strong></span><span id="compReferenceSector"></span></p>
          </div>
        </div>
        
        <div data-pages="card" class="card card-default bg-white" id="card-basic">
          <div class="card-header  separator">
          <font><strong>ADVANCED OPTIONS</strong></font>
            <div class="card-controls">
              <ul>
                <li><a data-toggle="collapse" class="card-collapse" href="#"><i
          class="card-icon card-icon-collapse"></i></a>
                </li>
              </ul>
            </div>
          </div>
            <!-- Advanced Options Content -->
            <div class="card-block collapse col-lg-12">
              <h6>Yield %</h6>
              <div class="input-group">
                <input type="text" class="input-sm form-control" id="yieldLow"/>
                <div class="input-group-addon">to</div>
                <input type="text" class="input-sm form-control" id="yieldHigh"/>
              </div>
              <h6>Tenor</h6>
              <div class="input-group">
                <input type="text" class="input-sm form-control" id="tenorLow"/>
                <div class="input-group-addon">to</div>
                <input type="text" class="input-sm form-control" id="tenorHigh"/>
              </div>
              <h6>Rating</h6>
              <div class="input-group">
                <select class="full-width" data-init-plugin="select2" id="ratingLow">
                  <option value="0">AAA+</option>
                  <option value="1">AAA</option>
                  <option value="2">AAA-</option>
                  <option value="3">AA+</option>
                  <option value="4">AA</option>
                  <option value="5">AA-</option>
                  <option value="6">A+</option>
                  <option value="7">A</option>
                  <option value="8">A-</option>
                  <option value="9">BBB+</option>
                  <option value="10">BBB</option>
                  <option value="11">BBB-</option>
                  <option value="12">BB+</option>
                  <option value="13">BB</option>
                  <option value="14">BB-</option>
                  <option value="15">B+</option>
                  <option value="16">B</option>
                  <option value="17">B-</option>
                </select>
                <div class="input-group-addon">to</div>
                <select class="full-width" data-init-plugin="select2" id="ratingHigh">
                  <option value="0">AAA+</option>
                  <option value="1">AAA</option>
                  <option value="2">AAA-</option>
                  <option value="3">AA+</option>
                  <option value="4">AA</option>
                  <option value="5">AA-</option>
                  <option value="6">A+</option>
                  <option value="7">A</option>
                  <option value="8">A-</option>
                  <option value="9">BBB+</option>
                  <option value="10">BBB</option>
                  <option value="11">BBB-</option>
                  <option value="12">BB+</option>
                  <option value="13">BB</option>
                  <option value="14">BB-</option>
                  <option value="15">B+</option>
                  <option value="16">B</option>
                  <option value="17">B-</option>
                </select>
              </div>
              <br>
              <div class="pull-right">
                <button class="btn btn-complete btn-cons" id="customCompSearch">Search</button>
              </div>
            </div>
            <!-- Advanced Options Content -->
        </div>
      </div>
      <!-- End Reference Bond Info -->
      <div class="col-lg-9 col-xl-9 col-xlg-9 m-b-10 p-l-0">
        
        <div class="row">
          <div class="col-md-12">
            <!-- Bonds by Same Issuer -->
            <div class="col-lg-12">
            
            <div class="card card-default">
                <div class="card-header  separator">
                  <h4><span class="semi-bold" id="compsTableTitle">Comparable Bonds</span><span class="progress-circle-indeterminate pull-right" data-color="complete" id="compsProgressCircle"></span></h4>
                </div>
                <div class="card-block" style="width:100%">
                
                  <!-- Start of Card Content -->
                  <br>
                  <table id="compsResultsTable" class="table table-striped table-bordered dt-responsive table-condensed nowrap center-block" cellspacing="0" width="100%">
                    <thead>
                      <tr>
                        <th>Ticker</th>
                        <th>Currency</th>
                        <th>Price</th>
                        <th>Yield</th>
                        <th>Tenor</th>
                        <th>Maturity</th>
                        <th>Call Date</th>
                        <th>Avg Rating</th>
                        <th>ISIN</th>
                        <th>Sector</th>
                        <th>Sub Sector</th>
                        <th>S&ampP Rating</th>
                        <th>Fitch Rating</th>
                        <th>Moodys Rating</th>
                      </tr>
                    </thead>
                    <tbody ID="compsTableData">
                
                    </tbody>
                  </table>
                  <!-- End of Card Content -->
                </div>
              </div>
            </div>
          <!-- Bonds by Same Issuer -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- END CONTAINER FLUID -->
  <!-- Comps Search Results -->

  <!-- START COMP FIRM YIELD MAP AND ROLLDOWN -->
  <div class="card card-transparent p-t-0 p-l-25 p-r-25 p-b-0 sm-padding-10" id="compFirmGraphDiv">
    <div class="card-block no-padding">
      <div id="card-circular-minimal" class="card card-default">
        <div class="row">
          <!-- START card -->
          <div class="card-header col-lg-12 p-l-20 p-r-20">
            <div class="card-title">comparable bonds yield map - click on datapoints for more information
            </div>
            <span class="progress-circle-indeterminate pull-right" data-color="complete" id="progressCircle3"></span>
          </div>
          <div class="card-block d-flex flex-wrap row">
            <div class="col-lg-2 no-padding">
              <div class="p-r-0">
              <h4><span class="semi-bold" id="sameIssuerMapTitle">Comps Yield Map</span></h4>
              <h5 id="compchartTicker"><span class='semi-bold'>Ticker: </span></h5>
              <h5 id="compchartCurrency"><span class='semi-bold'>Currency: </span></h5>
              <h5 id="compchartPrice"><span class='semi-bold'>Price:</span></h5>
              <h5 id="compchartYield"><span class='semi-bold'>Yield:</span></h5>
              <h5 id="compchartTenor"><span class='semi-bold'>Tenor:</span></h5>
              <h5 id="compchartMaturity"><span class='semi-bold'>Maturity:</span></h5>
              <h5 id="compchartCallDate"><span class='semi-bold'>Call Date:</span></h5>
              <h5 id="compchartAverageRating"><span class='semi-bold'>Average Rating:</span></h5>
              <h5 id="compchartISIN"><span class='semi-bold'>ISIN:</span></h5>
              <h5 id="compchartSector"><span class='semi-bold'>Sector:</span></h5>
              </div>
            </div>
            <div class="col-lg-7 sm-no-padding">
              <canvas id="compYieldMap" width="250" height="220"></canvas>
            </div>
            <div class="col-lg-3 sm-no-padding">
              <h4><span class="semi-bold">  Rolldown Rankings</span></h4>
              <table id="compsRankTable" class="table table-condensed table-condensed2 center-block table-hover" cellspacing="0" width="100%">
                <thead>
                  <tr>
                    <th>Ticker</th>
                    <th>BPS</th>
                  </tr>
                </thead>
                <tbody ID="compsRankTableData">

                </tbody>
              </table>
            </div>
          </div>
        <!-- END card -->
        </div> 
      </div>
    </div>
  </div>
  <!-- END COMP FIRM YIELD MAP AND ROLLDOWN -->

  
</div>
<!-- END PAGE CONTENT -->

<?php include "../templates/footer.php"; ?>
<!-- Initilize DataTables -->
<script src = "../custom-js/comps-dt-init.js"></script>
<!-- Chart JS-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js"></script>
<!-- Custom Javascript -->
<script src = "../custom-js/comps.js" type="text/javascript"></script>