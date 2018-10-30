/**
 * Resize function without multiple trigger
 * 
 * Usage:
 * $(window).smartresize(function(){  
 *     // code here
 * });
 */
		/* DATA TABLES */
			
        function init_DataTables() {
            
            if( typeof ($.fn.DataTable) === 'undefined'){ return; }
            
            //$('#datatable').dataTable();

            $('#datatable-keytable').DataTable({
              keys: true
            });

            //$('#resultsTable').DataTable();


            
            $('#resultsTable').DataTable({
              "pageLength": 6,
              "dom" : "<<t>p>"
            });

            $('#compsResultsTable').DataTable({
              "pageLength": 6,
              "dom" : "<Bf<t>p>",
              buttons: [
                {
                  extend: "copy",
                  className: "btn-sm"
                },
                {
                  extend: "csv",
                  className: "btn-sm"
                },
                {
                  extend: "excel",
                  className: "btn-sm"
                },
                {
                  extend: "pdfHtml5",
                  className: "btn-sm"
                },
                { 
                  extend: "print",
                  className: "btn-sm"
                },
                ],
            });

            $('#rankTable').DataTable({
                "paging":false,
                "ordering": false,
                "dom" : "<<t>p>"
              });

            $('#compsRankTable').DataTable({
              "paging":false,
              "ordering": false,
              "dom" : "<<t>p>"
            });
              
        };
    
   
$(document).ready(function() {
    init_DataTables();
            
});	


