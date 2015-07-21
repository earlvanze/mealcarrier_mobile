
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module("mealcarrier", ["ionic", "mealcarrier.controller"])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if(window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

.config(['$httpProvider', function($httpProvider) {
  // $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
   $httpProvider.defaults.headers.post["Content-Type"] = "application/json; charset=UTF-8";
   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state("login", {
	url: "/login",
	controller: "login_controller",
	templateUrl: "templates/login.html"
    })
    .state("register", {
	url: "/register",
	templateUrl: "templates/register.html"
    })
    .state("request_pickup", {
	url: "/request_pickup",
	controller: "request_controller",
	templateUrl: "templates/request_pickup.html"
    })
    .state("delivery_details", {
	url: "/delivery_details/:place_id",
	controller: "delivery_details_controller",
	templateUrl: "templates/delivery_details.html"
    })
    .state("deliveries", {
	url: "/deliveries",
	controller: "deliveries_controller",
	templateUrl: "templates/deliveries.html"
    })
    ;

    $urlRouterProvider.otherwise("/login");
});
