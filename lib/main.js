'use strict';

var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var config = require('./config');
var tracklet = {};
var token_auth = config.token_auth;
var domain = config.domain;
var rec = config.rec;
var _ = require('lodash');
var async = require('async');

//todo add /piwik/ before index.php in url when moving away from local php server

tracklet.createUser = function(params) {
   var url = domain+"index.php?module=API&method=UsersManager.addUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];
   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {

         if(p === 'name') {
            p = 'userLogin';
            params[p] = params['name'];
         }
         arr.push(p + '=' + params[p]);
      }
   }

   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
      })
   }
};

tracklet.deleteUser = function (params) {
   var url = domain+"index.php?module=API&method=UsersManager.deleteUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {

         if(p === 'name') {
            p = 'userLogin';
            params[p] = params['name'];
         }
         arr.push(p + '=' + params[p]);
      }
   }

   if (arr.length === 2) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
      })
   }
};


tracklet.createSite = function(params) {

   async.series([
         getSiteIds
   ],
   function(err, results){
      var idSites = parseInt(results[0]) + 1;
      var url = domain+"index.php?module=API&method=SitesManager.addSite&format=JSON&token_auth="+token_auth+"&";
      var arr = [];

      for (var p in params) {
         if (params.hasOwnProperty(p) && params[p] !== '') {
            if (p === 'email' || p === 'urls') {
               if (p === 'email') {
                  p = 'siteName';
                  params[p] = params['email'];
               }
               arr.push(p + '=' + params[p]);
            }
         }
      }
      params.idSites = idSites;
      arr.push('idSites' + '=' + idSites);
      if (arr.length === 3) {
         request(url + arr.join('&'), function (error, response, body) {
            if (error) {
               console.log(error);
            }
            tracklet.setAccess(params);
         })

      }
   });
};



tracklet.setAccess = function(params) {
   var url = domain+"index.php?module=API&method=UsersManager.setUserAccess&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {
         if (p === 'name' || p === 'access' || p === 'idSites') {
            if (p === 'name') {
               p = 'userLogin';
               params[p] = params['name'];
            }
            arr.push(p + '=' + params[p]);
         }
      }
   }

   //console.log(url + arr.join('&'));
   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
      })
   }
};


//todo pass cloudletID in params and from that find the site id to track against

tracklet.track = function(params) {

   var url = domain+'piwik.php?idsite=1&rec=1&send_image=0&apiv=1&';
   var arr = [];
   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {

         switch (p) {
            case 'app':
               p = 'urlref';
               params[p] = params['app'];
               break;
            case 'company':
               p = 'uid';
               params[p] = params['company'];
               break;
            case 'object':
               p = 'c_n';
               params[p] = params['c_n'];
               break;
         }

         if(p === 'urlref') {
            params[p] = 'http://'+params[p];
         }
         arr.push(p + '=' + params[p]);
      }
   }

   if (params.uid) {
      var id = crypto.createHash("md5").update(params.uid).digest("hex").slice(0, -16);
      arr.push('_id='+id);
   }

   if (arr.length > 0) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
      })
   }
};





tracklet.init = function(params) {
   var params = params;
   async.waterfall([
         async.apply(createUserTest, params),
         getSiteIds,
         createSiteTest,
         setAccessTest

   ],
   function(err, result){
      //console.log(result);
   });
};


function createUserTest(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=UsersManager.addUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];
   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {
         if (p === 'name' || p === 'password' || p === 'email') {
            if (p === 'name') {
               p = 'userLogin';
               params[p] = params['name'];
            }
            arr.push(p + '=' + params[p]);
         }
      }
   }
   console.log(url + arr.join('&'));

   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })
   }
}

function createSiteTest(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.addSite&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {
         if (p === 'email' || p === 'urls' || p === 'idSites') {
            if (p === 'email') {
               p = 'siteName';
               params[p] = params['email'];
            }
            arr.push(p + '=' + params[p]);
         }
      }
   }
   console.log(url + arr.join('&'));
   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })

   }

}

function setAccessTest(data, callback) {
   var params = data;

   var url = domain+"index.php?module=API&method=UsersManager.setUserAccess&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {
         if (p === 'name' || p === 'access' || p === 'idSites') {
            if (p === 'name') {
               p = 'userLogin';
               params[p] = params['name'];
            }
            arr.push(p + '=' + params[p]);
         }
      }
   }

   console.log(url + arr.join('&'));
   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })
   }


}


function getSiteIds(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.getAllSitesId&format=JSON&token_auth="+token_auth;
   request(url, function (error, response, body) {
      if (error) {
         console.log(error);
      }

      var siteIds = _.map((JSON.parse(body)), _.parseInt);
      params.idSites = _.max(siteIds) + 1;

      callback(null, params);
   })
}




module.exports = tracklet;

//todo decide how best to assign a unique vistor id, i.e. by company, by app, or a combination of both
//todo need to programmatically find the site id