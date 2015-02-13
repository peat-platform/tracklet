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


//todo add /piwik/ before index.php in url when moving away from local php server
//todo set up more accurate geolocation http://piwik.org/faq/how-to/#faq_164
//todo currently uses name & password for login but name is not unique, change to email

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
         async.apply(trackCheck, params),
         getSiteId,
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


function trackCheck(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var re = /http:\/\//gi;
   if(!params.cloudlet) {
      callback('missing cloudletID');
   } else if (!params.app || !params.company || !params.object) {
      callback('must have at least one tracking parameter');
   } else {
      request(url, function (error, response, body) {
         if (error) {
            callback(error);
         }

         var sites = _.values(JSON.parse(body));

         var siteIds = _.map(sites, function (n) {
            return (n.main_url.replace(re, ''));
         });

         if (!_.includes(siteIds, params.cloudlet)) {
            callback('Cloudlet ID not valid: ' + params.cloudlet);
         } else {
            callback(null, params);
         }
      });
   }
}

function track(params, callback) {
   var url = domain+'piwik.php?rec=1&send_image=0&apiv=1&new_visit=1&';
   var arr = [];

   arr.push('urlref=http://' + params.app);
   arr.push('uid=' + params.company);
   arr.push('c_n=' + params.object);
   arr.push('idsite=' + params.idSite);


   var id = crypto.createHash("md5").update(params.company+params.app).digest("hex").slice(0, -16);
   arr.push('_id='+id);

   request(url + arr.join('&'), function (error, response) {
      if (error) {
         callback(error);
      } else {
         callback(null, response.statusCode);
      }
   })

}


function initCheck(params, callback) {

   if(!params.name || !params.password || !params.email || !params.cloudlet || !params.access) {
      callback('missing parameters');
   } else {

      async.parallel([
            async.apply(emailCheck, params),
            async.apply(cloudletCheck, params)
         ],
         function(err, result){
            if (err) {
               console.log('Error: ' + err);
            } else {
               callback(null, params);
            }
         });
   }
}


function emailCheck(params, callback) {

   var url = domain+"index.php?module=API&method=UsersManager.userEmailExists&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('userEmail=' + params.email);
   request(url + arr.join('&'), function (error, response, body) {
      if (error) {
         callback(error);
      }

      if (JSON.parse(body).value === true) {
         callback('an account with this email already exists: ' + params.email);
      } else {
         callback(null, params);
      }

   });
}


function cloudletCheck(params, callback) {

   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var re = /http:\/\//gi;

   request(url, function (error, response, body) {
      if (error) {
         callback(error);
      }

      var sites = _.values(JSON.parse(body));

      var siteIds = _.map(sites, function (n) {
         return (n.main_url.replace(re, ''));
      });

      if (_.includes(siteIds, params.cloudlet)) {
         callback('an account with this cloudlet ID already exists: ' + params.cloudlet);
      } else {
         callback(null, params);
      }
   });


}

function createUser(params, callback) {
   var url = domain+"index.php?module=API&method=UsersManager.addUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('userLogin=' + params.email);
   arr.push('password=' + params.password);
   arr.push('email=' + params.email);



   request(url + arr.join('&'), function (error, response) {
      if (error) {
         callback(error);
      } else if (response.statusCode === 200) {
         callback(null, params);
      }

   })

}


function createSite(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.addSite&format=JSON&token_auth="+token_auth+"&";
   var arr = [];


   arr.push('siteName=' + params.email);
   arr.push('urls=' + params.cloudlet);


   request(url + arr.join('&'), function (error, response) {
      if (error) {
         callback(error);
      } else if (response.statusCode === 200) {
         callback(null, params);
      }
   })
}


function setAccess(params, callback) {

   var url = domain+"index.php?module=API&method=UsersManager.setUserAccess&format=JSON&token_auth="+token_auth+"&";
   var arr = [];


   arr.push('userLogin=' + params.email);
   arr.push('access=' + params.access);
   arr.push('idSites=' + params.idSite);


   request(url + arr.join('&'), function (error, response) {
      if (error) {
         callback(error);
      } else if (response.statusCode === 200) {
         callback(null, response.statusCode);
      }
   })
}


function getSiteId(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.getSitesIdFromSiteUrl&format=JSON&token_auth="+token_auth+"&";
   var arr =[];
   arr.push('url=http://' + params.cloudlet);

   request(url + arr.join('&'), function (error, response, body) {
      if (error) {
         callback(error);
      } else if (response.statusCode === 200) {
         params.idSite = parseInt(JSON.parse(body)[0].idsite);
         callback(null, params);
      }
   })
}


function deleteCheck(params, callback) {

   if(!params.email || !params.cloudlet) {
      callback('missing parameters');
   } else {

      async.parallel([
            async.apply(emailCheck2, params),
            async.apply(cloudletCheck2, params)
         ],
         function(err, result){
            if (err) {
               console.log('Error: ' + err);
            } else {
               callback(null, params);
            }
         });
   }
}


function emailCheck2(params, callback) {

   var url = domain+"index.php?module=API&method=UsersManager.userExists&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('userLogin=' + params.email);
   request(url + arr.join('&'), function (error, response, body) {
      if (error) {
         callback(error);
      }

      if (JSON.parse(body).value === false) {
         callback('an account with this email does not exist: ' + params.email);
      } else {
         callback(null, params);
      }

   });
}

function cloudletCheck2(params, callback) {

   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var re = /http:\/\//gi;


   request(url, function (error, response, body) {
      if (error) {
         callback(error);
      }

      var sites = _.values(JSON.parse(body));

      var siteIds = _.map(sites, function (n) {
         return (n.main_url.replace(re, ''));
      });

      if (!_.includes(siteIds, params.cloudlet)) {
         callback('an account with this cloudlet ID does not exist: ' + params.cloudlet);
      } else {
         callback(null, params);
      }
   });

}

function deleteUser(params, callback) {
   var url = domain+"index.php?module=API&method=UsersManager.deleteUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('userLogin=' + params.email);

   request(url + arr.join('&'), function (error, response) {
      if (error) {
         callback(error);
      } else if (response.statusCode === 200) {
         callback(null, params);
      }
   })
}


function deleteSite(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.deleteSite&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('idSite=' + params.idSite);

   request(url + arr.join('&'), function (error, response) {
      if (error) {
         callback(error);
      } else if (response.statusCode === 200) {
         callback(null, response.statusCode);
      }

   })
}



module.exports = tracklet;

