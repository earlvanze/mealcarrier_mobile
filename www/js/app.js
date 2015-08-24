
// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module("mealcarrier", 
  ["ionic", 
  "mealcarrier.controller", 
  "auth0", 
  "angular-storage", 
  "angular-jwt",
  "monospaced.elastic",
  "angularMoment"
  ])

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
    .state("checkout", {
      url: "/checkout",
      controller: "checkout_controller",
      templateUrl: "templates/checkout.html"
    })
    .state("braintree_payment", {
      url: "/braintree_payment",
      controller: "braintree_payment_controller",
      templateUrl: "templates/braintree_payment.html"
    })
    .state("messaging", {
      url: "/messaging",
      controller: "messaging_controller",
      templateUrl: "templates/messaging.html"
    })
    .state("account", {
      url: "/account",
      // controller: "account_controller",
      // templateUrl: "templates/deliveries.html"
    })
    ;
    $urlRouterProvider.otherwise("/request_pickup");
    // $urlRouterProvider.otherwise("/request_pickup");
})

// filters
.filter('nl2br', ['$filter',
  function($filter) {
    return function(data) {
      if (!data) return data;
      return data.replace(/\n\r?/g, '<br />');
    };
  }
])

// directives
.directive('autolinker', ['$timeout',
  function($timeout) {
    return {
      restrict: 'A',
      link: function(scope, element, attrs) {
        $timeout(function() {
          var eleHtml = element.html();

          if (eleHtml === '') {
            return false;
          }

          var text = Autolinker.link(eleHtml, {
            className: 'autolinker',
            newWindow: false
          });

          element.html(text);

          var autolinks = element[0].getElementsByClassName('autolinker');

          for (var i = 0; i < autolinks.length; i++) {
            angular.element(autolinks[i]).bind('click', function(e) {
              var href = e.target.href;
              console.log('autolinkClick, href: ' + href);

              if (href) {
                //window.open(href, '_system');
                window.open(href, '_blank');
              }

              e.preventDefault();
              return false;
            });
          }
        }, 0);
      }
    }
  }
])

function onProfilePicError(ele) {
  this.ele.src = ''; // set a fallback
}

function getMockMessages() {
  return {"messages":[{"_id":"535d625f898df4e80e2a125e","text":"Ionic has changed the game for hybrid app development.","userId":"534b8fb2aa5e7afc1b23e69c","date":"2014-04-27T20:02:39.082Z","read":true,"readDate":"2014-12-01T06:27:37.944Z"},{"_id":"535f13ffee3b2a68112b9fc0","text":"I like Ionic better than ice cream!","userId":"534b8e5aaa5e7afc1b23e69b","date":"2014-04-29T02:52:47.706Z","read":true,"readDate":"2014-12-01T06:27:37.944Z"},{"_id":"546a5843fd4c5d581efa263a","text":"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.","userId":"534b8fb2aa5e7afc1b23e69c","date":"2014-11-17T20:19:15.289Z","read":true,"readDate":"2014-12-01T06:27:38.328Z"},{"_id":"54764399ab43d1d4113abfd1","text":"Am I dreaming?","userId":"534b8e5aaa5e7afc1b23e69b","date":"2014-11-26T21:18:17.591Z","read":true,"readDate":"2014-12-01T06:27:38.337Z"},{"_id":"547643aeab43d1d4113abfd2","text":"Is this magic?","userId":"534b8fb2aa5e7afc1b23e69c","date":"2014-11-26T21:18:38.549Z","read":true,"readDate":"2014-12-01T06:27:38.338Z"},{"_id":"547815dbab43d1d4113abfef","text":"Gee wiz, this is something special.","userId":"534b8e5aaa5e7afc1b23e69b","date":"2014-11-28T06:27:40.001Z","read":true,"readDate":"2014-12-01T06:27:38.338Z"},{"_id":"54781c69ab43d1d4113abff0","text":"I think I like Ionic more than I like ice cream!","userId":"534b8fb2aa5e7afc1b23e69c","date":"2014-11-28T06:55:37.350Z","read":true,"readDate":"2014-12-01T06:27:38.338Z"},{"_id":"54781ca4ab43d1d4113abff1","text":"Yea, it's pretty sweet","userId":"534b8e5aaa5e7afc1b23e69b","date":"2014-11-28T06:56:36.472Z","read":true,"readDate":"2014-12-01T06:27:38.338Z"},{"_id":"5478df86ab43d1d4113abff4","text":"Wow, this is really something huh?","userId":"534b8fb2aa5e7afc1b23e69c","date":"2014-11-28T20:48:06.572Z","read":true,"readDate":"2014-12-01T06:27:38.339Z"},{"_id":"54781ca4ab43d1d4113abff1","text":"Create amazing apps - ionicframework.com","userId":"534b8e5aaa5e7afc1b23e69b","date":"2014-11-29T06:56:36.472Z","read":true,"readDate":"2014-12-01T06:27:38.338Z"}],"unread":0};
}

// configure moment relative time
moment.locale('en', {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%d sec",
    m: "a minute",
    mm: "%d minutes",
    h: "an hour",
    hh: "%d hours",
    d: "a day",
    dd: "%d days",
    M: "a month",
    MM: "%d months",
    y: "a year",
    yy: "%d years"
  }
});

;