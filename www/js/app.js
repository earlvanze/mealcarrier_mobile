
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module("mealcarrier", 
  ["ionic", 
  "mealcarrier.controller", 
  "auth0", 
  "angular-storage", 
  "angular-jwt"])

// http://ionicframework.com.br/blog/authentication-in-ionic/
// configure auth0 by calling the init method of the `authProvider
    .config(function($stateProvider,
		     $urlRouterProvider,
		     authProvider,
		     $httpProvider,
		     jwtInterceptorProvider,
		     uiGmapGoogleMapApiProvider) {
    // auth0 stuff
    // authProvider.init({
    //   domain: 'earlco.auth0.com',
    //   clientID: 'MT44T1spfOV6kqlVOBLHQ0ounqwN61dU',
    //   callbackURL: location.href,
    //   loginState: 'login'
    // });

    // jwtInterceptorProvider.tokenGetter = function(store, jwtHelper, auth) {
    jwtInterceptorProvider.tokenGetter = function(store, jwtHelper) {
      var idToken = store.get('token');
      // var refreshToken = store.get('refreshToken');
      // If no token return null
      // if (!idToken || !refreshToken) {
      if (!idToken) {
        return null;
      }
      // If token is expired, get a new one
      if (jwtHelper.isTokenExpired(idToken)) {
        // auth0 stuff
        // return auth.refreshIdToken(refreshToken).then(function(idToken) {
        //   store.set('token', idToken);
        //   return idToken;
        // });

        // This is a promise of a JWT id_token
        return $http({
          url: 'http://mealcarrier.com:8080/authenticate',
          // This makes it so that this request doesn't send the JWT
          skipAuthorization: true,
          method: 'POST'
        }).then(function(response) {
          var id_token = response.data.id_token;
          localStorage.setItem('id_token', id_token);
          return id_token;
        });
      } else {
        return idToken;
      }
    }

	$httpProvider.interceptors.push('jwtInterceptor');

	uiGmapGoogleMapApiProvider.configure({
	    key: "AIzaSyDDE09q45122633N8OC1aoD6kXj56u5vHg",
	    v: '3.17',
	    libraries: "places"
	});
})

.config(['$httpProvider', function($httpProvider) {
  // $httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
   $httpProvider.defaults.headers.post["Content-Type"] = "application/json; charset=UTF-8";
   $httpProvider.defaults.useXDomain = true;
   delete $httpProvider.defaults.headers.common['X-Requested-With'];
}])

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

// .run(function($ionicPlatform, auth) {
//   $ionicPlatform.ready(function() {
//     // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
//     // for form inputs)
//     if(window.cordova && window.cordova.plugins.Keyboard) {
//       cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
//     }
//     if(window.StatusBar) {
//       StatusBar.styleDefault();
//     }
//   });
//   // Hook auth0-angular to all the events it needs to listen to
//   auth.hookEvents();
// })

.run(function($rootScope, store, jwtHelper, $location) {
  // This events gets triggered on refresh or URL change
  $rootScope.$on('$locationChangeStart', function() {
    if (!store.get('token')) {
      var token = store.get('token');
      if (token) {
        if (!jwtHelper.isTokenExpired(token)) {
          // token is not expired
        } else {
          // This is a promise of a JWT id_token
          return $http({
            url: 'http://mealcarrier.com:8080/authenticate',
            // This makes it so that this request doesn't send the JWT
            skipAuthorization: true,
            method: 'POST'
          }).then(function(response) {
            var id_token = response.data.id_token;
            localStorage.setItem('id_token', id_token);
            return id_token;
          });
        }
      }
    } else {
      return token;
    }
  });
})

.config(function($stateProvider, $urlRouterProvider){
    $stateProvider
    .state("login", {
    	url: "/login",
    	controller: "login_controller",
    	templateUrl: "templates/login.html"
    })
    .state("register", {
    	url: "/register",
      controller: "register_controller",
    	templateUrl: "templates/register.html"
    })
    .state("request_pickup", {
    	url: "/request_pickup",
    	controller: "request_controller",
    	templateUrl: "templates/request_pickup.html"
    })
    .state("delivery_details", {
    	url: "/delivery_details/:restaurant_id",
    	controller: "delivery_details_controller",
    	templateUrl: "templates/delivery_details.html",
      data: {
        requiresLogin: true
      }
    })
    .state("deliveries", {
    	url: "/deliveries",
    	controller: "deliveries_controller",
    	templateUrl: "templates/deliveries.html"
    })
    .state("request_details", {
      url: "/request_details/:request_id",
      controller: "request_details_controller",
      templateUrl: "templates/request_details.html",
      data: {
        requiresLogin: true
      }
    })
    .state("payment", {
      url: "/payment",
      controller: "payment_controller",
      templateUrl: "templates/payment.html"
    })
    .state("chat", {
      url: "/chat",
      // controller: "chat_controller",
      // templateUrl: "templates/deliveries.html"
    })
    .state("account", {
      url: "/account",
      // controller: "chat_controller",
      // templateUrl: "templates/deliveries.html"
    })
    ;
    $urlRouterProvider.otherwise("/request_pickup");
    // $urlRouterProvider.otherwise("/request_pickup");
})


;
