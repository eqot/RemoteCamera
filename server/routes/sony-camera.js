'use strict';

var fs = require('fs');
var url = require('url');
var http = require('http');
var request = require('ahr2');

(function () {

  var SonyCamera = function (url, port, path) {
    this.url = url || '10.0.0.1';
    this.port = port || 10000;
    this.path = path || '/sony/camera';

    this.rpcReq = {
      id: 1,
      version: '1.0'
    };

    this.publicDir = require('path').join(__dirname, '../public/');
    this.photoDir = 'camera/photos/';
  };

  SonyCamera.prototype.show = function () {
    console.log(this.url + ':' + this.port + this.path);
  };

  SonyCamera.prototype.call = function (method, params, callback) {
    this.rpcReq.method = method;
    this.rpcReq.params = params || [];
    console.log(this.rpcReq);

    request({
      method: 'POST',
      hostname: this.url,
      port: this.port,
      pathname: this.path,
      body: JSON.stringify(this.rpcReq)
    }).when(function (err, ahr, rpcRes) {
      if (callback) {
        callback(err, rpcRes);
      }
    });
  };

  SonyCamera.prototype.waitUntilIdle = function (callback) {
    this.call('getEvent', [false], function (err, result) {
      // console.log(err);
      if (!err) {
        var cameraStatus = result.result[1].cameraStatus;
        // console.log(cameraStatus);
        if (cameraStatus !== 'IDLE') {
          err = 'NOT_IDLE';
        }
      }

      if (callback) {
        callback(err);
      }
    });
  };

  SonyCamera.prototype.startViewfinder = function (req, res) {
    this.call('startLiveview', null, function (err, output) {
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

  SonyCamera.prototype.stopViewfinder = function (req, res) {
    this.call('stopLiveview');
    res.send(null);
  };

  SonyCamera.prototype.takePhoto = function (req, res) {
    var self = this;

    this.waitUntilIdle(function (err) {
      if (err) {
        res.send(null);
        return;
      }

      self.call('actTakePicture', null, function (err, output) {
        var url = output.result[0][0];

        request.get(url).when(function (err, ahr, data) {
          var photoName = url.split('?')[0].split('/')[3];
          // console.log(photoName);

          fs.writeFile(self.publicDir + self.photoDir + photoName, data, function (err) {
            if (err) {
              throw err;
            }

            res.send(self.photoDir + photoName);
          });
        });
      });
    });
  };

  SonyCamera.prototype.zoomIn = function (req, res) {
    this.call('actZoom', ['in', 'start']);
    res.send(null);
  };

  SonyCamera.prototype.zoomOut = function (req, res) {
    this.call('actZoom', ['out', 'start']);
    res.send(null);
  };


  // Client-side export
  if (typeof window !== 'undefined' && window.SonyCamera) { window.SonyCamera = SonyCamera; }
  // Server-side export
  if (typeof module !== 'undefined') { module.exports = SonyCamera; }

}());
