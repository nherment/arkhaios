
imageManagement.controller('ListCtrl',
    function AppCtrl ($scope, $routeParams, $http) {
        $scope.loading = true;
//        $scope.imagesInfos = undefined;

        $http({method: 'GET', url: '/api/count/all'}).success(function(data, status, headers, config) {


            $scope.currentPage = Number($routeParams.page);

            if(typeof $scope.currentPage !== 'number' || $scope.currentPage < 1) {
                $scope.currentPage = 1;
            }

            $scope.pageSize = 5;

            var from = ($scope.currentPage-1) * $scope.pageSize;
            var to = from + $scope.pageSize;

            $scope.prevUrl = "#/index/" + ($scope.currentPage-1);
            $scope.nextUrl = "#/index/" + ($scope.currentPage+1);
            $scope.count = data.count;
            $scope.numberOfPages = function() {
                return Math.ceil($scope.count/$scope.pageSize);
            };


            $http({method: 'GET', url: '/api/list/all/'+from+'/'+to}).
                success(function(data, status, headers, config) {
                    $scope.imagesInfos = data;
                    $scope.loading = false;
                    $scope.$broadcast('dataLoaded');
                });


        })

    }
)
imageManagement.directive('tagsInput', function ($timeout) {
    return {
        restrict: 'C',
        link: function (scope, elem, attrs) {
            console.log(scope.imageInfo)

            $timeout(function(){
                elem.tagsInput({
                    height: 60,
                    width: 300
                });
                if(scope.imageInfo.tags) {
                    elem.importTags(scope.imageInfo.tags.join(","));
                }
            });
        }
    };
});



imageManagement.controller('AccessControlCtrl',
    function AppCtrl ($scope, $http) {
        $scope.loading = true;

        $http({method: 'GET', url: '/api/acl/list'}).success(function(data, status, headers, config) {
                $scope.acls = data;
                $scope.loading = false;
                $scope.$broadcast('dataLoaded');
        })

    }
)