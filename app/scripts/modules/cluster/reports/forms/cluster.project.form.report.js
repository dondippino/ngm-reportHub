/**
 * @ngdoc function
 * @name ngmReportHubApp.controller:ClusterProjectFormReportCtrl
 * @description
 * # ClusterProjectFormReportCtrl
 * Controller of the ngmReportHub
 */

angular.module( 'ngm.widget.project.report', [ 'ngm.provider' ])
  .config( function( dashboardProvider ){
    dashboardProvider
      .widget('project.report', {
        title: 'Cluster Reports Form',
        description: 'Cluster Reports Form',
        controller: 'ClusterProjectFormReportCtrl',
        templateUrl: '/scripts/modules/cluster/views/forms/report/form.html'
      });
  })
  .controller( 'ClusterProjectFormReportCtrl', [
    '$scope',
    '$location',
    '$timeout',
    '$filter',
    '$q',
    '$http',
    '$route',
    'ngmUser',
    'ngmData',
    'ngmClusterHelper',
    'config',
    function( $scope, $location, $timeout, $filter, $q, $http, $route, ngmUser, ngmData, ngmClusterHelper, config ){

      // order locations by
      config.report.locations = 
          $filter( 'orderBy' )( config.report.locations, [ 'admin1name', 'admin2name', 'fac_type_name', 'fac_name' ] );

      // set activity descriptions
      $scope.activity_descriptions = ngmClusterHelper.getActivities( config.project, false, false );

      // project
      $scope.project = {
        
        // user
        user: ngmUser.get(),
        
        // app style
        style: config.style,
        
        // project
        definition: config.project,
        
        // report
        report: config.report,

        // default indicators ( 2016 )
        indicators: config.report.report_year === 2016 ? ngmClusterHelper.getIndicators() : ngmClusterHelper.getIndicators( true ),

        // keys to ignore when summing beneficiaries in template ( 2016 )
        skip: [ 'education_sessions', 'training_sessions', 'sessions', 'families', 'notes' ],
        
        // last update
        updatedAt: moment( config.report.updatedAt ).format( 'DD MMMM, YYYY @ h:mm:ss a' ),
        
        // title
        titleFormat: moment( config.report.reporting_period ).format('MMMM, YYYY'),
        
        // lists
        // activity_type: config.project.activity_type,
        activity_descriptions: $scope.activity_descriptions,
        category_types: ngmClusterHelper.getCategoryTypes(),
        beneficiary_types: config.report.report_year === 2016 ? ngmClusterHelper.getBeneficiaries2016( config.project.cluster_id, [] ) : ngmClusterHelper.getBeneficiaries(),
        delivery_types:[{
          delivery_type_id: 'population',
          delivery_type_name: 'New Beneficiaries'
        },{
          delivery_type_id: 'service',
          delivery_type_name: 'Existing Beneficiaries'
        }],
        
        // templates
        templatesUrl: '/scripts/modules/cluster/views/forms/report/',
        locationsUrl: 'locations.html',
        beneficiariesUrl: config.report.report_year === 2016 ? 'beneficiaries/2016/beneficiaries.html' : 'beneficiaries/beneficiaries.html',        
        beneficiariesTrainingUrl: 'beneficiaries/2016/beneficiaries-training.html',
        beneficiariesDefaultUrl: 'beneficiaries/2016/beneficiaries-health-2016.html',
        notesUrl: 'notes.html',

        // cancel and delete empty project
        cancel: function() {
          // update
          $timeout(function() {
            // Re-direct to summary
            $location.path( '/cluster/projects/report/' + $scope.project.definition.id );
          }, 200);
        },

        // add beneficiary
        addBeneficiary: function( $parent ) {
          // sadd
          var sadd = {
            units: 0,
            cash_amount: 0,
            households: 0, 
            sessions: 0, 
            families: 0, 
            boys: 0, 
            girls: 0, 
            men:0, 
            women:0, 
            elderly_men:0, 
            elderly_women:0 
          };
          $scope.inserted = {
            cluster_id: null,
            cluster: null,
            category_type_id: null,
            category_type_name: null,
            beneficiary_type_id: null,
            beneficiary_type_name: null,
            activity_type_id: null,
            activity_type_name: null,
            activity_description_id: null,
            activity_description_name: null,
            delivery_type_id: null,
            delivery_type_name: null
          };

          // merge
          angular.merge( $scope.inserted, sadd );

          // eiewg
          if( $scope.project.definition.cluster_id === 'eiewg' ){
            $scope.inserted.category_type_id = 'category_a';
            $scope.inserted.category_type_name = 'A) Emergency Relief Needs';
          }

          // clone
          var length = $scope.project.report.locations[ $parent ].beneficiaries.length;
          if ( length ) {
            var b = angular.copy( $scope.project.report.locations[ $parent ].beneficiaries[ length - 1 ] );
            delete b.id;
            $scope.inserted = angular.merge( $scope.inserted, b, sadd );
          }
          $scope.project.report.locations[ $parent ].beneficiaries.push( $scope.inserted );
        },

        // display activity
        showActivity: function( $data, $beneficiary ) {
          var selected = [];
          $beneficiary.activity_type_id = $data;
          if($beneficiary.activity_type_id) {
            selected = $filter('filter')( $scope.project.definition.activity_type, { activity_type_id: $beneficiary.activity_type_id }, true);

            // catch for old data
            if( selected[0].cluster_id && selected[0].cluster ) {
              $beneficiary.cluster_id = selected[0].cluster_id;
              $beneficiary.cluster = selected[0].cluster;
            }
            $beneficiary.activity_type_name = selected[0].activity_type_name;
          }
          return selected.length ? selected[0].activity_type_name : 'No Selection!';
        },

        // display description
        showDescription: function( $data, $beneficiary ) {
          var selected = [];
          $beneficiary.activity_description_id = $data;
          if($beneficiary.activity_description_id) {
            selected = $filter('filter')( $scope.project.activity_descriptions, { activity_description_id: $beneficiary.activity_description_id }, true);
            $beneficiary.activity_description_name = selected[0].activity_description_name;
          } 
          return selected.length ? selected[0].activity_description_name : 'No Selection!';
        },

        // display category
        showCategory: function( $data, $beneficiary ) {
          var selected = [];
          $beneficiary.category_type_id = $data;
          if( $beneficiary.category_type_id ) {
            selected = $filter('filter')( $scope.project.category_types, { category_type_id: $beneficiary.category_type_id }, true);
            $beneficiary.category_type_name = selected[0].category_type_name;
          }
          return selected.length ? selected[0].category_type_name : 'No Selection!';
        },

        // display beneficiary
        showBeneficiary: function( $data, $beneficiary ) {
          var selected = [];
          $beneficiary.beneficiary_type_id = $data;
          if ( $beneficiary.beneficiary_type_id ) {
            selected = $filter('filter')( $scope.project.beneficiary_types, { beneficiary_type_id: $beneficiary.beneficiary_type_id }, true);
          }
          if ( selected.length ) {
            $beneficiary.beneficiary_type_name = selected[0].beneficiary_type_name;
            return selected[0].beneficiary_type_name
          } else {
            return 'No Selection!';
          }
        },

        // display delivery
        showDelivery: function( $data, $beneficiary ) {
          var selected = [];
          $beneficiary.delivery_type_id = $data;
          if($beneficiary.delivery_type_id) {
            selected = $filter('filter')( $scope.project.delivery_types, { delivery_type_id: $beneficiary.delivery_type_id }, true);
            $beneficiary.delivery_type_name = selected[0].delivery_type_name;
          }
          return selected.length ? selected[0].delivery_type_name : 'No Selection!';
        },
        
        // display if education/training sessions provided
        showSessions: function( $locationIndex ){
          var display = false;
          var l = $scope.project.report.locations[ $locationIndex ];
          if( l ){
            angular.forEach( l.beneficiaries, function(b){
              if( ( $scope.project.definition.cluster_id !== 'eiewg' )
                  && ( b.activity_description_id )
                  && ( b.activity_description_id.indexOf( 'education' ) !== -1 || b.activity_description_id.indexOf( 'training' ) !== -1 ) ) {
                display = true;
              }
            });
          }
          return display;
        },

        // disable input
        disabledInput: function( $beneficiary, indicator ) {
          var disabled = false;

          // health, mch, ANC, PNC, SBA
          if( $beneficiary.activity_type_id === 'mch' ||
              $beneficiary.activity_description_id === 'antenatal_care' ||
              $beneficiary.activity_description_id === 'postnatal_care' ||
              $beneficiary.activity_description_id === 'skilled_birth_attendant' ){
            if( indicator !== 'women' ){
              disabled = true;
            }
          }

          // health, vaccination
          if( $beneficiary.activity_type_id === 'vaccination' ||
              $beneficiary.activity_description_id === 'penta_3' ||
              $beneficiary.activity_description_id === 'measles' ){
            if( indicator !== 'boys' && indicator !== 'girls' ){
              disabled = true;
            }
          }

          return disabled;
        },

        // cash
        showCash: function( $locationIndex ){
          var display = false;
          var l = $scope.project.report.locations[ $locationIndex ];
          if( l ){
            angular.forEach( l.beneficiaries, function(b){
              if( b.activity_description_id && b.activity_description_id.indexOf('cash') > -1 ){
                display = true;
              }
            });
          }
          return display;
        },

        // update inidcators
        updateInput: function( $parent, $index, indicator, $data ){
          $scope.project.report.locations[ $parent ].beneficiaries[ $index ][ indicator ] = $data;
        },

        // sessions disabled
        rowSessionsDisabled: function( $beneficiary ){
          var disabled = true;
          if( ( $scope.project.definition.cluster_id !== 'eiewg' )
                && ( $beneficiary.activity_description_id )
                && ( $beneficiary.activity_description_id.indexOf( 'education' ) !== -1 || $beneficiary.activity_description_id.indexOf( 'training' ) !== -1 ) ) {
            disabled = false
          }
          return disabled;
        },
        
        // disable save form
        rowSaveDisabled: function( $data ){
          var disabled = true;
          if ( $data.category_type_id && $data.activity_type_id && $data.activity_description_id && $data.beneficiary_type_id && $data.delivery_type_id &&
                $data.units >= 0 && $data.sessions >= 0 && $data.households >= 0 && $data.families >= 0 && $data.boys >= 0 && $data.girls >= 0 && $data.men >= 0 && $data.women >= 0 && $data.elderly_men >= 0 && $data.elderly_women >= 0 ) {
              disabled = false;
          }
          return disabled;
        },

        // remove location from location list
        removeBeneficiaryModal: function( $parent, $index ) {
          // set location index
          $scope.project.locationIndex = $parent;
          $scope.project.beneficiaryIndex = $index;
          // open confirmation modal
          $( '#beneficiary-modal' ).openModal({ dismissible: false });
        },

        // remove beneficiary
        removeBeneficiary: function() {

          // msg
          // Materialize.toast( 'Processing Beneficiary...' , 3000, 'note');
          
          // b
          var b = $scope.project.report.locations[ $scope.project.locationIndex ].beneficiaries[ $scope.project.beneficiaryIndex ];

          // setReportRequest
          var setBeneficiariesRequest = {
            method: 'POST',
            url: 'http://' + $location.host() + '/api/cluster/report/removeBeneficiary',
            data: {
              beneficiary: b
            }
          }          
          
          // set report
          ngmData.get( setBeneficiariesRequest ).then( function( result ){

            // remove
            $scope.project.report.locations[ $scope.project.locationIndex ].beneficiaries.splice( $scope.project.beneficiaryIndex, 1 );

            // save report
            $scope.project.save( false, false );            
          });
        },

        // save form on enter
        keydownSaveForm: function(){
          setTimeout(function(){
            $('.editable-input').keydown(function (e) {
              var keypressed = e.keyCode || e.which;
              if (keypressed == 13) {
                $('.save').trigger('click');
              }
            });
          }, 0 );
        },

        // ennsure all locations contain at least one complete beneficiaries 
        formComplete: function() {
          var beneficiaries = 0;
          var rowComplete = 0;
          angular.forEach( $scope.project.report.locations, function( l ){
            beneficiaries += l.beneficiaries.length;
            if ( l.beneficiaries.length ) {
              angular.forEach( l.beneficiaries, function( b ){
                if ( !$scope.project.rowSaveDisabled( b ) ) {
                  rowComplete++;
                }
              });
            } else {
              rowComplete++;
            }
          });
          // 
          if( rowComplete >= beneficiaries ){
            return true;
          } else {
            return false;  
          }
        },

        // cofirm exit if changes
        modalConfirm: function( modal ){
          // if not pristine, confirm exit
          if ( modal === 'complete-modal' ) {
            $( '#' + modal ).openModal( { dismissible: false } );
          } else {
            $scope.project.cancel();
          }
        },

        // save 
        save: function( complete, display_modal ){

          // if textarea
          $( 'textarea[name="notes"]' ).removeClass( 'ng-untouched' ).addClass( 'ng-touched' );
          $( 'textarea[name="notes"]' ).removeClass( 'invalid' ).addClass( 'valid' ); 

          // report
          // $scope.project.report.submit = true;
          $scope.project.report.report_status = complete ? 'complete' : 'todo';
          $scope.project.report.report_submitted = moment().format();

          // update project details of report + locations + beneficiaries
          $scope.project.report = 
              ngmClusterHelper.getCleanReport( $scope.project.definition, $scope.project.report );
          
          // msg
          Materialize.toast( 'Processing Report...' , 3000, 'note');

          // setReportRequest
          var setReportRequest = {
            method: 'POST',
            url: 'http://' + $location.host() + '/api/cluster/report/setReport',
            data: {
              report: $scope.project.report
            }
          }   
          
          // set report
          ngmData.get( setReportRequest ).then( function( report ){
            
            // updated & popluateAll() report
            $scope.project.report = report;
            $scope.project.report.submit = false;
            // order locations by
            $scope.project.report.locations = $filter( 'orderBy' )( $scope.project.report.locations, [ 'admin1name', 'admin2name', 'fac_type_name', 'fac_name' ] );
            
            // user msg
            var msg = 'Project Report for  ' + moment( $scope.project.report.reporting_period ).format('MMMM, YYYY') + ' ';
                msg += complete ? 'Submitted!' : 'Saved!';
            
            // msg
            Materialize.toast( msg , 3000, 'success');
            // set trigger
            $('.modal-trigger').leanModal();
            
            // Re-direct to summary
            if ( $scope.project.report.report_status !== 'complete' ) {

              // notification modal
              if( display_modal ){
                // $( '#save-modal' ).openModal({ dismissible: false });
                $timeout(function() {
                  $location.path( '/cluster/projects/report/' + $scope.project.definition.id );
                }, 600);
              }

            } else {
              $timeout(function() {
                $location.path( '/cluster/projects/report/' + $scope.project.definition.id );
              }, 600);
            }
          });

        }

      }

  }

]);

