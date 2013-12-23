'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.photos = [];

    function resize() {
      var height = window.innerHeight;
      $('#liveview').height(height + 'px');

      var width = $('#liveview').width() || (height * 4 / 3);
      var left = (window.innerWidth - width) / 2;
      $('#liveview').css('left', left + 'px');
    }
    window.onresize = resize;
    resize();

    $scope.startLiveview = function () {
      $scope.liveview = '/camera/api/liveview.jpg';
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
