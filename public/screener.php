<?php include "../templates/header.php"; ?>

<!-- START PAGE CONTENT WRAPPER -->
<div class="page-content-wrapper">
        <!-- START PAGE CONTENT -->
        <div class="content">
          <br>
          <div class=" container-fluid   container-fixed-lg">
            <h3 class="page-title semi-bold">Bond Search Engine</h3>
          </div>
          <!-- START CONTAINER FLUID -->
          <div class=" container-fluid   container-fixed-lg">
              <div class="row">
                <div class="col-lg-12">
                  <div class="card card-transparent">
                    <div class="card-header ">
                      <div class="card-title">Input Search Parameters
                      </div>
                    </div>
                    <div class="card-block">
                      <div class="row">

                        <!-- Control Matrix -->
                        <div class="col-lg-12">
                          <div class="card card-default">
                            <div class="card-block">
                              <h3><span class="semi-bold">Control Matrix</span></h3>
                              <!-- Start of Card Content -->
                              <div class = "row">
                                <div class="col-lg-6">
                                  <p>Yield%</p>
                                  <div class="irs-wrapper complete">
                                    <input type="text" class="YTW_slider" id="yieldSlider"/>
                                  </div>
                                  <br>
                                  <p>Tenor (years)</p>
                                  <div class="irs-wrapper success">
                                    <input type="text" class="TENOR_slider" id="tenorSlider" />
                                  </div>
                                  <br>
                                  <p>Rating</p>
                                  <div class="irs-wrapper danger">
                                    <input type="text" class="RATING_slider" id="ratingSlider"/>
                                  </div>
                                  <br>
                                </div>
                                <div class="col-lg-6">
                                  <br>
                                  <div class="row">
                                    <div class = "col-lg-6">
                                      <form class="m-t-10" role="form">
                                        <div class="form-group form-group-default form-group-default-select2 required">
                                          <label class="">Include Unrated Bonds</label>
                                          <select class="full-width" data-init-plugin="select2" id="unrated">
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                          </select>
                                        </div>
                                      </form>
                                    </div>
                                    <div class = "col-lg-6">
                                      <form class="m-t-10" role="form">
                                        <div class="form-group form-group-default form-group-default-select2 required">
                                          <label class="">Include Callable Bonds</label>
                                          <select class="full-width" data-placeholder="Select Currency" data-init-plugin="select2" id="callable">
                                            <option value="No">No</option>
                                            <option value="Yes">Yes</option>
                                          </select>
                                        </div>
                                      </form>
                                    </div>
                                  </div>
                                  <br>
                                  <br>
                                  
                                  <div class="row">
                                    <div class="col-lg-6">
                                      <form class="m-t-10" role="form">
                                        <div class="form-group form-group-default form-group-default-select2 required">
                                          <label class="">Currency</label>
                                          <select class="full-width" data-placeholder="Select Currency" data-init-plugin="select2" id="currency">
                                            <option value="Unspecified">Unspecified</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                            <option value="GBP">GBP</option>
                                            <option value="EUR">EUR</option>
                                            <option value="CHF">CHF</option>
                                            <option value="CNY">CNY</option>
                                            <option value="SGD">SGD</option>
                                          </select>
                                        </div>
                                      </form>
                                    </div>
                                    <div class="col-lg-6">
                                      <form class="m-t-10" role="form">
                                        <div class="form-group form-group-default form-group-default-select2 required">
                                          <label class="">Region</label>
                                          <select class="full-width" data-placeholder="Select Region" data-init-plugin="select2" id="region">
                                            <option value="Unspecified">Unspecified</option>
                                            <option value="Africa">Africa</option>
                                            <option value="America">America</option>
                                            <option value="Asia">Asia</option>
                                            <option value="Europe">Europe</option>
                                            <option value="Oceana">Oceana</option>
                                            <option value="Others">Others</option>
                                          </select>
                                        </div>
                                      </form>
                                    </div>
                                  </div>
                                  <br>
                                  <br>
                                  <form class="m-t-10" role="form">
                                    <div class="form-group form-group-default form-group-default-select2 required">
                                      <label class="">Eliminate Top % Results From Rankings</label>
                                      <select class="full-width" data-placeholder="Select Percentage" data-init-plugin="select2" id="eliminateResults">
                                        <?php
                                          for ($x = 0; $x <= 100; $x++) {
                                            echo "<option value='".$x."'>".$x."%</option>";
                                          } 
                                        ?>
                                      </select>
                                    </div>
                                  </form>
                                </div>
                              </div>
                              <div class="ln_solid"></div>
                              <div class="form-group">
                                <div class="col-md-12 col-sm-12 col-xs-12">
                                  <button class="btn btn-complete btn-cons pull-right" id="submit_button">Submit</button>
                                  <button class="btn btn-danger btn-cons pull-right" id="reset_button">Reset</button>
                                </div>
                              </div>
                              <!-- End of Card Content -->
                            </div>
                          </div>
                        </div>
                        <!-- Control Matrix -->

                        <!-- Search Results Table -->
                        <div class="col-lg-12">
                          <div class="card card-default">
                            <div class="card-block">
                              <h3  id="numberOfResults"><span class="semi-bold">Search Results</span> - loading...<span class="progress-circle-indeterminate pull-right" data-color="complete" id="progressCircle"></span></h3> 
                              <br>
                              <!-- Start of Card Content -->
                              <table id="resultsTable" class="table table-striped table-bordered dt-responsive nowrap center-block" cellspacing="0" width="100%">
                                <thead>
                                  <tr>
                                    <th>Ticker</th>
                                    <th>Corp Name</th>
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
                                    <th>S &amp P Rating</th>
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
                        <!-- Search Results Table -->

                        <!-- Yield Map -->
                        <div class="col-lg-12">
                          <div class="card card-default">
                            <div class="card-block">
                              <!-- Start of Card Content -->
                              <div class="card-header col-lg-12 p-l-5 p-r-10">
                                <div class="card-title">yield map - click on datapoints for more information
                                </div>
                                <span class="progress-circle-indeterminate pull-right" data-color="complete" id="progressCircle2"></span>
                              </div>
                              <div class="card-block d-flex flex-wrap row">
                                <div class="col-lg-2 no-padding">
                                  <div class="p-r-0">
                                  <h5 id="chartTicker"><span class='semi-bold'>Ticker: </span></h5>
                                  <h5 id="chartCurrency"><span class='semi-bold'>Currency: </span></h5>
                                  <h5 id="chartPrice"><span class='semi-bold'>Price:</span></h5>
                                  <h5 id="chartYield"><span class='semi-bold'>Yield:</span></h5>
                                  <h5 id="chartTenor"><span class='semi-bold'>Tenor:</span></h5>
                                  <h5 id="chartMaturity"><span class='semi-bold'>Maturity:</span></h5>
                                  <h5 id="chartCallDate"><span class='semi-bold'>Call Date:</span></h5>
                                  <h5 id="chartAverageRating"><span class='semi-bold'>Average Rating:</span></h5>
                                  <h5 id="chartISIN"><span class='semi-bold'>ISIN:</span></h5>
                                  <h5 id="chartSector"><span class='semi-bold'>Sector:</span></h5>
                                  </div>
                                </div>
                                <div class="col-lg-7 sm-no-padding">
                                  <canvas id="YieldMap" width="250" height="300"></canvas>
                                </div>
                                <div class="col-lg-3 sm-no-padding">
                                  <h4><span class="semi-bold">  Rolldown Rankings</span></h4>
                                  <table id="rankTable" class="table table-condensed table-condensed2 center-block table-hover" cellspacing="0" width="100%">
                                    <thead>
                                      <tr>
                                        <th>Rank</th>
                                        <th>Ticker</th>
                                        <th>BPS</th>
                                      </tr>
                                    </thead>
                                    <tbody ID="rankTableData">

                                    </tbody>
                                  </table>
                                </div>
                              </div>
                              <!-- End of Card Content -->
                            </div>
                          </div>
                        </div>
                        <!-- Yield Map -->
                        
                      </div>
                    </div>
                  </div>

                  

                </div>
              </div>
            </div>
          <!-- END CONTAINER FLUID -->
        </div>
        <!-- END PAGE CONTENT -->

<?php include "../templates/footer.php"; ?>
<!-- Chart JS-->
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.bundle.min.js"></script>
<script src="../custom-js/screener-dt-init.js"></script>
<script src="../custom-js/screener.js"></script>
