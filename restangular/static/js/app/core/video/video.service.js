
'use strict';

angular.
    module('video').
        factory('Video', function($resource){
            var url = '/api/videos/:slug/'
            return $resource(url, {}, {
                query: {
                    method: "GET",
                    params: {},
                    isArray: true,
                    cache: false,
                    transformResponse: function(data, headersGetter, status){
                        // console.log(data)
                        var finalData = angular.fromJson(data)
                        return finalData.results
                    }
                    // interceptor
                },
                get: {
                    method: "GET",
                    params: {"slug": "@slug"},
                    isArray: false,
                    cache: false,
                }
            })

        });
