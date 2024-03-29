angular.module("mealcarrier.controller", ["mealcarrier.services", "mealcarrier.formValidateAfter", "uiGmapgoogle-maps"])

.controller("menu_controller", function($scope, $ionicSideMenuDelegate, $state){

})

// .controller("login_controller", function($scope, $http, $state, auth, store, ){
.controller("login_controller", function($scope, $http, $state, store, jwtHelper){
    $scope.credentials = {};
    $scope.authenticate = function(){
		$http({
		    url: "http://mealcarrier.com:8080/authenticate",
		    method: "POST",
		    data:{
				"email": $scope.credentials.email,
				"password": $scope.credentials.password
		    }
		})
		.then(function($response){
		    //success
		    console.log($response);
		    if (!$response.data.success){
	    		console.log($response.data.message)
		    } else {
		        // Login was successful
			    // We need to save the information from the login
			    $scope.credentials.token = $response.data.token;
			    store.set('credentials', $scope.credentials);
			    store.set('user_id', jwtHelper.decodeToken($response.data.token)._id);
			    store.set('token', $response.data.token);
			    console.log(store.get('user'));
		    	console.log($response.data.message);
    		    console.log($scope.credentials.token);
    		    // console.log(jwtHelper.decodeToken(store.get('token')));
		    	$state.go('request_pickup');
		    }
		}, function($response){
		    console.log($response);
		    console.log("Error: Can't connect to server.");
		    //error
		});
	}

	// If using Auth0.com to Authenticate
	// auth.signin({
	// 	authParams: {
	// 		// This asks for the refresh token
	// 		// So that the user never has to log in again
	// 		scope: 'openid offline_access',
	// 		// This is the device name
	// 		device: 'Mobile device'
	// 	},
	// 	// Make the widget non closeable
	// 	standalone: true
	// 	}, function(profile, token, accessToken, state, refreshToken) {
	// 	      // Login was successful
	// 		// We need to save the information from the login
	// 		store.set('profile', profile);
	// 		store.set('token', token);
	// 		store.set('refreshToken', refreshToken);
	// 		$state.go('tab.dash');
	// 	}, function(error) {
	// 	// Oops something went wrong during login:
	// 	console.log("There was an error logging in", error);
	// });
})

.controller("register_controller", function($scope, $http, $state){

    $scope.user = {};
    $scope.register = function(){
		$http({
		    url: "http://mealcarrier.com:8080/register",
		    method: "POST",
		    data:{
		    	"first_name": $scope.user.first_name,
		    	"last_name": $scope.user.last_name,
				"email": $scope.user.email,
				"password": $scope.user.password,
				"confirm_password": $scope.user.confirm_password
		    }
		})
		.then(function($response){
		    //success
		    // console.log($scope.user.token);
		    if (!$response.data.success){
		    	console.log($response.data.message)
		    } else {
		    	console.log($response.data.message);
			    $scope.user.token = $response.data.token;
    		    console.log($scope.user.token);
		    	$state.go('request_pickup');
		    }
		},
		function($response){
		    console.log($response);
		    console.log("Error: Can't connect to server.");
		    //error
		});
	}
})

.controller("request_controller", function($scope, $q, Restaurants){
	var promise = Restaurants.get_all();
	promise.then(
	    function($restaurants){
			$scope.restaurants = $restaurants;
	    },
	    function(error){
			console.log("Error: " + error);
	    }
	);
	
	$scope.try_updating = function(){
	    var promise = Restaurants.get_all();
	    promise.then(
			function($restaurants){
			    $scope.restaurants = $restaurants;
			},
			function(error){
			    console.log("Error: " + error);
			}
		);
	}
	$scope.today = Date.now;
})

.controller("delivery_details_controller", function($scope, $stateParams, $http, store, $state, uiGmapGoogleMapApi, $ionicLoading, Request){
	// $ionicLoading.show();
	$scope.request = {};
    $scope.map_ready = false;
    
	navigator.geolocation.getCurrentPosition(function($position){
	    // success!
	    setup_map(parseFloat($position.coords.latitude), parseFloat($position.coords.longitude));
	}, function($error){
	    setup_map({latitude: 0, longitude: 0});
	    // error!
	});

	var geocoder;	
	var setup_map = function($latitude, $longitude){
	    uiGmapGoogleMapApi.then(function(maps) {
			geocoder = new google.maps.Geocoder;
			$scope.map = {center: {latitude: parseFloat($latitude), longitude: parseFloat($longitude)}, zoom: 16};
			$scope.marker = {coords: {latitude: parseFloat($latitude), longitude: parseFloat($longitude)},
				id: "me",
					options: {draggable: true},
					events: {
						dragend: function(map, eventname, eventargs){
							update_geocode();
						}
					}
				};
		update_geocode();
		$scope.map_ready = true;
			// $ionicLoading.hide();
	    });
	}

	var update_geocode = function(){
	    geocoder.geocode({"location": {lat: $scope.marker.coords.latitude, lng: $scope.marker.coords.longitude}}, function($results, $status){
			if($status == "OK"){
			    $scope.marker.pretty_address = $results[0].formatted_address;
			}else{
			    $scope.marker.pretty_address = $status;
			}
			$scope.$apply();
	    });
	}

    
    // still needed?
    // delete?
	$scope.geocode = function(){
	    geocoder.geocode({"address": $scope.marker.pretty_address}, function($results, $status){
			if($status == "ZERO_RESULTS"){
			    // do something!
			}
			if($results.length == 1){
			    var $new_coords = $results[0].geometry.location;
			    $scope.marker.coords.latitude = $new_coords.k;
			    $scope.marker.coords.longitude = $new_coords.D;
			    $scope.map.center.latitude = $new_coords.k;
			    $scope.map.center.longitude = $new_coords.D;
			    $scope.marker.pretty_address = $results[0].formatted_address;
			    $scope.$apply();
			}else{
			    // do something!
			}
	    });
	}
	
	$scope.submit_request = function(){
		$scope.request.dropoff_latitude = $scope.marker.coords.latitude;
		$scope.request.dropoff_longitude = $scope.marker.coords.longitude;
		$scope.request.pickup_latitude = 0;
		$scope.request.pickup_longitude = 0;
		$scope.request.restaurant_id = $stateParams.restaurant_id;
	    $scope.request.delivery_notes = $scope.request.delivery_notes;
	    request = Request.set($scope.request);
		$state.go('checkout');
	 //    $http({
		// 	url: "http://mealcarrier.com:8080/requests/create",
		// 	method: "POST",
		// 	data: {
		// 	    user_id: store.get('user_id'),
		// 	    dropoff_latitude: $scope.marker.coords.latitude,
		// 	    dropoff_longitude: $scope.marker.coords.longitude,
		// 	    pickup_latitude: 0,
		// 	    pickup_longitude: 0,
		// 	    restaurant_id: $stateParams.restaurant_id,
		// 	    delivery_notes: $scope.request.delivery_notes
		// 	}
	 //    })
		// .then(function($response){
		//     //success
		//     console.log($response);
		//     $state.go('payment');
		// }, function($response){
		//     alert("error");
		//     console.log("Error: Could not submit request.");
		//     //error
		// });
	 //    console.log("all done with request")
	}
})

.controller("deliveries_controller", function($scope, $http, $state, store){
    $scope.pull_requests = function(){
    	$http({
		    method: "GET",
		    url: "http://mealcarrier.com:8080/requests/available"
		})
		.then(function($response){
		    //success
		    $scope.requests = $response.data;
		    console.log($scope.requests);
		}, function($response){
		    console.log($response);
		    console.log("Error: Can't connect to server or not authorized.");
		    //error
		});
    }
})

    .controller("request_details_controller", function($scope, $stateParams, $http, store, $state, uiGmapGoogleMapApi, $ionicLoading, $ionicPopup){
	
	// $ionicLoading.show();
	$scope.request = {};
	$scope.map_ready = false;
	$scope.markers = [];
	
	
	uiGmapGoogleMapApi.then(function(maps){
	    // get details for specific request
	    $http({
		method: "GET",
		url: "http://mealcarrier.com:8080/requests/" + $stateParams.request_id
	    })
		.then(function($response){
		    //success
		    $scope.markers[0] = {latitude: $response.data.pickup_location.latitude,
					 longitude: $response.data.pickup_location.longitude,
					 icon: "img/pickup_marker_icon.png",
					 id: "pickup"};
		    $scope.request = $response.data;

		    // dropoff_location[1] is currently set to latitude, as returned by the server.
		    // dropoff_location[0] is the longitude. This should really be an object instead of an array, or at least the array should be in the right order. The code is consistent throughout the app though.


		    // try to get current location
		    navigator.geolocation.getCurrentPosition(function($position){
			// success!

			my_latlng = getLatLngFromCoords(parseFloat($position.coords.latitude), parseFloat($position.coords.longitude));
			dropoff_latlng = getLatLngFromCoords($scope.request.dropoff_location[1], $scope.request.dropoff_location[0]);
			pickup_latlng = getLatLngFromCoords($scope.markers[0].latitude, $scope.markers[0].longitude);			
			
			$scope.markers[1] = {
			    latitude: parseFloat($position.coords.latitude),
			    longitude: parseFloat($position.coords.longitude),
			    icon: "img/current_location_marker_icon.png",
			    id: "myself"
			};
			$scope.markers[2] = {
			    latitude: parseFloat($scope.request.dropoff_location[1]),
			    longitude: parseFloat($scope.request.dropoff_location[0]),
			    icon: "img/dropoff_marker_icon.png",
			    id: "dropoff"
			};
			setup_map(parseFloat($position.coords.latitude), parseFloat($position.coords.longitude));
			
		    }, function($error){
			alert($error);
			console.log($error);
			// error!
		    });

		    
		}, function($response){
		    //error
		    console.log($response);
		    console.log("Error: Can't connect to server or not authorized.");
		});
	});
	var directionsService;
	$scope.points = [];
	$scope.stroke = {
	    color: "#57068C",
	    weight: 2
	};
	var setup_map = function($latitude, $longitude){
	    $scope.map = {center: {latitude: parseFloat($scope.request.dropoff_location[1]), longitude: parseFloat($scope.request.dropoff_location[0])}, zoom: 16};
	    directionsService = new google.maps.DirectionsService();
	    calcRoute(my_latlng, pickup_latlng);
	    calcRoute(pickup_latlng, dropoff_latlng);
	    $scope.map_ready = true;
	};

	var calcRoute = function(start, end) {
	    var request = {
		origin:start,
		destination:end,
		travelMode: google.maps.TravelMode.WALKING
	    };
	    directionsService.route(request, function(response, status) {
		if (status == google.maps.DirectionsStatus.OK) {
		    $scope.points = $scope.points.concat(response.routes[0].overview_path);
		} else {
		    var alertPopup = $ionicPopup.alert({
			title: 'Cannot find address at this location!',
			template: 'Please try again!'
                    });
                    alertPopup.then(function (res) {
			// console.log('Google route unsuccesful! Please try again!');
                    });
		}
	    });
	}
	

	function getLatLngFromCoords($latitude, $longitude) {
	    return new google.maps.LatLng(parseFloat($latitude), parseFloat($longitude)); 
	}
	
	$scope.accept_delivery = function(){
	    // console.log("Confirming delivery");
	    $http({
			url: "http://mealcarrier.com:8080/requests/" + $stateParams.request_id,
			method: "PUT",
			data: {
			    accepted: true,
			    carrier_id: store.get('user_id'),
			    accepted_time: Date.now()
			}
	    })
		.then(function($response){
		    //success
		    console.log($response);
		    $state.go('messages');
		    console.log("delivery accepted");
		}, function($response){
		    console.log("Error: Could not submit request.");
		    //error
		});
	}
    })

.controller("checkout_controller", function($scope, $http, $state, $stateParams, store, Request, PaymentMethods, $ionicPopup){
	$scope.payment_methods = [];
	PaymentMethods.get().promise.then(function(response){
		$scope.payment_methods = response;
		console.log(response);
	});

	$scope.confirm = function() {
		$http({
		    url: "http://mealcarrier.com:8080/users/" + store.get('user_id') + "/payment_methods",
		    method: "POST",
		    data: {
		    	payment_method_nonce: "fake-valid-nonce"
		    	// payment_method_nonce: $stateParams.payment_method_nonce
		    }
		})
		.then(function($response){
		    //success
		    // save payment_method_token
		    console.log($response.data.payment_method_token);
		    // PaymentMethods.add($response.data.payment_method_token);
		    console.log($response.data.message);
			var promise = request.submit();
			promise.then(
			    function(data){
			    	// success
					// console.log(data);
					if (!data.success) {
					    console.log(data.message);
					} else {
					    var alertPopup = $ionicPopup.alert({
							title: 'Request created!',
							template: 'We will notify you when someone has accepted to fulfill your request.'
	                    });
	                    alertPopup.then(function (res) {

	                    });
					}
			    },
			    function(error){
			    	// error
					console.log("Error: " + error);
			    }
			);
		}, function($response){
		    console.log("Error: Could not submit request.");
		    //error
		});
	}
})

.controller("braintree_payment_controller", function($scope, $http, $state, $stateParams, store, Request, PaymentMethods, BraintreeClientToken, $ionicPopup){

	// This clientToken has been generated by the Meal Carrier server.
	BraintreeClientToken.get().promise.then(function(response){
		clientToken = response;
		// console.log(response);
		$scope.show_button = false;
		braintree.setup(clientToken, "dropin", {
			container: "payment-form",
			singleUse: false,
			onReady: function() {
				console.log('Braintree is ready');
				$scope.$apply(function(){
					$scope.show_button = true;
		        });
			},
	    	onPaymentMethodReceived: function(obj) {
			    // Do some logic in here.
			    // When you're ready to submit the form:
			}
		});
	});

	$scope.confirm = function() {
		$http({
		    url: "http://mealcarrier.com:8080/users/" + store.get('user_id') + "/payment_methods",
		    method: "POST",
		    data: {
		    	payment_method_nonce: "fake-valid-nonce"
		    	// payment_method_nonce: $stateParams.payment_method_nonce
		    }
		})
		.then(function($response){
		    //success
		    // save payment_method_token
		    console.log($response.data.payment_method_token);
		    // PaymentMethods.add($response.data.payment_method_token);
		    console.log($response.data.message);
			var promise = Request.submit();
			promise.then(
			    function(data){
			    	// success
					// console.log(data);
					if (!data.success) {
					    console.log(data.message);
					} else {
					    var alertPopup = $ionicPopup.alert({
							title: 'Request created!',
							template: 'We will notify you when someone has accepted to fulfill your request.'
	                    });
	                    alertPopup.then(function (res) {
            			    $state.go('messages');
	                    });
					}
			    },
			    function(error){
			    	// error
					console.log("Error: " + error);
			    }
			);
		}, function($response){
		    console.log("Error: Could not submit request.");
		    //error
		});
	}
})


    .controller("messages_controller", function($scope, $ionicScrollDelegate){
	var User = {
	    get: function(string){
		return 13;
	    }
	};

	$scope.my_id = User.get("id");
	
	var $messages = [
	    {
		to: 13,
		from: 11,
		text: "This is a thing"
	    },
	    {
		to: 13,
		from: 11,
		text: "Listen to me"
	    },
	    {
		to: 11,
		from: 13,
		text: "Yes. I am excited to work."
	    },
	    {
		to: 13,
		from: 11,
		text: "Blah blah blah blah"
	    },
	    {
		to: 11,
		from: 13,
		text: "Tell my why I can't see too far."
	    },
	    {
		to: 13,
		from: 11,
		text: "This text makes no sense"
	    },
	    {
		to: 13,
		from: 11,
		text: "I agree?"
	    }
	];

	$scope.send_message = function(){
	    $scope.messages.push(
		{
		    to: 11,
		    from: 13,
		    text: $scope.new_message
		}
	    );
	    $scope.new_message = "";
	    $ionicScrollDelegate.scrollBottom();
	}
	
	
	$scope.messages = $messages;
    })





.controller('messaging_controller', ['$scope', '$rootScope', '$state',
  '$stateParams', 'MockService', '$ionicActionSheet',
  '$ionicPopup', '$ionicScrollDelegate', '$timeout', '$interval',
  function($scope, $rootScope, $state, $stateParams, MockService,
    $ionicActionSheet,
    $ionicPopup, $ionicScrollDelegate, $timeout, $interval) {

    // mock acquiring data via $stateParams
    $scope.toUser = {
      _id: '534b8e5aaa5e7afc1b23e69b',
      pic: 'http://ionicframework.com/img/docs/venkman.jpg',
      username: 'Venkman'
    }

    // this could be on $rootScope rather than in $stateParams
    $scope.user = {
      _id: '534b8fb2aa5e7afc1b23e69c',
      pic: 'http://ionicframework.com/img/docs/mcfly.jpg',
      username: 'Marty'
    };

    $scope.input = {
      message: localStorage['userMessage-' + $scope.toUser._id] || ''
    };

    var messageCheckTimer;

    var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
    var footerBar; // gets set in $ionicView.enter
    var scroller;
    var txtInput; // ^^^

    $scope.$on('$ionicView.enter', function() {
      console.log('UserMessages $ionicView.enter');

      getMessages();
	$timeout(function() {
	    footerBar = angular.element(".bar-footer");
	    scroller = angular.element("#userMessagesView .scroll-content");
	    txtInput = angular.element(".bar-footer textarea");
      }, 5000);

      messageCheckTimer = $interval(function() {
        // here you could check for new messages if your app doesn't use push notifications or user disabled them
      }, 20000);
    });

    $scope.$on('$ionicView.leave', function() {
      console.log('leaving UserMessages view, destroying interval');
      // Make sure that the interval is destroyed
      if (angular.isDefined(messageCheckTimer)) {
        $interval.cancel(messageCheckTimer);
        messageCheckTimer = undefined;
      }
    });

    $scope.$on('$ionicView.beforeLeave', function() {
      if (!$scope.input.message || $scope.input.message === '') {
        localStorage.removeItem('userMessage-' + $scope.toUser._id);
      }
    });

    function getMessages() {
      // the service is mock but you would probably pass the toUser's GUID here
      MockService.getUserMessages({
        toUserId: $scope.toUser._id
      }).then(function(data) {
        $scope.doneLoading = true;
        $scope.messages = data.messages;

	  /*
            $timeout(function() {
            viewScroll.scrollBottom();
            }, 6000);
	  */
      });
    }

    $scope.$watch('input.message', function(newValue, oldValue) {
      console.log('input.message $watch, newValue ' + newValue);
      if (!newValue) newValue = '';
      localStorage['userMessage-' + $scope.toUser._id] = newValue;
    });

    $scope.sendMessage = function(sendMessageForm) {
      var message = {
        toId: $scope.toUser._id,
        text: $scope.input.message
      };

      // if you do a web service call this will be needed as well as before the viewScroll calls
      // you can't see the effect of this in the browser it needs to be used on a real device
      // for some reason the one time blur event is not firing in the browser but does on devices
      keepKeyboardOpen();
      
      //MockService.sendMessage(message).then(function(data) {
      $scope.input.message = '';

      message._id = new Date().getTime(); // :~)
      message.date = new Date();
      message.username = $scope.user.username;
      message.userId = $scope.user._id;
      message.pic = $scope.user.picture;

      $scope.messages.push(message);

      $timeout(function() {
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 5000);

      $timeout(function() {
        $scope.messages.push(MockService.getMockMessage());
        keepKeyboardOpen();
        viewScroll.scrollBottom(true);
      }, 2000);

      //});
    };
    
    // this keeps the keyboard open on a device only after sending a message, it is non obtrusive
    function keepKeyboardOpen() {
      console.log('keepKeyboardOpen');
      txtInput.one('blur', function() {
        console.log('textarea blur, focus back on it');
        txtInput[0].focus();
      });
    }

    $scope.onMessageHold = function(e, itemIndex, message) {
      console.log('onMessageHold');
      console.log('message: ' + JSON.stringify(message, null, 2));
      $ionicActionSheet.show({
        buttons: [{
          text: 'Copy Text'
        }, {
          text: 'Delete Message'
        }],
        buttonClicked: function(index) {
          switch (index) {
            case 0: // Copy Text
              //cordova.plugins.clipboard.copy(message.text);

              break;
            case 1: // Delete
              // no server side secrets here :~)
              $scope.messages.splice(itemIndex, 1);
              $timeout(function() {
                viewScroll.resize();
              }, 5000);

              break;
          }
          
          return true;
        }
      });
    };

    // this prob seems weird here but I have reasons for this in my app, secret!
    $scope.viewProfile = function(msg) {
      if (msg.userId === $scope.user._id) {
        // go to your profile
      } else {
        // go to other users profile
      }
    };
    
    // I emit this event from the monospaced.elastic directive, read line 480
    $scope.$on('taResize', function(e, ta) {
      console.log('taResize');
      if (!ta) return;
      
      var taHeight = ta[0].offsetHeight;
      console.log('taHeight: ' + taHeight);
      
      if (!footerBar) return;
      
      var newFooterHeight = taHeight + 10;
      newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;
      
      footerBar.style.height = newFooterHeight + 'px';
      scroller.style.bottom = newFooterHeight + 'px'; 
    });

}])
;
