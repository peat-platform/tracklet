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
to be configured. There is a [tutorial here](https://github.com/OPENi-ict/openi-dev-env/wiki/Piwik-Setup).

#### Config
Create a config file `config.js` with the following structure, including your Piwik auth token, and the corresponding Piwik domain

```json
var config = {};
config.piwik = {};
config.mysql = {};

config.piwik.token_auth = "";
config.piwik.domain = "http://127.0.0.1:8000/";

config.mysql.host = 'localhost';
config.mysql.user = 'piwik';
config.mysql.password = 'password';
config.mysql.database = 'piwik';
config.mysql.multipleStatements = 'true';


module.exports = config;
```

Then require both the tracklet package and the config file

```javascript
var tracklet = require('tracklet');
var config = require('./config');
tracklet.config(config);
```

### Usage

This module is basically a wrapper for the [Piwik HTTP Tracking API](http://developer.piwik.org/api-reference/tracking-api).
`token_auth` is the admin token, i.e. not the users individual token. The default view for a new user is no site access.


#### Create a new user, and site, and set the access correctly

```javascript
tracklet.init({
   password: 'password',
   email: 'philip@openi.com',
   cloudlet: 'philipsCloudletId',
   access: 'view'
});
```

#### Track a request

```javascript
tracklet.track({
   cloudlet: 'someUsersCloudletID'
   app: 'chrome',
   company: 'google',
   object: 'someObjectID'
});
```


#### Delete a user & corresponding site

```javascript
tracklet.remove({
   email: 'philip@openi.com',
   cloudlet: 'philipsCloudletId'
});
```

### Example of Running Instance

Below is what the dashboard will look like for users

![](https://github.com/OPENi-ict/openi-dev-env/blob/master/docs/images/Piwik%20OPENi%20Dashboard.png)