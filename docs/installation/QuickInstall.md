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

