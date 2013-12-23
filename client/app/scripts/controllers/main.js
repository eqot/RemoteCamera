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
      $scope.liveview = '/camera/viewfinder/start';
    };

    $scope.stopLiveview = function () {
      call('viewfinder/stop');
    };

    $scope.takePhoto = function () {
      call('photos/take', null, function (result) {
        $scope.photos.push(result);
      });
    };

    $scope.zoomIn = function () {
      call('zoom/in');
    };

    $scope.zoomOut = function () {
      call('zoom/out');
    };

    function call (method, params, callback) {
      var CAMERA_API_URL = '/camera';

      params = params ? '?p=' + JSON.stringify(params) : '';
      var url = CAMERA_API_URL + '/' + method + params;
      $http.get(url).success(function (result) {
        // console.log(result);
        if (callback) {
          callback(result);
        }
      });
    }

  });
