'use strict';

var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var tracklet = {};
var _ = require('lodash');
var Q = require('q');
var async = require('async');






tracklet.asyncTest = function(params) {
   console.log(params);
   var test = params;
   async.waterfall([
         async.apply(firstFunc, test),
         secondFunc
   ],
   function(err, result){
      console.log(result);
   });
};

tracklet.asyncTest('hello');


function firstFunc(data, callback) {
   var data = data;
   callback(null, data);
}

function secondFunc(data, callback) {
   data = 'goodbye';
   callback(null, data);
}
