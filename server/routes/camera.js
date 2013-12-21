'use strict';

var request = require('ahr2');

var input = {
  id: 1,
  version: '1.0'
};

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
    // console.log(arguments);
    if (callback) {
      callback(output.result);
    }
  });
}

exports.call = function(req, res) {
  var method = req.params.method
  var params = req.query.p ? JSON.parse(req.query.p) : null;
  // console.log(method);
  // console.log(params);

  callMethod(method, params, function (output) {    
    // console.log(output);
    res.send(output);
  });

};
