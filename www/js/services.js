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
}]);
