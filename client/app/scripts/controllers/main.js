'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.photos = [];

    $scope.takePhoto = function () {
      // callMethod('getAvailableApiList');
      callMethod('actTakePicture');
    };

    $scope.zoomIn = function () {
      callMethod('actZoom', ['in', 'start']);
    };

    $scope.zoomOut = function () {
      callMethod('actZoom', ['out', 'start']);
    };

    function callMethod (method, params) {
      var CAMERA_API_URL = '/camera/api';

      params = params ? '?p=' + JSON.stringify(params) : '';
      var url = CAMERA_API_URL + '/' + method + params;
      $http.get(url).success(function (result) {
        // console.log(result);

        if (method === 'actTakePicture' && result) {
          $scope.photos.push(result);
          // $scope.$apply();
        }
      });
    }

  });
