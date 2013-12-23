'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $http, $sce) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    $scope.photos = [];

    $scope.startLiveview = function () {
      $scope.liveview = '/camera/api/liveview.jpg';

      // callMethod('startLiveview', null, function (result) {
      //   var url = result[0];
      //   console.log(url);
      //   // $scope.liveview = $sce.trustAsResourceUrl(url);
      // });
    };

    $scope.stopLiveview = function () {
      callMethod('stopLiveview');
    };

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

    function callMethod (method, params, callback) {
      var CAMERA_API_URL = '/camera/api';

      params = params ? '?p=' + JSON.stringify(params) : '';
      var url = CAMERA_API_URL + '/' + method + params;
      $http.get(url).success(function (result) {
        // console.log(result);

        if (method === 'actTakePicture' && result) {
          $scope.photos.push(result);
          // $scope.$apply();
        }

        if (callback) {
          callback(result);
        }
      });
    }

  });
