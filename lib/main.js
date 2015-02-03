'use strict';

var request = require('request');
var uuid = require('node-uuid');
var fs = require('fs');
var configFile = './piwikConfig.json';
var config = JSON.parse(fs.readFileSync(configFile));
var tracklet = {};
//var token_auth = '90871c8584ddf2265f54553a305b6ae1';
var token_auth = config.token_auth;
var domain = "http://192.168.33.10/piwik/index.php";
var rec = '1';

tracklet.createUser = function (name, password, email) {
   var url;
   url = domain+"?module=API&method=UsersManager.addUser&format=JSON&userLogin="+name+"&password="+password+"&email="+email+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var body = JSON.parse(body);
      if (body.result === 'error') {
         console.log('Error: ' + body.message);
      }
   })
};

tracklet.deleteUser = function (name, password) {
   var url;
   url = domain+"?module=API&method=UsersManager.deleteUser&format=JSON&userLogin="+name+"&password="+password+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var body = JSON.parse(body);
      if (body.result === 'error') {
         console.log('Error: ' + body.message);
      }
   })
};

tracklet.createSite = function (siteName, urls) {
   var url;
   url = domain+"?module=API&method=SitesManager.addSite&format=JSON&siteName="+siteName+"&urls="+urls+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var body = JSON.parse(body);
      if (body.result === 'error') {
         console.log('Error: ' + body.message);
      }
   })
};

tracklet.giveAccess = function (userLogin, access, idSites) {
   var url;
   url = domain+"?module=API&method=UsersManager.setUserAccess&format=JSON&userLogin="+userLogin+"&access="+access+"&idSites="+idSites+"&token_auth="+token_auth;

   request(url, function (error, response, body) {
      var body = JSON.parse(body);
      if (error) {
         console.log(error)
      }
      if (body.result === 'error') {
         console.log('Error: ' + body.message);
      }
   })
};


/**
 * Calls the piwik tracking API
 * @param idSite id of the site, or in our case the users cloudlet
 * @param rec set to 1
 * @param url
 */

tracklet.track = function(idSite, rec, url) {
   var url;
   //var rand = uuid.v4();
   var domain = "http://192.168.33.10/piwik/piwik.php";
   url = domain+"?idsite=1&rec=1&uid=Velti&search=age&rand=";


   console.log(url);
   request(url, function (error, response, body) {
      //var body = JSON.parse(body);
      //if (body.result === 'error') {
      //   console.log('Error: ' + body.message);
      //}
      //console.log(body);
   })
};



//tracklet.createUser("test", "pass", "test@openi.com");
//tracklet.deleteUser("test", "password");
//tracklet.createSite("test@openi.com", "testCloudletId");
//tracklet.giveAccess('test', 'view', '3')
//tracklet.track();
console.log(token_auth);
module.exports = tracklet;

