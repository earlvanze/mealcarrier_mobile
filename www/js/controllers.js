angular.module("mealcarrier.controller", ["mealcarrier.services", "mealcarrier.formValidateAfter"])

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


.controller("delivery_details_controller", function($scope, $stateParams, $http, store, $state){
	document.getElementById("side_menu").style.visibility = "hidden";
	var map;
	var location;
	document.addEventListener("deviceready", function(){
	    map = plugin.google.maps.Map.getMap(document.getElementById("map"));
	    map.on("plugin.google.maps.event.MAP_READY", map_ready)
	}, false);
	
    function map_ready(map, location){
		// do something
		alert("map is ready");
		console.log("map is ready");
		console.log("getting location");
		location = map.getMyLocation(onSuccess, onError);
		map.setCenter(location.LatLng);
    }

    var onSuccess = function(location) {
		var msg = ["Current your location:\n",
		"latitude:" + location.latLng.lat,
		"longitude:" + location.latLng.lng,
		"speed:" + location.speed,
		"time:" + location.time,
		"bearing:" + location.bearing].join("\n");

		map.addMarker({
			'position': location.latLng,
			'title': msg
		}, function(marker) {
			marker.showInfoWindow();
		});
	};

	var onError = function(msg) {
		alert("error: " + msg);
	};
	// console.log("getting location");
	// map.getMyLocation(onSuccess, onError);
	// map.setCenter(location.LatLng);
	
    /*
    var myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
    
    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var marker = null;


    navigator.geolocation.getCurrentPosition(function(pos) {
	map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
	
        marker = new google.maps.Marker({
	    position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
	    map: map,
	    draggable: true
        });
	marker.setMap(map);
	google.maps.event.addListener(marker, "dragend", function(){
	    $scope.request.latitude = marker.getPosition().lat();
	    $scope.request.longitude = marker.getPosition().lng();
	    $scope.$apply();
	});
    });
    
    $scope.center_on_me = function(){
		navigator.geolocation.getCurrentPosition(function(pos) {
	            marker.setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});	    
		});
    };
    */

	$scope.request = {};

    $scope.send_request = function(){
		$http({
		    url: "http://mealcarrier.com:8080/requests/create",
		    method: "POST",
		    data: {
			user_id: store.get('user_id'),
			dropoff_latitude: location.latLng.lat,		//marker.getPosition().lat(),
			dropoff_longitude: location.latLng.lng,		//marker.getPosition().lng(),
			pickup_latitude: 0,
			pickup_longitude: 0,
			restaurant_id: $stateParams.restaurant_id,
			delivery_notes: $scope.request.delivery_notes
		    }
		})
		.then(function($response){
		    //success
		    console.log($response);
		    $state.go('deliveries');
		}, function($response){
		    alert("error");
		    console.log("Error: Could not submit request.");
		    //error
		});
	alert("outside");
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

.controller("request_details_controller", function($scope, $state, $stateParams, $http, store){
	$scope.request = {};
	console.log($stateParams.request_id)
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


    latitude = 40.6944;
    longitude = -73.9861;
    
    $scope.request = {};
    
    $scope.request.latitude = latitude;
    $scope.request.longitude = longitude;
    
 //    var myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
    
 //    var mapOptions = {
 //        center: myLatlng,
 //        zoom: 16,
 //        mapTypeId: google.maps.MapTypeId.ROADMAP
 //    };
    
 //    var map = new google.maps.Map(document.getElementById("map"), mapOptions);
 //    var marker = null;


})
.controller("deliveries_controller", function($scope, $http){
    $scope.pull_database = function(){
	$http({
	    method: "GET",
	    url: "http://mealcarrier.com:8080",
	    headers: {"Content-Type": "application/x-www-form-urlencoded; charset=UTF-8"}
	})
	    .success(function($data, $status, $headers, $config){
		console.log($data);
		$scope.deliveries = $data;
	    })
	    .error(function($data, $status, $headers, $config){
		alert("Error: Can't connect to server.");
	    });
    };

 //    navigator.geolocation.getCurrentPosition(function(pos) {
	// map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
	
 //        marker = new google.maps.Marker({
	//     position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
	//     map: map,
	//     draggable: true
 //        });
	// marker.setMap(map);
	// google.maps.event.addListener(marker, "dragend", function(){
	//     $scope.request.latitude = marker.getPosition().lat();
	//     $scope.request.longitude = marker.getPosition().lng();
	//     $scope.$apply();
	// });
 //    });
    
    
 //    $scope.center_on_me = function(){
	// navigator.geolocation.getCurrentPosition(function(pos) {
 //            marker.setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});	    
	// });
 //    };
    
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
});
