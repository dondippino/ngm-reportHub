/**
 * @ngdoc function
 * @name ngmReportHubApp.controller:ProjectFinancialsCtrl
 * @description
 * # ProjectFinancialsCtrl
 * Controller of the ngmReportHub
 */

angular.module('ngm.widget.project.financials', ['ngm.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('project.financials', {
        title: 'Health Project Financials Form',
        description: 'Display Health Project Financials Form',
        controller: 'ProjectFinancialsCtrl',
        templateUrl: '/scripts/modules/health/views/forms/financials/form.html'
      });
  })
  .controller('ProjectFinancialsCtrl', [
    '$scope',
    '$window',
    '$location',
    '$timeout',
    '$filter',
    '$q',
    '$http',
    'ngmUser',
    'ngmData',
    'config',
    function($scope, $window, $location, $timeout, $filter, $q, $http, ngmUser, ngmData, config){

      // get currency exchange
      ngmData.get({
        method: 'GET',
        externalApi: true,
        url: 'http://www.apilayer.net/api/live?access_key=1106b426ad52b3fefced5ee9ac6beabc&currencies=USD,AFN&format=1'
      }).then(function(data){

        // set live exchange
        $scope.project.exchange = data.quotes;

      });

      // project
      $scope.project = {

        // user
        user: ngmUser.get(),

        // app style
        style: config.style,

        // exchange rate
        exchange: {
          'USDUSD':1,
          'USDAFN':68.61          
        },

        // search
        search: {
          filter: '',
          focused: false
        },

        // last update
        updatedAt: moment(config.project.updatedAt).format('DD MMMM, YYYY @ h:mm:ss a'),

        // project
        definition: config.project,

        // details template
        financialsUrl: '/scripts/modules/health/views/forms/financials/financials.html',

        // holder for UI options
        options: {
          selection: {},
          list: [{
              expenditure_item: 'agreements',
              expenditure_name: 'Agreements with UN/NGO'
            },{
              expenditure_item: 'contractual_service_general',
              expenditure_name: 'Contractual Service General'
            },{
              expenditure_item: 'dfc',
              expenditure_name: 'DFC'
            },{
              expenditure_item: 'equiptment_vehicles_furniture',
              expenditure_name: 'Equiptment, Vehicles, Furniture'
            },{
              expenditure_item: 'general_operating_costs',
              expenditure_name: 'General Operating Costs'
            },{ 
              expenditure_item: 'medical_supplies_literature',
              expenditure_name: 'Medical Supplies, Literature'
            },{
              expenditure_item: 'psc_cost',
              expenditure_name: 'PSC Cost'
            },{
              expenditure_item: 'security_expenses',
              expenditure_name: 'Security Expenses'
            },{
              expenditure_item: 'staff_costs_lt',
              expenditure_name: 'Staff Costs LT'
            },{
              expenditure_item: 'staff_costs_st',
              expenditure_name: 'Staff Costs ST'
            },{
              expenditure_item: 'staff_costs_supplementary',
              expenditure_name: 'Staff Costs Supplementary'
            },{
              expenditure_item: 'telecomunications',
              expenditure_name: 'Telecomunications'
            },{
              expenditure_item: 'training',
              expenditure_name: 'Training'
            },{
              expenditure_item: 'travel',
              expenditure_name: 'Travel'
          }]
        },

        // expand search box
        toggleSearch: function($event) {;
          // focus search
          $('#search_ngm-financial-list').focus();
          $scope.project.search.focused = $scope.project.search.focused ? false : true;
        },

        // currency on budget exchange
        // budgetKeyUp: function( $index, update ){

        //   // if usd
        //   if ( update === 'usd' ) {
        //     // update afn with currency
        //     var exchange = parseInt( ( $scope.project.definition.financials[$index].expenditure_budget_usd * $scope.project.exchange.USDAFN ).toFixed(0) );
        //     $scope.project.definition.financials[$index].expenditure_budget_afn = exchange;
        //   }

        //   // if afn
        //   if ( update === 'afn' ) {
        //     // update afn with currency
        //     var exchange = parseInt( ( $scope.project.definition.financials[$index].expenditure_budget_afn / $scope.project.exchange.USDAFN ).toFixed(0) );
        //     $scope.project.definition.financials[$index].expenditure_budget_usd = exchange;
        //   }

        // },

        // 
        addFinancialItem: function() {

          // push to financials
          $scope.project.definition.financials.unshift({
            organization_id: $scope.project.definition.organization_id, 
            organization: $scope.project.definition.organization,
            username: $scope.project.definition.username,
            status: 'new',
            expenditure_item: $scope.project.options.selection.expenditure.expenditure_item,
            expenditure_name: $scope.project.options.selection.expenditure.expenditure_name,
            expenditure_start_date: moment().format('YYYY-MM-DD'),
            expenditure_end_date: moment().add(1, 'months').format('YYYY-MM-DD'),
            timestamp: moment().format('x')
          }); 

          // reset selection
          $scope.project.options.selection.expenditure = {}
          
          // update dropdown
          $timeout(function(){
            // init select
            $('select').material_select();
            // update list
            $('#ngm-expenditure-item-' + $scope.project.definition.financials.length - 1).material_select('update');            
            // set start/end
            angular.forEach($scope.project.definition.financials, function(d, i){
              //
              $scope.project.setStartTime(d);
              $scope.project.setEndTime(d);
            }); 
          }, 10);

        },

        // remove location from location list
        removeFinancialItem: function($index) {
          // remove location at i
          $scope.project.definition.financials.splice($index, 1);
        },

        // cofirm exit if changes
        modalConfirm: function(modal){

          // if dirty, warn on exit
          // if($scope.healthProjectFinancialsForm.$dirty){
            // $('#' + modal).openModal({dismissible: false});
          // } else{
            $scope.project.cancel();
          // }

        },

        // update project/financials
        save: function(){

          // open success modal if valid form
          if($scope.healthProjectFinancialsForm.$valid){

            // details update
            ngmData.get({
              method: 'POST',
              url: 'http://' + $location.host() + '/api/health/project/setProject',
              data: {
                project: $scope.project.definition
              }
            }).then(function(project){

              // add id to client json
              $scope.project.definition.id = project.id;

              // notification modal
              $('#save-modal').openModal({ dismissible: false });
            });

          } else {
            // form validation takes over
            $scope.healthProjectFinancialsForm.$setSubmitted();
            // inform
            Materialize.toast('Please review the form for errors and try again!', 3000);
          }

        },

        // re-direct on save
        redirect: function(){
          // redirect on success          
          $timeout(function(){
            Materialize.toast( $scope.project.definition.project_title + ' Financials updated!', 3000, 'success');
          }, 200);

        },

        // cancel and delete empty project
        cancel: function() {
          
          // update
          $timeout(function() {
            $location.path( '/health/projects/summary/' + $scope.project.definition.id );
            if( $scope.project.definition.project_status !== 'complete' ) {
              // Materialize.toast( 'Project update cancelled!', 3000, 'note' );
            }
          }, 100);

        },

        // set start datepicker
        setStartTime: function(d, i) {
            
          // set element
          var $input = $( '#ngm-expenditure-start-date-' + d.timestamp ).pickadate({
            selectMonths: true,
            selectYears: 15,
            format: 'dd mmm, yyyy',
            onStart: function(){
              $timeout(function(){
                // set time
                var date = moment(d.expenditure_start_date).format('YYYY-MM-DD');
                $input.pickadate('picker').set('select', date, { format: 'yyyy-mm-dd' } );

              }, 0)
            },          
            onSet: function(event){
              // close on date select
              if(event.select){
                // get date
                var selectedDate = moment(event.select);
                // check dates
                if ( (selectedDate).isAfter(d.expenditure_end_date) ) {
                  // inform
                  Materialize.toast('Please check the dates and try again!', 3000);
                  // reset time
                  $input.pickadate('picker').set('select', moment(d.expenditure_start_date).format('X'))

                } else {
                  // set date
                  $scope.project.definition.financials[i].expenditure_start_date = moment(selectedDate).format('YYYY-MM-DD');
                }
                // close
                $input.pickadate('picker').close();

              }

            }

          });        

          //pickadate api
          // on click
          $( '#ngm-expenditure-start-date-' + d.timestamp ).bind('click', function($e) {
            // set form dirty
            $scope.healthProjectFinancialsForm.$setPristine();
            // open
            $input.pickadate('picker').open();
          });

        },

        // set end datepicker
        setEndTime: function(d, i) {
            
          // set element
          var $input = $( '#ngm-expenditure-end-date-' + d.timestamp ).pickadate({
            selectMonths: true,
            selectYears: 15,
            format: 'dd mmm, yyyy',
            onStart: function(){
              $timeout(function(){
                // set time
                var date = moment(d.expenditure_end_date).format('YYYY-MM-DD');
                $input.pickadate('picker').set('select', date, { format: 'yyyy-mm-dd' } );

              }, 0)
            },           
            onSet: function(event){
              // close on date select
              if(event.select){
                // get date
                var selectedDate = moment(event.select);

                // check dates
                if ( selectedDate && (selectedDate).isBefore(d.expenditure_start_date) ) {
                  // inform
                  Materialize.toast('Please check the dates and try again!', 3000);
                  // reset time
                  $input.pickadate('picker').set('select', moment(d.expenditure_end_date).format('X'))

                } else {
                  // set date
                  $scope.project.definition.financials[i].expenditure_end_date = moment(selectedDate).format('YYYY-MM-DD');
                }
                // close
                $input.pickadate('picker').close();

              }

            }

          });        

          //pickadate api
          // on click
          $( '#ngm-expenditure-end-date-' + d.timestamp ).bind('click', function($e) {
            // set form dirty
            $scope.healthProjectFinancialsForm.$setPristine();
            //open
            $input.pickadate('picker').open();
          });
          
        }

      }

      // on page load
      angular.element(document).ready(function () {

        // order locations by latest updated
        $scope.project.definition.financials = $filter('orderBy')($scope.project.definition.financials, '-createdAt');

        // give a few seconds to render
        $timeout(function() {

          // selects
          $('select').material_select();

          // select
          $('#ngm-beneficiary-category').material_select('update');

          // set start/end
          angular.forEach($scope.project.definition.financials, function(d, i){
            //
            $scope.project.setStartTime(d, i);
            $scope.project.setEndTime(d, i);

          });

          // menu return to list
          $('#go-to-project-list').click(function(){
            $scope.project.cancel();
          });

        }, 1000);

      });
  
  }

]);
