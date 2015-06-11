'use strict';

var request = require('request');
var crypto = require('crypto');
var fs = require('fs');
var _ = require('lodash');
var async = require('async');
var mysql      = require('mysql');
var tracklet = {};
var token_auth;
var domain;
var connection;

//todo set up more accurate geolocation http://piwik.org/faq/how-to/#faq_164
//todo put in checks for piwik and mysql status

tracklet.config = function(config) {
   token_auth = config.piwik.token_auth;
   domain = config.piwik.domain;
   connection = mysql.createConnection(config.mysql);
};

tracklet.init = function(params, callback) {
   async.waterfall([
         async.apply(initCheck, params),
         createUser,
         createSite,
         getSiteId,
         setAccess
         //getAdminDashboard,
         //setUserDashboard
      ],
      function(err){
         if (err) {
            return callback(err);
         } else {
            connection.end(function(err) {
               if (err) {
                  return callback(err);
               }
            });
         }
      });
};


tracklet.track = function(params, callback) {
   async.waterfall([
         async.apply(trackCheck, params),
         getSiteId,
         track
      ],
      function(err) {
         if (err) {
            return callback(err);
         }
      });
};


tracklet.remove = function(params, callback) {
   async.waterfall([
         async.apply(deleteCheck, params),
         deleteUser,
         getSiteId,
         deleteSite
      ],
      function(err){
         if (err) {
            return callback(err);
         }
      });
};


function trackCheck(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var re = /http:\/\//gi;
   if(!params.cloudlet) {
      return callback('missing cloudletID');
   } else if (!params.app || !params.company || !params.object) {
      return callback('must have at least one tracking parameter');
   } else {
      request(url, function (error, response, body) {
         if (error) {
            return callback(error);
         }

         var sites;

         try {
            sites = _.values(JSON.parse(body));
         } catch (e) {
            return callback(e);
         }

         //var sites = _.values(JSON.parse(body));

         var siteIds = _.map(sites, function (n) {
            return (n.main_url.replace(re, ''));
         });

         if (!_.includes(siteIds, params.cloudlet)) {
            return callback('Cloudlet ID not valid: ' + params.cloudlet);
         } else {
            return callback(null, params);
         }
      });
   }
}


function track(params, callback) {
   var url = domain+'piwik.php?rec=1&send_image=0&apiv=1&new_visit=1&';
   var arr = [];


   arr.push('urlref=http://' + encodeURIComponent(params.app));
   arr.push('uid='           + encodeURIComponent(params.company));
   arr.push('c_n='           + encodeURIComponent(params.object));
   arr.push('idsite='        + encodeURIComponent(params.idSite));
   arr.push('c_t='           + encodeURIComponent(params.objData));

   var id = crypto.createHash("md5").update(params.company+params.app).digest("hex").slice(0, -16);
   arr.push('_id='+id);

   var options = {
      url: url + arr.join('&'),
      headers: {
         "REMOTE_ADDR"              : params.ip,
         "HTTP_X_FORWARDED_FOR"     : params.ip,
         "x-forwarded-for"          : params.ip
      }
   };

   request(options, function (error, response) {
      if (error) {
         return callback(error);
      } else {
         return callback(null, response.statusCode);
      }
   });

}


function initCheck(params, callback) {
   //console.log('getting checked');
   if(!params.password || !params.email || !params.cloudlet || !params.access) {
      return callback('missing parameters');
   } else {

      async.parallel([
            async.apply(emailCheck, params),
            async.apply(cloudletCheck, params)
         ],
         function(err){
            if (err) {
               return callback(err);
            } else {
               return callback(null, params);
            }
         });
   }
}



function createUser(params, callback) {
   var url = domain+"index.php?module=API&method=UsersManager.addUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('userLogin=' + params.email);
   arr.push('password=' + params.password);
   arr.push('email=' + params.email);
   arr.push('alias=' + params.name);



   request(url + arr.join('&'), function (error, response) {
      if (error) {
         return callback(error);
      } else if (response.statusCode === 200) {
         return callback(null, params);
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
         return callback(error);
      } else if (response.statusCode === 200) {
         return callback(null, params);
      }
   })
}


function setAccess(params, callback) {
   //console.log('setting access');
   var url = domain+"index.php?module=API&method=UsersManager.setUserAccess&format=JSON&token_auth="+token_auth+"&";
   var arr = [];


   arr.push('userLogin=' + params.email);
   arr.push('access=' + params.access);
   arr.push('idSites=' + params.idSite);


   request(url + arr.join('&'), function (error, response) {
      if (error) {
         return callback(error);
      } else if (response.statusCode === 200) {
         return callback(null, params);
      }
   })
}


function getSiteId(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.getSitesIdFromSiteUrl&format=JSON&token_auth="+token_auth+"&";
   var arr =[];
   arr.push('url=http://' + params.cloudlet);

   request(url + arr.join('&'), function (error, response, body) {
      if (error) {
         return callback(error);
      } else if (response.statusCode === 200) {
         try {
            params.idSite = parseInt(JSON.parse(body)[0].idsite);
         } catch (e) {
            return callback(e);
         }
         //params.idSite = parseInt(JSON.parse(body)[0].idsite);
         return callback(null, params);
      }
   })
}


function deleteCheck(params, callback) {

   if(!params.email || !params.cloudlet) {
      return callback('missing parameters');
   } else {

      async.parallel([
            async.apply(emailCheck, params),
            async.apply(cloudletCheck, params)
         ],
         function(err){
            if (err) {
               return callback(err);
            } else {
               return callback(null, params);
            }
         });
   }
}


function emailCheck(params, callback) {
   var url;
   var arr = [];

   if(_.size(params) === 5) {
      url = domain+"index.php?module=API&method=UsersManager.userEmailExists&format=JSON&token_auth="+token_auth+"&";
      arr = [];

      arr.push('userEmail=' + params.email);
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            return callback(error);
         }

         try {
            if (JSON.parse(body).value === true) {
               return callback('an account with this email already exists: ' + params.email);
            } else {
               return callback(null, params);
            }
         } catch (e) {
            return callback(e);
         }
         //if (JSON.parse(body).value === true) {
         //   return callback('an account with this email already exists: ' + params.email);
         //} else {
         //   return callback(null, params);
         //}

      });
   } else if (_.size(params) === 2) {
      url = domain+"index.php?module=API&method=UsersManager.userExists&format=JSON&token_auth="+token_auth+"&";
      arr = [];

      arr.push('userLogin=' + params.email);
      request(url + arr.join('&'), function (error, response, body) {
         if (error) {
            return callback(error);
         }

         try {
            if (JSON.parse(body).value === false) {
               return callback('an account with this email does not exist: ' + params.email);
            } else {
               return callback(null, params);
            }
         } catch (e) {
            return callback(e);
         }
         //if (JSON.parse(body).value === false) {
         //   return callback('an account with this email does not exist: ' + params.email);
         //} else {
         //   return callback(null, params);
         //}

      });
   }
}




function cloudletCheck(params, callback) {

   var url = domain+"index.php?module=API&method=SitesManager.getAllSites&format=JSON&token_auth="+token_auth;
   var re = /http:\/\//gi;

   request(url, function (error, response, body) {
      if (error) {
         return callback(error);
      }

      var sites;

      try {
         sites = _.values(JSON.parse(body));
      } catch (e) {
         return callback(e);
      }

      //var sites = _.values(JSON.parse(body));

      var siteIds = _.map(sites, function (n) {
         return (n.main_url.replace(re, ''));
      });

      if (_.includes(siteIds, params.cloudlet)) {
         if(_.size(params) === 5) {
            return callback('an account with this cloudlet ID already exists: ' + params.cloudlet);
         }
         if(_.size(params) === 2) {
            return callback(null, params);
         }
      } else {
         if(_.size(params) === 5) {
            return callback(null, params);
         }
         if(_.size(params) === 2) {
            return callback('an account with this cloudlet ID does not exist: ' + params.cloudlet);
         }

      }
   });
}


function deleteUser(params, callback) {
   var url = domain+"index.php?module=API&method=UsersManager.deleteUser&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('userLogin=' + params.email);

   request(url + arr.join('&'), function (error, response) {
      if (error) {
         return callback(error);
      } else if (response.statusCode === 200) {
         return callback(null, params);
      }
   })
}


function deleteSite(params, callback) {
   var url = domain+"index.php?module=API&method=SitesManager.deleteSite&format=JSON&token_auth="+token_auth+"&";
   var arr = [];

   arr.push('idSite=' + params.idSite);

   request(url + arr.join('&'), function (error, response) {
      if (error) {
         return callback(error);
      } else if (response.statusCode === 200) {
         return callback(null, response.statusCode);
      }

   })
}


function getAdminDashboard(params, callback) {
   connection.query('SELECT layout FROM piwik_user_dashboard WHERE login = ?', 'admin', function(err, rows) {
      if (err) {
         return callback(err);
      }
      params.layout = rows[0].layout;
      return callback(null, params);
   });
}

function setUserDashboard(params, callback) {
   var data = {
      login: params.email,
      iddashboard: 1,
      name: 'openi dashboard',
      layout: params.layout
   };

   connection.query('INSERT INTO piwik_user_dashboard SET ?', data, function(err, rows) {
      if (err) {
         return callback(err);
      }
      if (rows.affectedRows === 1) {
         return callback(null, 'success');
      }
   });
}


module.exports = tracklet;

