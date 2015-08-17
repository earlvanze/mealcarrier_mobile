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


    .controller("delivery_details_controller", function($scope, $stateParams, $http, store, $state, uiGmapGoogleMapApi){

	$scope.request = {};
	
	navigator.geolocation.getCurrentPosition(function($position){
	    // success!
	    setup_map($position.coords.latitude, $position.coords.longitude);
	}, function($error){
	    setup_map({latitude: 0, longitude: 0});
	    // error!
	});

	var events = {
	    places_changed: function (searchBox) {}
	}
	$scope.searchbox = { template:'templates/searchbox.html', events: events};

	var geocoder;	
	var setup_map = function($latitude, $longitude){
	    uiGmapGoogleMapApi.then(function(maps) {
		geocoder = new google.maps.Geocoder;
		$scope.map = {center: {latitude: $latitude, longitude: $longitude}, zoom: 16};
		$scope.marker = {coords: {latitude: $latitude, longitude: $longitude},
				 id: "me",
				 options: {draggable: true},
				 events: {
				     dragend: function(map, eventname, eventargs){
					 update_geocode();
				     }
				 }
				};
		update_geocode();
	    });
	}

	var update_geocode = function(){
	    geocoder.geocode({"location": {lat: $scope.marker.coords.latitude, lng: $scope.marker.coords.longitude}}, function(results, $status){
		if($status == "OK"){
		    $scope.marker.pretty_address = results[0].formatted_address;
		}else{
		    $scope.marker.pretty_address = $status;
		}
		$scope.$apply();
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
		    $state.go('deliveries');
		}, function($response){
		    alert("error");
		    console.log("Error: Could not submit request.");
		    //error
		});
	    console.log("all done with request")
	}
	
	
	return;
	
    var myLatlng = new google.maps.LatLng($scope.latitude, $scope.longitude);
    
    var mapOptions = {
        center: myLatlng,
        zoom: 16,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    
    var map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    var marker = null;
    
    navigator.geolocation.getCurrentPosition(function(pos) {
	map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
	
        marker = new google.maps.Marker({
	    position: new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude),
	    map: map,
	    draggable: true,
	    visible: true
        });
	marker.setMap(map);
	alert(marker.getMap().center);
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

    $scope.request = {};

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
