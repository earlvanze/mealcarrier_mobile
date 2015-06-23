angular.module("mealcarrier.controller", [])

.controller("menu_controller", function($scope, $ionicSideMenuDelegate){

})

.controller("request_controller", function($scope){
    var $places = [
	{
	    id: 1,
	    name: "Starbucks",
	    address: "1 University Place"
	},
	{
	    id: 2,
	    name: "Dunkin Donuts",
	    address: "300 University Place"
	},
	{
	    id: 3,
	    name: "Jasper Connection",
	    address: "6 Metrotech"
	}
    ];

    $scope.places = $places;

    $scope.today = "20th June 2015";
})


.controller("delivery_details_controller", function($scope, $stateParams){
    console.log($stateParams.place_id);
})
