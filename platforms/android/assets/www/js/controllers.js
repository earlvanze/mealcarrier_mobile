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
		    	if (!$response.data.success){
		    		console.log($response.data.message)
		    	}
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

.controller("delivery_details_controller", function($scope, $stateParams, $http, store, $state, uiGmapGoogleMapApi, $ionicLoading){
	// $ionicLoading.show();
	$scope.request = {};
	
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
	
	$scope.submit = function(){
	    $http({
			url: "http://mealcarrier.com:8080/requests/create",
			method: "POST",
			data: {
			    user_id: store.get('user_id'),
			    dropoff_latitude: $scope.marker.coords.latitude,
			    dropoff_longitude: $scope.marker.coords.longitude,
			    pickup_latitude: 0,
			    pickup_longitude: 0,
			    restaurant_id: $stateParams.restaurant_id,
			    delivery_notes: $scope.request.delivery_notes
			}
	    })
		.then(function($response){
		    //success
		    console.log($response);
		    $state.go('payment');
		}, function($response){
		    alert("error");
		    console.log("Error: Could not submit request.");
		    //error
		});
	    console.log("all done with request")
	}
})

.controller("deliveries_controller", function($scope, $http, $state, store){
    $scope.pull_requests = function(){
    	$http({
		    method: "GET",
		    url: "http://mealcarrier.com:8080/requests"
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
    // $scope.deliveries = [{}, {}];
})

.controller("request_details_controller", function($scope, $stateParams, $http, store, $state, uiGmapGoogleMapApi, $ionicLoading){
	// $ionicLoading.show();
	$scope.request = {};
	console.log($stateParams.request_id);
	$http({
	    method: "GET",
	    url: "http://mealcarrier.com:8080/requests/" + $stateParams.request_id
	})
	.then(function($response){
	    //success
	    $scope.request = $response.data;
	    console.log($scope.request);
	    // $state.go('chat');
	}, function($response){
	    console.log($response);
	    console.log("Error: Can't connect to server or not authorized.");
	    //error
	});
	
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
			$scope.map = {center: {latitude: parseFloat($scope.request.dropoff_location[1]), longitude: parseFloat($scope.request.dropoff_location[0])}, zoom: 16};
			$scope.marker = {coords: {latitude: parseFloat($scope.request.dropoff_location[1]), longitude: parseFloat($scope.request.dropoff_location[0])},
				id: "me",
				options: {draggable: false},
				events: {
				    dragend: function(map, eventname, eventargs){
						 update_geocode();
				    }
				}
			};
			update_geocode();
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
    
    // $scope.request.latitude = $scope.marker.coords.latitude;
    // $scope.request.longitude = $scope.marker.coords.longitude;
    
    $scope.accept_delivery = function(){
		console.log("Confirming delivery");
		$http({
		    url: "http://mealcarrier.com:8080/requests/" + $stateParams.request_id,
		    method: "PUT",
		    data: {
		    	accepted: true,
		    	carrier_id: store.get('user_id')
		    }
		})
		.then(function($response){
		    //success
		    console.log($response);
		}, function($response){
		    console.log("Error: Could not submit request.");
		    //error
		});
    }
})

.controller("payment_controller", function($scope, $http, $state){

	// This clientToken has been generated by the Meal Carrier server.
	var clientToken = "eyJ2ZXJzaW9uIjoyLCJhdXRob3JpemF0aW9uRmluZ2VycHJpbnQiOiIzYmE2MmY2NjkwYjBiMTc3ZjdhMzU0NTc0ZWI1MjdiZTI3MDkzZjc2MWU5NjVhY2ZiOGEwZmVkYTIyZTY1MmM3fGNyZWF0ZWRfYXQ9MjAxNS0wOC0xN1QxNToxNTozMi4wMTU3ODgyODIrMDAwMFx1MDAyNm1lcmNoYW50X2lkPXc0ZzRkbTk2cTdrYzhiazZcdTAwMjZwdWJsaWNfa2V5PWtnanh3OXM1MzVrNmRjeXYiLCJjb25maWdVcmwiOiJodHRwczovL2FwaS5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tOjQ0My9tZXJjaGFudHMvdzRnNGRtOTZxN2tjOGJrNi9jbGllbnRfYXBpL3YxL2NvbmZpZ3VyYXRpb24iLCJjaGFsbGVuZ2VzIjpbXSwiZW52aXJvbm1lbnQiOiJzYW5kYm94IiwiY2xpZW50QXBpVXJsIjoiaHR0cHM6Ly9hcGkuc2FuZGJveC5icmFpbnRyZWVnYXRld2F5LmNvbTo0NDMvbWVyY2hhbnRzL3c0ZzRkbTk2cTdrYzhiazYvY2xpZW50X2FwaSIsImFzc2V0c1VybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXV0aFVybCI6Imh0dHBzOi8vYXV0aC52ZW5tby5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIiwiYW5hbHl0aWNzIjp7InVybCI6Imh0dHBzOi8vY2xpZW50LWFuYWx5dGljcy5zYW5kYm94LmJyYWludHJlZWdhdGV3YXkuY29tIn0sInRocmVlRFNlY3VyZUVuYWJsZWQiOmZhbHNlLCJwYXlwYWxFbmFibGVkIjp0cnVlLCJwYXlwYWwiOnsiZGlzcGxheU5hbWUiOiJNZWFsIENhcnJpZXIiLCJjbGllbnRJZCI6bnVsbCwicHJpdmFjeVVybCI6Imh0dHA6Ly9leGFtcGxlLmNvbS9wcCIsInVzZXJBZ3JlZW1lbnRVcmwiOiJodHRwOi8vZXhhbXBsZS5jb20vdG9zIiwiYmFzZVVybCI6Imh0dHBzOi8vYXNzZXRzLmJyYWludHJlZWdhdGV3YXkuY29tIiwiYXNzZXRzVXJsIjoiaHR0cHM6Ly9jaGVja291dC5wYXlwYWwuY29tIiwiZGlyZWN0QmFzZVVybCI6bnVsbCwiYWxsb3dIdHRwIjp0cnVlLCJlbnZpcm9ubWVudE5vTmV0d29yayI6dHJ1ZSwiZW52aXJvbm1lbnQiOiJvZmZsaW5lIiwidW52ZXR0ZWRNZXJjaGFudCI6ZmFsc2UsImJyYWludHJlZUNsaWVudElkIjoibWFzdGVyY2xpZW50MyIsIm1lcmNoYW50QWNjb3VudElkIjoibWVhbGNhcnJpZXIiLCJjdXJyZW5jeUlzb0NvZGUiOiJVU0QifSwiY29pbmJhc2VFbmFibGVkIjpmYWxzZSwibWVyY2hhbnRJZCI6Inc0ZzRkbTk2cTdrYzhiazYiLCJ2ZW5tbyI6Im9mZiJ9";
	$scope.show_button = false;
	braintree.setup(clientToken, "dropin", {
		container: "payment-form",
		onReady: function() {
			console.log('Braintree is ready');
			$scope.$apply(function(){
				$scope.show_button = true;
	        });
		}
	});
	$scope.confirm = function() {
		$http({
		    url: "http://mealcarrier.com:8080/payment/payment_methods",
		    method: "POST",
		    data: {
		    	payment_method_nonce: "fake-valid-nonce"
		    }
		})
		.then(function($response){
		    //success
		    console.log($response);
		    $state.go('deliveries');
		}, function($response){
		    console.log("Error: Could not submit request.");
		    //error
		});
	}
});
