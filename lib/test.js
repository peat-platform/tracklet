var tracklet = require('./main');

//tracklet.giveAccess('test', 'view', '3');



/**
 * Track a request
 * urlref: name of the app making the request
 * uid: name of the company making the request
 * c_n: name of the object being requested
 */
tracklet.track({
   urlref: '',
   uid: 'betapond',
   c_n: 'o_1'
});