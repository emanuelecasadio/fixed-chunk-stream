'use strict';

var FixedChunkStream = require(__dirname + '/index');
var fs = require('fs');

var trans = new FixedChunkStream();
fs.createReadStream('./sample.dat').pipe(trans);
trans.pipe(fs.createWriteStream('./sample.out.dat'));