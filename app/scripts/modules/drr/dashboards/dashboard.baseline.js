/**
 * @ngdoc function
 * @name ngmReportHubApp.controller:DashboardFloodRiskCtrl
 * @description
 * # LoginCtrl
 * Controller of the ngmReportHub
 */
angular.module('ngmReportHub')
	.controller('DashboardBaselineCtrl', ['$scope', '$http', '$route', '$location', 'ngmUser', 'ngmData', function ($scope, $http, $route, $location, ngmUser, ngmData) {
		this.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];

		// hide left menu branding
		$('.ngm-brand').css('display', 'none');
		$('.ngm-menu-footer').css('display', 'none');

		// init empty model
		$scope.model = {
			rows: [{}]
		};

		// floodRisk object
		$scope.dashboard = {

			// parent
			ngm: $scope.$parent.ngm,			

			// current user
			user: ngmUser.get(),

			// data lookup
			data: {
				'afghanistan': {'id':'*','name':'Afghanistan'},
				'badakhshan': { id:15, name:'Badakhshan'},
				'badghis': { id:29, name:'Badghis'},
				'baghlan': { id:9, name:'Baghlan'},
				'balkh': { id:18, name:'Balkh'},
				'bamyan': { id:10,'name':'Bamyan'},
				'daykundi': { id:22, name:'Daykundi'},
				'farah': { id:31, name:'Farah'},
				'faryab': { id:28, name:'Faryab'},
				'ghazni': { id:11, name:'Ghazni'},
				'ghor': { id:21, name:'Ghor'},
				'hilmand': { id:32, name:'Hilmand'},
				'hirat': { id:30, name:'Hirat'},
				'jawzjan': { id:27, name:'Jawzjan'},
				'kabul': { id:1, name:'Kabul'},
				'kandahar': { id:33, name:'Kandahar'},
				'kapisa': { id:2, name:'Kapisa'},
				'khost': { id:26, name:'Khost'},
				'kunar': { id:13, name:'Kunar'},
				'kunduz': { id:17, name:'Kunduz'},
				'laghman': { id:7, name:'Laghman'},
				'logar': { id:5, name:'Logar'},
				'nangarhar': { id:6, name:'Nangarhar'},
				'nimroz': { id:34, name:'Nimroz'},
				'nuristan': { id:14, name:'Nuristan'},
				'paktika': { id:25, name:'Paktika'},
				'paktya': { id:12, name:'Paktya'},
				'panjsher': { id:8, name:'Panjsher'},
				'parwan': { id:3, name:'Parwan'},
				'samangan': { id:19, name:'Samangan'},
				'sar-e-pul': { id:20, name:'Sar-e-Pul'},
				'takhar': { id:16, name:'Takhar'},
				'uruzgan': { id:23, name:'Uruzgan'},
				'wardak': { id:4, name:'Wardak'},
				'zabul': { id:24, name:'Zabul'}
			},

			// rows for floodRisk menu
			getRows: function() {
				
				// menu rows
				var rows = [];

				// for each disease
				angular.forEach($scope.dashboard.data, function(d, key){
					rows.push({
						'title': d.name,
						'param': 'province',
						'active': key,
						'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
						'href': '#/immap/drr/baseline/' + key
					});
				});

				return rows;
			},

			// set dashboards
			setDashboard: function(data) {

				// FloodRisk dashboard model
				$scope.model = {
					name: 'drr_baseline_dashboard',
					header: {
						div: {
							'class': 'col s12 m12 l12 report-header',
							style: 'border-bottom: 3px ' + $scope.dashboard.ngm.style.defaultPrimaryColor + ' solid;'
						},
						title: {
							'class': 'col s12 m12 l12 report-title',
							title: 'iMMAP | Baseline | ' + $scope.dashboard.data[$route.current.params.province].name,
							style: 'color: ' + $scope.dashboard.ngm.style.defaultPrimaryColor,
						},
						subtitle: {
							'class': 'col s12 m12 l12 report-subtitle',
							title: 'Baseline Key Indicators for ' + $scope.dashboard.data[$route.current.params.province].name,
						},
					},
					menu: [{
						'search': true,
						'id': 'search-flood-place',
						'icon': 'place',
						'title': 'Province',
						'class': 'teal lighten-1 white-text',
						'rows': $scope.dashboard.getRows()
					}],
					rows: [{
						columns: [{
							styleClass: 's12 m12 l3',
							widgets: [{
								type: 'stats',
								card: 'card-panel stats-card white grey-text text-darken-2',
								config: {
									title: 'Total Population',
									data: { value: data.Population },
									display: { 
										fractionSize: 0
									}
								}
							}]
						},{
							styleClass: 's12 m12 l3',
							widgets: [{
								type: 'stats',
								card: 'card-panel stats-card white grey-text text-darken-2',
								config: {
									title: 'Settlements',
									data: { value: data.settlements },
									display: { 
										fractionSize: 0
									}
								}
							}]
						},{
							styleClass: 's12 m12 l3',
							widgets: [{
								type: 'stats',
								card: 'card-panel stats-card white grey-text text-darken-2',
								config: {
									title: 'Health Facilities',
									data: { value: 0 },
									display: { 
										fractionSize: 0
									}
								}
							}]
						},{
							styleClass: 's12 m12 l3',
							widgets: [{
								type: 'stats',
								card: 'card-panel stats-card white grey-text text-darken-2',
								config: {
									title: 'Road (KM)',
									data: { value: 0 },
									display: { 
										fractionSize: 0
									}
								}
							}]
						}]
					},{
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'highchart',
								style: 'height: 310px;',
								card: 'card-panel stats-card white grey-text text-darken-2',
								config: {
									title: 'Population by Land Type',
									chartConfig: {
										options: {
											chart: {
												type: 'bar',
												height: 260,
											},
											tooltip: {
												pointFormat: '<b>{point.y:,.0f}</b>'
											},
											legend: {
												enabled: false
											}																	
										},
										title: {
											text: ''
										},
										xAxis: {
			                categories: [
			                	'Barren Land', 
			                	'Built-Up', 
			                	'Forest & Shrubs',
			                	'Fruit Trees',
			                	'Irrigated Agg Land',
			                	'Permanent Snow',
			                	'Rainfeld Agg Land',
			                	'Rangeland',
			                	'Sand Cover',
			                	'Vineyards',
			                	'Water Body & Marshland'
			                ],
											labels: {
												rotation: 0,
												style: {
													fontSize: '12px',
													fontFamily: 'Roboto, sans-serif'
												}
											}
										},
										yAxis: {
											min: 0,
											title: {
												text: 'Population'
											}
										},
				            series: [{
				                name: 'Population',
				                color: '#7cb5ec',
												data: [ 
													data.barren_land_pop,
												  data.built_up_pop,
												  data.forest_pop,
												  data.fruit_trees_pop,
												  data.irrigated_agricultural_land_pop,
												  data.permanent_snow_pop,
												  data.rainfed_agricultural_land_pop,
												  data.rangeland_pop,
												  data.sandcover_pop,
												  data.vineyards_pop,
												  data.water_body_pop
												]
				            }]
									}
								}
							}]
						}]
					},{
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'highchart',
								style: 'height: 310px;',
								card: 'card-panel stats-card white grey-text text-darken-2',
								config: {
									title: 'Area (sqKm) by Land Type',
									chartConfig: {
										options: {
											chart: {
												type: 'bar',
												height: 260,
											},
											tooltip: {
												pointFormat: '<b>{point.y:,.0f} km sq</b>'
											},
											legend: {
												enabled: false
											}																	
										},
										title: {
											text: ''
										},
										xAxis: {
			                categories: [
			                	'Barren Land', 
			                	'Built-Up', 
			                	'Forest & Shrubs',
			                	'Fruit Trees',
			                	'Irrigated Agg Land',
			                	'Permanent Snow',
			                	'Rainfeld Agg Land',
			                	'Rangeland',
			                	'Sand Cover',
			                	'Vineyards',
			                	'Water Body & Marshland'
			                ],
											labels: {
												rotation: 0,
												style: {
													fontSize: '12px',
													fontFamily: 'Roboto, sans-serif'
												}
											}
										},
										yAxis: {
											min: 0,
											title: {
												text: 'Area (sqKm)'
											}
										},
				            series: [{
				                name: 'Population',
				                color: '#78909c',
												data: [ 
													data.barren_land_area,
												  data.built_up_area,
												  data.forest_area,
												  data.fruit_trees_area,
												  data.irrigated_agricultural_land_area,
												  data.permanent_snow_area,
												  data.rainfed_agricultural_land_area,
												  data.rangeland_area,
												  data.sandcover_area,
												  data.vineyards_area,
												  data.water_body_area
												]
				            }]
									}
								}
							}]
						}]
					},{						
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'html',
								card: 'card-panel',
								style: 'padding:0px; height: 90px; padding-top:10px;',
								config: {
									html: $scope.dashboard.ngm.footer
								}
							}]
						}]
					}]

				};

				// assign to ngm app scope
				$scope.dashboard.ngm.dashboard.model = $scope.model;				

			}

		};

		// flag for geonode API
		$scope.dashboard.flag = $scope.dashboard.data[$route.current.params.province].id === '*' ? 'entireAfg' : 'currentProvince';

		// request data
		ngmData.get({
			method: 'POST',
			url: 'http://asdc.immap.org/geoapi/floodrisk/',
			headers: { 'Content-Type': 'application/json' },
			data: {
				spatialfilter: [],
				flag: $scope.dashboard.flag,
				code: $scope.dashboard.data[$route.current.params.province].id
			}
		}).then(function(data){
			// assign data
			$scope.dashboard.setDashboard(data);
		});
		
	}]);