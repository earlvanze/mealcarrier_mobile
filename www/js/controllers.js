angular.module("mealcarrier.controller", ["mealcarrier.services"])

.controller("menu_controller", function($scope, $ionicSideMenuDelegate){

})

.controller("login_controller", function($scope, $http){
    $scope.credentials = {};
    $scope.authenticate = function(){
	$http({
	    url: "http://mealcarrier.com:8080/authenticate",
	    method: "POST",
	    data:{
		"email": "something"//$scope.credentials.email,
//		"password": $scope.credentials.password
	    }
	})
	.then(function($response){
	    //success
	    console.log($response);
	}, function($response){
	    console.log($response);
	    console.log("error");
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
    $scope.today = "20th June 2015";
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
	console.log("sending");
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
	    console.log("error");
	    //error
	});
    }

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
		alert("Error");
	    });
    };

    $scope.deliveries = [{}, {}];
})
