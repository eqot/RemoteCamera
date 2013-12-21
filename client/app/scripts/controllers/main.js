'use strict';

angular.module('clientApp')
  .controller('MainCtrl', function ($scope, $http) {
    $scope.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];


    callMethod('getAvailableApiList');
    // callMethod('actZoom', ['in', 'start']);
    // callMethod('actZoom', ['out', 'start']);
    // callMethod('actTakePicture');

    function callMethod (method, params) {
      var CAMERA_API_URL = '/camera/api';

      params = params ? '?p=' + JSON.stringify(params) : '';
      var url = CAMERA_API_URL + '/' + method + params;
      $http.get(url).success(function (result) {
        console.log(result);
      });
    }

  });
