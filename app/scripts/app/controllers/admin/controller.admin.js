/**
 * @ngdoc function
 * @name ngmReportHubApp.controller:DashboardLoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the ngmReportHub
 */
angular.module('ngmReportHub')
	.controller('DashboardAdminCtrl', ['$scope', '$location', 'ngmUser', function ( $scope, $location, ngmUser ) {
		this.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];

		// login object
		$scope.dashboard = {

			// parent
			ngm: $scope.$parent.ngm

		}

		// username
		$scope.dashboard.username = ngmUser.get() ? ' ' + ngmUser.get().username : '';

		// dews dashboard model
		var model = {
			name: 'dashboard_admin',
			header: {
				div: {
					'class': 'col s12 m12 l12 report-header',
					style: 'border-bottom: 3px ' + $scope.dashboard.ngm.style.defaultPrimaryColor + ' solid;'
				},
				title: {
					'class': 'col s12 m12 l12 report-title',
					title: 'Admin Console - Projects',
					style: 'color: ' + $scope.dashboard.ngm.style.defaultPrimaryColor,
				},
				subtitle: {
					'class': 'col s12 m12 l12 report-subtitle',
					title: 'All health projects for Afghanistan',
				}
			},
			rows: [{
				columns: [{
					styleClass: 's12 m12 l12',
					widgets: [{
						type: 'table',
						card: 'panel',
						style: 'padding:0px; height: ' + $scope.dashboard.ngm.style.height + 'px;',
						config: {
							style: $scope.dashboard.ngm.style,
							templateUrl: '/scripts/widgets/ngm-table/templates/admin.project.list.html',
							tableOptions:{
								count: 10
							},
							request: {
								method: 'POST',
								url: 'http://' + $location.host() + '/api/health/project/getProjectsList',
								data: {
									filter: {}
								}
							}
						}
					}]
				}]
			}]
		};

		// assign model to scope
		$scope.model = model;

		// assign to ngm app scope
		$scope.dashboard.ngm.dashboard = $scope.model;
		
	}]);