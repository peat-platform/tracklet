//'use strict';

var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var config = require('./config');
var _ = require('lodash');
var async = require('async');
var tracklet = {};
var token_auth = config.token_auth;
var domain = config.domain;
var rec = config.rec;


//todo add /piwik/ before index.php in url when moving away from local php server
//todo pass cloudletID in params and from that find the site id to track against
//todo decide how best to assign a unique vistor id, i.e. by company, by app, or a combination of both


function track(data, callback) {
   var params = data;
   var url = domain+'piwik.php?rec=1&send_image=0&apiv=1&new_visit=1&';
   var arr = [];
   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '' && p !== 'cloudlet') {

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

         if(p === 'idSite') {
            p = 'idsite';
            params[p] = params['idSite'];
         }
         arr.push(p + '=' + params[p]);
      }
   }

   if (params.uid) {
      var id = crypto.createHash("md5").update(params.uid+params.urlref).digest("hex").slice(0, -16);
      arr.push('_id='+id);
   }

   if (arr.length > 0) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })
   }

}




tracklet.track = function(params) {
   async.waterfall([
         async.apply(idSiteCheck, params),
         track
      ],
      function(err, result){
         if (err) {
            console.log('Error: ' + err);
         } else {
            console.log('Event Tracked Successfully');
         }
      });
};



tracklet.init = function(params) {

   async.waterfall([
         async.apply(initCheck, params),
         createUser,
         getSiteIds,
         createSite,
         setAccess

   ],
   function(err, result){
      if (err) {
         console.log('Error: ' + err);
      } else {
         console.log('User/Site Created Successfully');
      }
   });
};


function createUser(data, callback) {
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

   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })
   }
}

function createSite(data, callback) {
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

   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })

   }

}

function setAccess(data, callback) {
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
   console.log('getSiteIds');
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


tracklet.test = function() {
   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   request(url, function (error, response, body) {
      if (error) {
         console.log(error);
      }

      var sites = _.values(JSON.parse(body));
      var siteNames = _.map(sites, function(n) {
         return(n.name);
      });

      var siteIds = _.map(sites, function(n) {
         return(_.trim(n.main_url, "http://"));
      });

      console.log(siteNames);

   })
};


function initCheck(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var err;
   request(url, function (error, response, body) {
      if (error) {
         console.log(error);
      }

      var sites = _.values(JSON.parse(body));
      var siteNames = _.map(sites, function(n) {
         return(n.name);
      });

      if (_.includes(siteNames, params.email)) {
         err = 'User Exists: ' + params.email;
         callback(err);
      } else {
         callback(null, params);
      }


   });

}


tracklet.remove = function(params) {

   async.waterfall([
         async.apply(deleteCheck, params),
         deleteUser,
         idSiteCheck,
         deleteSite
      ],
      function(err, result){
         if (err) {
            console.log('Error: ' + err);
         } else {
            console.log('User/Site Deleted Successfully');
         }
      });
};

function deleteCheck(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var err;
   var re = /http:\/\//gi;
   request(url, function (error, response, body) {
      if (error) {
         console.log(error);
      }

      var sites = _.values(JSON.parse(body));

      var siteIds = _.map(sites, function(n) {
         //return(_.trim(n.main_url, "http://"));
         return(n.main_url.replace(re, ''));
      });
      if (!_.includes(siteIds, params.site)) {
         err = 'Site Does not Exist: ' + params.site;
         callback(err);
      } else {
         callback(null, params);
      }

   });
}

function deleteUser(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=UsersManager.deleteUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {

         if(p === 'name') {
            p = 'userLogin';
            params[p] = params['name'];
            arr.push(p + '=' + params[p]);
         }

      }
   }

   //console.log(url + arr.join('&'));
   if (arr.length === 1) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         callback(null, params);
      })
   }

}


function deleteSite(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.deleteSite&format=JSON&token_auth="+token_auth+"&";
   var arr = [];
   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {

         if(p === 'idSite') {
            arr.push(p + '=' + params.idSite);
         }

      }
   }

   if (arr.length === 1) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }

         callback(null, params);

      })
   }

}


function idSiteCheck(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.getSitesIdFromSiteUrl&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {

         if(p === 'site') {
            p = 'url';
            params[p] = 'http://'+params['site'];
            arr.push(p + '=' + params[p]);
         } else if (p === 'cloudlet') {
            p = 'url';
            params[p] = 'http://'+params['cloudlet'];
            arr.push(p + '=' + params[p]);
         }

      }
   }
   if (arr.length === 1) {
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            console.log(error);
         }
         params.idSite = parseInt(JSON.parse(body)[0].idsite);
         callback(null, params);

      })
   }

}

module.exports = tracklet;

