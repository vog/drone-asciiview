#!/usr/bin/env node

/*
 * Copyright (C) 2013  Volker Grabsch <v@njh.eu>
 *
 * Permission to use, copy, modify, and/or distribute this software for any
 * purpose with or without fee is hereby granted, provided that the above
 * copyright notice and this permission notice appear in all copies.
 *
 * THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
 * WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
 * ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
 * WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
 * ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
 * OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
 */

width = 120
height = 40

var arDrone = require('ar-drone');
var child_process = require('child_process');
var fs = require('fs');
var printf = require('printf');
var uuid = require('uuid');

var receivePng = function(input, callback) {
  var prefix = '/tmp/drone-asciiview';
  var pattern = prefix + '_' + uuid.v4() + '_%d.png';
  var avconv = child_process.spawn('avconv', [
    '-i',
    'pipe:',
    '-f',
    'image2',
    pattern
  ]);
  input.pipe(avconv.stdin);
  var imageNr = 1;
  var enabled = true;
  setInterval(function() {
    if (!enabled) return;
    enabled = false;
    var filename = printf(pattern, imageNr);
    fs.exists(filename, function(exists) {
      if (exists) {
        fs.readFile(filename, function(err, pngData) {
          fs.unlink(filename);
          if (err) throw err;
          callback(pngData);
          imageNr += 1;
          enabled = true;
        });
      } else {
        enabled = true;
      }
    });
  }, 10);
};

var receiveAscii = function(input, width, height, callback) {
  receivePng(input, function(pngData) {
    // Using external Python script because there are
    // currently no JavaScript bindings for AAlib,
    // but good Python bindings.
    var aalib_convert = child_process.spawn('./aalib_convert.py', [
      width,
      height
    ]);
    var asciiData = '';
    aalib_convert.stdout.on('data', function(data) {
      asciiData += data;
    });
    aalib_convert.stdout.on('end', function() {
      callback(asciiData);
    });
    aalib_convert.stdin.write(pngData);
    aalib_convert.stdin.end();
  });
};

var showAscii = function(video, width, height) {
  // ANSI sequence for "clear screen"
  process.stdout.write('\x1b[2J');
  receiveAscii(video, width, height, function(asciiData) {
    // ANSI sequence for "move cursor to upper left corner"
    process.stdout.write('\x1b[H');
    process.stdout.write(asciiData);
  });
};

var client = arDrone.createClient();
var video = client.getVideoStream(); // Usually, this is a TCP stream accessing 192.168.1.1 port 5555.
showAscii(video, width, height);

// Alternatively, for local tests without a live drone
// (using data previously captured from a drone):
//
// var video = new fs.ReadStream('../testdata.h264');
// showAscii(video, width, height);
