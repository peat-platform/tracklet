var tracklet = require('./main');


/**
 * Track a request
 * app: name of the app making the request
 * company: name of the company making the request
 * object: name of the object being requested
 */
//tracklet.track({
//   app: 'opera',
//   company: 'velti',
//   object: ''
//});


//tracklet.createUser({
//   name: 'philip',
//   password: 'password',
//   email: 'philip@openi.com'
//});

//tracklet.deleteUser({
//   name: 'philip',
//   email: 'philip@openi.com'
//});

/**
 * Create a site. Each user will login and have access to just their site
 * siteName: user email
 * urls: user cloudlet ID
 */
//tracklet.createSite({
//   siteName: 'blurg@openi.com',
//   urls: 'blurgsCloudletId'
//});


/**
 * Set user access
 * access: one of 3 levels; access, noaccess, admin
 */
//tracklet.setAccess({
//   name: 'john',
//   access: 'view',
//   idSites: 6
//});



tracklet.init({
   name: 'flint',
   password: 'password',
   email: 'flint@openi.com',
   urls: 'flintsCloudletId',
   access: 'view'
});

