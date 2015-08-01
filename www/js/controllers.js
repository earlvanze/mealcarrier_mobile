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
			    store.set('token', $response.data.token);
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
		 //    $http({
			//     url: "http://mealcarrier.com:8080/authenticate",
			//     method: "POST",
			//     data:{
			// 		"email": $scope.user.email,
			// 		"password": $scope.user.password
			//     }
			// })
			// .then(function($response){
			//     //success
			//     console.log($response);
			//     console.log($scope.user.token);
			//     if (!$response.data.success){
			//     	if($response.data.message == "Authentication failed. Wrong password."){
			//     		console.log("Email address exists!");
			//     	}
			//     	console.log($response.data.message);
			//     } else {
			//     	console.log($response.data.message);
			// 	    $scope.user.token = $response.data.token;
	  //   		    console.log($scope.user.token);
			//     	$state.go('request_pickup');
			//     }
			// }, function($response){
			//     console.log($response);
			//     console.log("Error: Can't connect to server.");
			//     //error
			// });
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


.controller("delivery_details_controller", function($scope, $stateParams, $http){


    latitude = 40.6944;
    longitude = -73.9861;
    
    $scope.position = {};
    
    $scope.position.latitude = latitude;
    $scope.position.longitude = longitude;
    
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
	    $scope.position.latitude = marker.getPosition().lat();
	    $scope.position.longitude = marker.getPosition().lng();
	    $scope.$apply();
	});
    });
    
    
    $scope.center_on_me = function(){
		navigator.geolocation.getCurrentPosition(function(pos) {
	            marker.setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});	    
		});
    };
    
    $scope.send_request = function(){
		console.log("Sending request");
		$http({
		    url: "http://mealcarrier.com:8080/requests/create",
		    method: "POST",
		    data: {
				user_id: 1,
				dropoff_latitude: marker.getPosition().lat(),
				dropoff_longitude: marker.getPosition().lng(),
				pickup_latitude: 0,
				pickup_longitude: 0
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
	 //    .success(function($data, $status, $headers, $config){
		// 	console.log($data);
		// })
	  //   .error(function($data, $status, $headers, $config){
			// alert("Error: Can't connect to server or not authorized.");
   //  	});
    }
    // $scope.deliveries = [{}, {}];
})

.controller("request_details_controller", function($scope, $stateParams, $http){


    latitude = 40.6944;
    longitude = -73.9861;
    
    $scope.position = {};
    
    $scope.position.latitude = latitude;
    $scope.position.longitude = longitude;
    
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
	    $scope.position.latitude = marker.getPosition().lat();
	    $scope.position.longitude = marker.getPosition().lng();
	    $scope.$apply();
	});
    });
    
    
    $scope.center_on_me = function(){
	navigator.geolocation.getCurrentPosition(function(pos) {
            marker.setPosition({lat: pos.coords.latitude, lng: pos.coords.longitude});	    
	});
    };
    
    $scope.confirm_delivery = function(){
		console.log("Confirming delivery");
		$http({
		    url: "http://mealcarrier.com:8080/requests/:request_id",
		    method: "PUT",
		    data: {
		    	accepted: TRUE,
		    	carrier: "[carrier_id]"
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