'use strict';

var fs = require('fs');
var request = require('ahr2');

var url = require('url');
var http = require('http');

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

exports.liveview = function (req, res) {
  callMethod('startLiveview', null, function (err, output) {
    var liveviewUrl = url.parse(output.result[0]);
    // console.log(liveviewUrl);

    var COMMON_HEADER_SIZE = 8;
    var PAYLOAD_HEADER_SIZE = 128;
    var JPEG_SIZE_POSITION = 4;
    var PADDING_SIZE_POSITION = 7;

    var jpegSize = 0;
    var paddingSize = 0;

    var boundary = 'boundary';

    var liveviewReq = http.request(liveviewUrl, function (liveviewRes) {
      // console.log(data);

      var contentType = liveviewRes.headers['content-type'];
      var boundaryBuffer = new Buffer('\n--' + boundary + '\nContent-Type: ' + contentType + '\n\n');

      var state = 0;
      var buffer = new Buffer(0);

      res.writeHead(200, {
        'Expires': 'Mon, 01 Jul 1980 00:00:00 GMT',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Content-Type': 'multipart/x-mixed-replace;boundary=' + boundary
      });

      liveviewRes.on('data', function (chunk) {
        if (jpegSize === 0) {
          buffer = Buffer.concat([buffer, chunk]);

          if (buffer.length >= (COMMON_HEADER_SIZE + PAYLOAD_HEADER_SIZE)) {
            jpegSize =
              buffer.readUInt8(COMMON_HEADER_SIZE + JPEG_SIZE_POSITION) * 65536 +
              buffer.readUInt16BE(COMMON_HEADER_SIZE + JPEG_SIZE_POSITION + 1);
            // console.log(jpegSize);

            paddingSize = buffer.readUInt8(COMMON_HEADER_SIZE + PADDING_SIZE_POSITION);
            // console.log(paddingSize);

            res.write(boundaryBuffer);

            buffer = buffer.slice(8 + 128);
            if (buffer.length > 0) {
              res.write(buffer);
            }
          }
        } else {
          res.write(chunk);

          if (chunk.length < jpegSize) {
            jpegSize -= chunk.length;
          } else {
            buffer = chunk.slice(jpegSize + paddingSize);
            jpegSize = 0;
          }
        }
      });

      liveviewRes.on('end', function () {
        console.log('End');
      });

      liveviewRes.on('close', function () {
        console.log('Close');
      });
    });

    liveviewReq.on('error', function(e) {
      console.error('Error: ', e);
    });

    liveviewReq.end();
  });
};
