angular.module("mealcarrier.services", [])
    .service("Restaurants", ["$http", "$q", function($http, $q){	
		$last_modified = "never";
		update_all = function($deferred){
		    console.log("Checking timestamp of server's db");
		    $http.get("http://mealcarrier.com:8080/restaurants/last-modified")
		    .success(function($server_last_modified, $status, $headers, $config){
				console.log("Server was last modified on " + $server_last_modified);
				if($server_last_modified != $last_modified){
				    // our cache is outdated
				    console.log("Our cache is outdated. Updating now.");
				    $http.get("http://mealcarrier.com:8080/restaurants")
					.success(function($data, $status, $headers, $config){
					    $restaurants = $data;
					    $deferred.resolve($restaurants);
					    $last_modified = $server_last_modified
					});
				}else{
				    console.log("Our cache is up to date");
				    // our cache is fine
				    $deferred.resolve($restaurants);
				}
		    });
	    };

	    return {
			get_all: function(){
			    var $deferred = $q.defer();
			    update_all($deferred);
			    return $deferred.promise;
			}
	    }
	}])

    .factory('PaymentMethods', ['store', function(store) {
        var payment_methods = store.get('payment_methods') || [];
        var factory = {};

        factory.add = function(payment_method) {
            payment_methods.push(payment_method);

            store.set('payment_methods', payment_methods);
            return payment_methods;
        };
        factory.get = function() {
            return payment_methods;
        };
        return factory;
    }])

    .factory('BraintreeClientToken', ["store", "$http", "$q", function(store, $http, $q) {
        var client_token = store.get('client_token') || "";
        var factory = {};

		update = function($deferred){
		    $http.get("http://mealcarrier.com:8080/users/" + store.get('user_id') + "/client_token")
		    .success(function($client_token, $status, $headers, $config){
		    	store.set('client_token', $client_token);
			    $deferred.resolve($client_token);
		    });
	    };

        factory.get = function() {
		    var $deferred = $q.defer();
		    update($deferred);
		    return $deferred.promise;
        };
        return factory;
    }])

    .service('Request', ["$http", "$q", "store", function($http, $q, store) {
    	var user_id = '';
    	var dropoff_latitude = 0;
    	var dropoff_longitude = 0;
    	var pickup_latitude = 0;
    	var pickup_longitude = 0;
    	var restaurant_id = '';
    	var delivery_notes = '';

    	this.set = function(request) {
	    	user_id = store.get('user_id');
    		dropoff_latitude = request.dropoff_latitude;
			dropoff_longitude = request.dropoff_longitude;
		    pickup_latitude = request.pickup_latitude;
		    pickup_longitude = request.pickup_longitude;
		    restaurant_id = request.restaurant_id;
		    delivery_notes = request.delivery_notes;
		    return this;
    	}
    	this.submit = function(){
		    var $deferred = $q.defer();
			$http({
				url: "http://mealcarrier.com:8080/requests/create",
				method: "POST",
				data: {
				    user_id: user_id,
				    dropoff_latitude: dropoff_latitude,
				    dropoff_longitude: dropoff_longitude,
				    pickup_latitude: pickup_latitude,
				    pickup_longitude: pickup_longitude,
				    restaurant_id: restaurant_id,
				    delivery_notes: delivery_notes
				}
		    })
			.success(function($response){
			    //success
			    console.log($response);
			    $deferred.resolve($response);
			})
			.error(function($response){
			    //error
			    alert("error");
			    console.log("Error: Could not submit request.");
			    $deferred.reject("Error: Could not submit request.");
			})
		    console.log("all done with request")
	        return $deferred.promise;
	    }
    }])

	.factory('MockService', ['$http', '$q',
	  function($http, $q) {
	    var me = {};

	    me.getUserMessages = function(d) {
	      /*
	      var endpoint =
	        'http://www.mocky.io/v2/547cf341501c337f0c9a63fd?callback=JSON_CALLBACK';
	      return $http.jsonp(endpoint).then(function(response) {
	        return response.data;
	      }, function(err) {
	        console.log('get user messages error, err: ' + JSON.stringify(
	          err, null, 2));
	      });
	      */
	      var deferred = $q.defer();
	      
			 setTimeout(function() {
	      	deferred.resolve(getMockMessages());
		    }, 1500);
	      
	      return deferred.promise;
	    };

	    me.getMockMessage = function() {
	      return {
	        userId: '534b8e5aaa5e7afc1b23e69b',
	        date: new Date(),
	        text: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.'
	      };
	    }

	    return me;
	  }
	])
;
