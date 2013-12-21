'use strict';

var publicPath = require('path').join(__dirname, '../public/');

/*
 * GET home page.
 */

exports.index = function(req, res){
  res.sendfile(publicPath + 'index.html');
};
