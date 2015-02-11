'use strict';

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

tracklet.init = function(params) {

   async.waterfall([
         async.apply(initCheck, params),
         createUser,
         createSite,
         getSiteId,
         setAccess

      ],
      function(err, result){
         if (err) {
            console.log('Error: ' + err);
         } else {
            if (result === 200) {
               console.log('Success');
            }
         }
      });
};


tracklet.track = function(params) {
   async.waterfall([
         async.apply(getSiteId, params),
         track
      ],
      function(err, result){
         if (err) {
            console.log('Error: ' + err);
         } else {
            if (result === 204) {
               console.log('Success');
            }
         }
      });
};


tracklet.remove = function(params) {

   async.waterfall([
         async.apply(deleteCheck, params),
         deleteUser,
         getSiteId,
         deleteSite
      ],
      function(err, result){
         if (err) {
            console.log('Error: ' + err);
         } else {
            if (result === 200) {
               console.log('Success');
            }
         }
      });
};

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
      request(url + arr.join('&'), function (error, response) {
         if (error) {
            console.log(error);
         } else {
            callback(null, response.statusCode);
         }
      })
   }

}


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
      request(url + arr.join('&'), function (error, response) {
         if (error) {
            console.log(error);
         } else if (response.statusCode === 200) {
            callback(null, params);
         }

      })
   }
}


function createSite(data, callback) {
   var params = data;
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
   if (arr.length === 2) {
      request(url + arr.join('&'), function (error, response) {
         if (error) {
            console.log(error);
         } else if (response.statusCode === 200) {
            callback(null, params);
         }
      })

   }

}


function setAccess(data, callback) {
   var params = data;

   var url = domain+"index.php?module=API&method=UsersManager.setUserAccess&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   for (var p in params) {
      if (params.hasOwnProperty(p) && params[p] !== '') {
         if (p === 'name' || p === 'access' || p === 'idSite') {
            if (p === 'name') {
               p = 'userLogin';
               params[p] = params['name'];
            }
            if (p === 'idSite') {
               p = 'idSites';
               params[p] = params['idSite'];
            }
            arr.push(p + '=' + params[p]);
         }
      }
   }
   console.log(url + arr.join('&'));
   if (arr.length === 3) {
      request(url + arr.join('&'), function (error, response) {
         if (error) {
            console.log(error);
         } else if (response.statusCode === 200) {
            callback(null, response.statusCode);
         }
      })
   }
   //callback(true);
}


function getSiteId(data, callback) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.getSitesIdFromSiteUrl&format=JSON&token_auth="+token_auth+"&";
   var arr =[];
   if (params.urls) {
      arr.push('url=http://' + params.urls);
   } else if (params.site) {
      arr.push('url=http://' + params.site);
   }

   console.log(url + arr);

   request(url + arr, function (error, response, body) {
      if (error) {
         console.log(error);
      } else if (response.statusCode === 200) {
         params.idSite = parseInt(JSON.parse(body)[0].idsite);
         callback(null, params);
      }
   })
}


tracklet.test = function(data) {
   var params = data;
   var url = domain+"index.php?module=API&method=SitesManager.getSitesIdFromSiteUrl&format=JSON&token_auth="+token_auth+"&";
   var arr =[];
   arr.push('url=http://' + params.urls);
   console.log(url + arr);

   request(url + arr, function (error, response, body) {
      if (error) {
         console.log(error);
      } else if (response.statusCode === 200) {
         params.idSite = parseInt(JSON.parse(body)[0].idsite);
         callback(null, params);
      }
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

   if (arr.length === 1) {
      request(url + arr.join('&'), function (error, response) {
         if (error) {
            console.log(error);
         } else if (response.statusCode === 200) {
            callback(null, params);
         }
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
      request(url + arr.join('&'), function (error, response) {
         if (error) {
            console.log(error);
         } else if (response.statusCode === 200) {
            callback(null, response.statusCode);
         }


      })
   }

}



module.exports = tracklet;

