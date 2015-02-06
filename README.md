## Tracking for the Cloudlet Platform

[Piwik](http://piwik.org/) is the leading open source web analytics platform. It was designed to give valuable insights into website visitors, marketing campaigns etc., however,
we have taken a different approach with it. We are utilising it's tracking & reporting APIs, along with it's sophisticated UI, but for the purpose of tracking each data request
made against an OPENi users cloudlet.
Each user will then have their own web-frontend login to view this information.

### Plugins

All the functionality you see when you use Piwik is provided by Piwik Plugins. The core of Piwik (termed Piwik Core) only contains tools for those plugins. We have extended
the functionality of Piwik to suit our needs through the development of several plugins

*  [OpeniAppTracker](https://github.com/OPENi-ict/openi-app-tracker)
*  [OpeniCompanyTracker](https://github.com/OPENi-ict/openi-company-tracker)
*  [OpeniLocationTracker](https://github.com/OPENi-ict/openi-location-tracker)
*  [OpeniObjectTracker](https://github.com/OPENi-ict/openi-object-tracker)



### Dev Environment Usage

This tracking feature is currently under development and is subject to change. When you `vagrant up` the dev-env piwik will be running at `192.168.33.10:8888/piwik`, but needs
to be configured. There is a tutorial to follow.



### Usage

This module is basically a wrapper for the [Piwik HTTP Tracking API](http://developer.piwik.org/api-reference/tracking-api). Below are a few examples, assuming Piwik
is running on the vagrant machine at port 8888.
`token_auth` is the admin token, i.e. not the users individual token. The default view for a new user is no site access.

#### Config
Create a config file `config.js` with the following structure, including your Piwik adming token, and the corresponding Piwik domain

```javascript
var config = {};
config.token_auth = "";
config.domain = "";
config.rec = 1;
module.exports = config;
```

#### Create a new user, and site, and set the access correctly

```javascript
tracklet.init({
   name: 'philip',
   password: 'password',
   email: 'philip@openi.com',
   urls: 'philipsCloudletId',
   access: 'view'
});
```

#### Track a request

```javascript
tracklet.track({
   app: 'chrome',
   company: 'google',
   object: 'someObjectID'
});
```

#### Create a user

```javascript
tracklet.createUser({
   name: 'philip',
   password: 'password',
   email: 'philip@openi.com'
});
```

#### Delete a user

```javascript
tracklet.deleteUser({
   name: 'philip',
   email: 'philip@openi.com'
});
```

#### Create a site

```javascript
tracklet.createSite({
   siteName: 'philip@openi.com',
   urls: 'philipsCloudletId'
});
```

#### Set user access
Set access to one of 3 levels; view, noaccess, admin

```javascript
tracklet.setAccess({
   userLogin: 'philip',
   access: 'view',
   idSites: 1
});
```



