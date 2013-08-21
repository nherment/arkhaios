Arkhaios is an online photo gallery with infinite scrolling and granular sharing capabilities

This is still work in progress (aka alpha version), administration is ugly and still hard to use but I'm getting there...
The sources are full of hacks.

[Feature requests as well as bugs report are greatly appreciated](https://github.com/nherment/arkhaios/issues)


![Arkhaios screenshot](http://docs.arkhaios.net/assets/screenshot.jpg "Arkhaios screenshot")


First Steps
===========

Install the application
-----------------------

Run these commands to install arkhaios (Mac OS):

    brew install imagemagick
    brew install graphicsmagick

    git clone git@github.com:nherment/arkhaios.git

    cd arkhaios

    npm install

Start the app
-------------

    echo ARKHAIOS_DB_NAME="arkhaios_db_name"
    echo ARKHAIOS_DB_HOST="localhost"
    echo ARKHAIOS_DB_PORT="27017
    echo ARKHAIOS_DB_USER="user"
    echo ARKHAIOS_DB_PWD="password"
    node server.js

Set up the admin password
-------------------------

The first login will set the administrator password. To do so, navigate to your app at http://localhost:3000/admin.

Information
===========

* Sources https://github.com/nherment/arkhaios
* Documentation: http://docs.arkhaios.net
* Live Demo: http://arkhaios.net
* License: MIT (see license file)
