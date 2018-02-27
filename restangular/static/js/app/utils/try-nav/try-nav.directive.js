'use strict';


angular.module("tryNav").
  directive('tryNav', function(Video, $cookies, $location){
    return {
        restrict: "E",
        templateUrl: "/api/templates/try-nav.html",
        link: function (scope, element, attr) {
            scope.mymsg = false;
            scope.items = Video.query();
            scope.selectItem = function($item, $model, $label){
                // console.log($item)
                // console.log($model)
                // console.log($label)
                $location.path("/blog/" + $item.id);
                scope.searchQuery = "";
            };
            scope.seachItem = function(){
                console.log(scope.searchQuery);
                $location.path("/blog/").search("q", scope.searchQuery);
                scope.searchQuery = "";
            };

            scope.userLoggedIn = false;
            scope.$watch(function(){

                var token = $cookies.get("token");
                if (token) {
                    scope.userLoggedIn = true;
                    console.log('logged in');
                } else {
                    scope.userLoggedIn = false;
                }
            });
        }
    }
});
