'use strict';

var SonyCamera = require('../routes/sony-camera');
var camera = new SonyCamera('10.0.0.1', 10000, '/sony/camera');
camera.show();

exports.call = function(req, res) {
  var method = req.params.method
  var params = req.query.p ? JSON.parse(req.query.p) : null;
  // console.log(method);
  // console.log(params);

  camera.call(method, params, function (err, output) {
    if (err) {
      console.log(err);
      res.send(err);
      return;
    }

    res.send(output.result);
  });
};

exports.startViewfinder = function (req, res) {
  camera.startViewfinder(req, res);
};

exports.stopViewfinder = function (req, res) {
  camera.stopViewfinder(req, res);
};

exports.takePhoto = function (req, res) {
  camera.takePhoto(req, res);
};

exports.zoomIn = function (req, res) {
  camera.zoomIn(req, res);
};

exports.zoomOut = function (req, res) {
  camera.zoomOut(req, res);
};
