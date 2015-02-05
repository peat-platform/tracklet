## Tracking for the Cloudlet Platform

[Piwik](http://piwik.org/) is the leading open source web analytics platform. It was designed to give valuable insights into website visitors, marketing campaigns etc., however,
we have taken a different approach with it. We are utilising it's tracking & reporting APIs, along with it's sophisticated UI, but for the purpose of tracking each data request
made against an OPENi users cloudlet.
Each user will then have their own web-frontend login to view this information.

### Plugins

All the functionality you see when you use Piwik is provided by Piwik Plugins. The core of Piwik (termed Piwik Core) only contains tools for those plugins. We have extended
the functionality of Piwik to suit our needs through the development of several plugins

*  OpeniAppTracker
*  OpeniCompanyTracker
*  OpeniLocationTracker
*  OpeniObjectTracker



### Dev Environment Usage

This tracking feature is currently under development and is subject to change. When you `vagrant up` the dev-env piwik will be running at `192.168.33.10:8888/piwik`


### Tracking Parameters


### Usage

This module is basically a wrapper for the [Piwik HTTP Tracking API](http://developer.piwik.org/api-reference/tracking-api) so you could experiment with it using straightforward
HTTP requests. Below are a few examples, assuming Piwik is running on the vagrant machine at port 8000.
`token_auth` is the admin token, i.e. not the users individual token. The default view for a new user is no site access.

*   App Tracking

         http://192.168.33.10:8888/piwik.php?idsite=1&rec=1&uid=OtherTest&urlref=http://psa

*   Company Tracking

         http://192.168.33.10:8888/piwik.php?idsite=1&rec=1&uid=Betapond

*   Object Tracking

         http://192.168.33.10:8888/piwik.php?idsite=1&rec=1&uid=TSSG&c_n=age_object

*   Create a User

         http://192.168.33.10:8888/?module=API&method=UsersManager.addUser&format=JSON&userLogin=John&password=password&email=john@openi.com&token_auth=1234

*   Create a Site

         http://192.168.33.10:8888/?module=API&method=SitesManager.addSite&format=JSON&token_auth=1234&siteName=john@openi.com&urls=johnsCloudletID

*   Give Access to a Site

         http://192.168.33.10:8888/?module=API&method=UsersManager.setUserAccess&format=JSON&token_auth=1234&userLogin=John&access=view&idSites=1

