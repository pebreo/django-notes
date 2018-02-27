'use strict';

angular.module('loginDetail').
    component('loginDetail', {
        templateUrl: '/api/templates/login-detail.html',
        controller: function(
                $cookies,
                $http,
                $location,
                $routeParams,
                $rootScope,
                $scope
            ){
            var loginUrl = '/api/auth/token/'
            $scope.user = {
            }
            var tokenExists = $cookies.get("token");
            if (tokenExists) {
                // verify token
                $scope.loggedIn = true;
                $cookies.remove("token")
                $scope.user = {
                    email: $cookies.get("email")
                }
             }
            $scope.doLogin = function(user){
                console.log(user)

                var reqConfig = {
                    method: "POST",
                    url: loginUrl,
                    data: {
                        email: user.email,
                        password: user.password
                    },
                    headers: {}
                }
                var requestAction = $http(reqConfig)

                requestAction.success(function(r_data, r_status, r_headers, r_config){
                        //console.log(r_data) // token
                        $cookies.put("token", r_data.token);
                        $cookies.put("email", user.email);
                        // message
                        $location.path("/")
                })
                requestAction.error(function(e_data, e_status, e_headers, e_config){
                        console.log(e_data) // error
                })

            }
            // $http.post()
        }
})
