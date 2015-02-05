'use strict';

var request = require('request');
var uuid = require('node-uuid');
var fs = require('fs');
var config = require('./config');
var tracklet = {};
var token_auth = config.token_auth;
var domain = config.domain;
var rec = config.rec;


tracklet.createUser = function (name, password, email) {
   var url;
   url = domain+"?module=API&method=UsersManager.addUser&format=JSON&userLogin="+name+"&password="+password+"&email="+email+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var parsedBody = JSON.parse(body);
      if (parsedBody.result === 'error') {
         console.log('Error: ' + parsedBody.message);
      }
   })
};

tracklet.deleteUser = function (name, password) {
   var url;
   url = domain+"?module=API&method=UsersManager.deleteUser&format=JSON&userLogin="+name+"&password="+password+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var parsedBody = JSON.parse(body);
      if (parsedBody.result === 'error') {
         console.log('Error: ' + parsedBody.message);
      }
   })
};

tracklet.createSite = function (siteName, urls) {
   var url;
   url = domain+"?module=API&method=SitesManager.addSite&format=JSON&siteName="+siteName+"&urls="+urls+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var parsedBody = JSON.parse(body);
      if (parsedBody.result === 'error') {
         console.log('Error: ' + parsedBody.message);
      }
   })
};

tracklet.giveAccess = function (userLogin, access, idSites) {
   var url;
   url = domain+"?module=API&method=UsersManager.setUserAccess&format=JSON&userLogin="+userLogin+"&access="+access+"&idSites="+idSites+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var parsedBody = JSON.parse(body);
      if (error) {
         console.log(error)
      }
      if (parsedBody.result === 'error') {
         console.log('Error: ' + parsedBody.message);
      }
   })
};


tracklet.track = function(params) {

   var url = 'http://127.0.0.1:8000/piwik.php?idsite=1&rec=1&';
   var arr = [];
   for (var p in params) {
      if(params.hasOwnProperty(p) && params[p] !== '') {
         arr.push(p + '=' + params[p]);
         //console.log(p);
      }
   }

   console.log(url + arr.join('&'));
   console.log(arr.length);
   if(arr.length > 0) {
      //request(url + arr.join('&'), function (error, response, body) {
      //   //var body = JSON.parse(body);
      //   //if (body.result === 'error') {
      //   //   console.log('Error: ' + body.message);
      //   //}
      //   //console.log(body);
      //})
   }
};



//tracklet.createUser("test", "pass", "test@openi.com");
//tracklet.deleteUser("test", "password");
//tracklet.createSite("test@openi.com", "testCloudletId");
//tracklet.giveAccess('test', 'view', '3')
//tracklet.track();

module.exports = tracklet;

