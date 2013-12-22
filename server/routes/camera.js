'use strict';

var fs = require('fs');
var request = require('ahr2');

var input = {
  id: 1,
  version: '1.0'
};

var publicDir = 'public/';
var photoDir = 'photos/';

function callMethod (method, params, callback) {
  input.method = method;
  input.params = params || [];
  console.log(input);

  request({
    method: 'POST',
    hostname: '10.0.0.1',
    port: 10000,
    pathname: '/sony/camera',
    body: JSON.stringify(input)
  }).when(function (err, ahr, output) {
    if (callback) {
      callback(err, output);
    }
  });
}

function doTakePicture (method, params, res) {
  callMethod(method, params, function (err, output) {
    var url = output.result[0][0];
    console.log(url);

    request.get(url).when(function (err, ahr, data) {
      // console.log(ahr);
      // console.log(data);

      var photoName = url.split('?')[0].split('/')[3];
      console.log(photoName);

      fs.writeFile(publicDir + photoDir + photoName, data, function (err) {
        if (err) {
          throw err;
        } else {
          res.send(photoDir + photoName);
        }
      });
    });
  })
}

function takePicture (method, params, res) {
  callMethod('getEvent', [false], function (err, result) {
    if (err) {
      console.log(err);
      // res.send(err);
      res.send(null);
      return;
    }

    var cameraStatus = result.result[1].cameraStatus;
    console.log(cameraStatus);

    if (cameraStatus === 'IDLE') {
      doTakePicture(method, params, res);
    } else {
      res.send(null);
    }
  })
}

exports.call = function(req, res) {
  var method = req.params.method
  var params = req.query.p ? JSON.parse(req.query.p) : null;
  // console.log(method);
  // console.log(params);

  if (method === 'actTakePicture') {
    takePicture(method, params, res);
  } else {
    callMethod(method, params, function (err, output) {
      if (err) {
        console.log(err);
        res.send(err);
        return;
      }

      res.send(output.result);
    });
  }

};
