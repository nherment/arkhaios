
imageManagement.controller('ListCtrl',
    function AppCtrl ($scope, $routeParams, $http) {
        $scope.loading = true;

        $http({method: 'GET', url: '/api/count/all'}).success(function(data, status, headers, config) {


            $scope.currentPage = Number($routeParams.page);

            if(typeof $scope.currentPage !== 'number' || $scope.currentPage < 1) {
                $scope.currentPage = 1;
            }

            $scope.pageSize = 10;

            var from = ($scope.currentPage - 1) * $scope.pageSize;
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

            $timeout(function(){
                elem.tagsInput({
                    height: 60,
                    width: 300
                });
                if(scope.imageInfo && scope.imageInfo.tags) {
                    elem.importTags(scope.imageInfo.tags.join(","));
                }
            });
        }
    };
});

imageManagement.directive('imageUpdate', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            $timeout(function() {

                elem.on("submit", function() {

                    var originalBtnValue = elem.find(".submit").val();
                    elem.find(".submit").val("Saving...")
                    elem.find(".submit").attr('disabled','disabled');

                    $.ajax({
                        type: "POST",
                        url: elem.attr("action"),
                        data: elem.serialize(),

                        success: function(html)
                        {
                            elem.find(".submit").val(originalBtnValue)
                            elem.find(".submit").removeAttr("disabled")
                        },
                        error: function() {
                            window.location.reload()
                        }
                    });
                    return false;
                })
            });
        }
    };
});
imageManagement.directive('imageDelete', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            $timeout(function() {

                elem.on("click", function() {

                    var originalBtnValue = elem.text();
//                    elem.val("Deleting...")
//                    elem.attr('disabled','disabled');
                    console.log("delete ["+scope.uid+"]")

//                    $.ajax({
//                        type: "POST",
//                        url: elem.attr("action"),
//                        data: elem.serialize(),
//
//                        success: function(html)
//                        {
//                            elem.find(".btn").val(originalBtnValue)
//                            elem.find(".btn").removeAttr("disabled")
//                        },
//                        error: function() {
//                            window.location.reload()
//                        }
//                    });
                    return false;
                })
            });
        }
    };
});

imageManagement.directive('imageUpload', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            $timeout(function(){
                var myDropzone = new Dropzone("form", {});
            });
        }
    };
})


imageManagement.controller('AccessControlCtrl',
    function AppCtrl ($scope, $http) {
        $scope.loading = true;

        $http({method: 'GET', url: '/api/acl/list'}).success(function(data, status, headers, config) {
            $scope.acls = data;
            if($scope.acls) {
                for(var i = 0 ; i < $scope.acls.length ;i++) {
                    $scope.acls[i].link = window.location.protocol + "//" + window.location.host + "/?aclUid="+$scope.acls[i].uid
                }
            }
            $scope.loading = false;
            $scope.$broadcast('dataLoaded');
        })

    }
)


imageManagement.directive('aclUpdate', function ($timeout) {
    return {
        restrict: 'A',
        link: function (scope, elem, attrs) {

            $timeout(function() {


                elem.on("submit", function() {

                    var originalBtnValue = elem.find(".btn").val();

                    elem.find(".btn").val("Saving...");
                    elem.find(".btn").attr('disabled','disabled');

                    $.ajax({
                        type: "POST",
                        url: elem.attr("action"),
                        data: elem.serialize(),

                        success: function(html)
                        {
                            elem.find(".btn").val(originalBtnValue);
                            elem.find(".btn").removeAttr("disabled");
                        },
                        error: function() {
                            window.location.reload();
                        }
                    });
                    return false;
                })
            });
        }
    };
});