

### Arkhaios development is stopped. The folks at [koken](http://koken.me/) have developped a very good photo gallery based on PHP.


Arkhaios is an online photo gallery with infinite scrolling and granular sharing capabilities

This is still work in progress (aka alpha version), administration is ugly and still hard to use but I'm getting there...
The sources are full of hacks.

[Feature requests as well as bugs report are greatly appreciated](https://github.com/nherment/arkhaios/issues)


![Arkhaios screenshot](http://docs.arkhaios.net/assets/screenshot.jpg "Arkhaios screenshot")

Information
===========

* Sources https://github.com/nherment/arkhaios
* Documentation: http://docs.arkhaios.net
* Code Analysis: http://docs.arkhaios.net/report
* Live Demo: http://arkhaios.net


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

Options
=======


Http Port
---------

You can customize the port used by the webserver:

    export PORT=3000


Configuration:

The following are environment variables that you can use to customize Arkhaios.

    export ARKHAIOS_TITLE="My Website Title"  // website's title

    export ARKHAIOS_GA_UA="UA-43216-1"        // Google Analytics UA
    export ARKHAIOS_GA_HOST="localhost"       // Google Analytics host name

    export ARKHAIOS_FORK_ME="https://github.com/nherment/arkhaios" // fork me ribbon and it's URL


Troubleshooting
===============

Uploading files fails
---------------------

Try again without a proxy (eg. nginx or apache).

If it works, your proxy configuration may have a request timeout or a body size limit set.
For example, NGINX has low default limits (with reason !). Namely ```send_timeout``` and ```client_max_body_size```.

Help
----

For help, contact with through issues here: https://github.com/nherment/arkhaios/issues

How to administer Arkhaios
==========================

Administration URL
------------------

The http address to access the administration of Arkhaios is ```/admin```. If you are accessing your application from
```localhost```, the link to access it is http://localhost:3000/admin.

Logging in
----------

Before gaining access to the administration, you will need to be logged in. The first login will set the password.
Following logins will require you to enter the password that you entered the first time.

The password is stored in the DB as a un-salted SHA-512 hash.

Administration Menu
-------------------

The administration consists in the following menus:

- Upload
- Images
- Access Control

There is another menu item which allows you to logout

### Upload

This menu allows you to upload JPEG and PNG images. Other format are not supported yet.

By default, uploaded images are not tied to any tag. You can attach them to the ** Public ** tag to make them visible by
anonymous visitors.

### Images

Here you can rename uploaded images and attach them to tags.
Tags identify images and gives you great control to share them.

### Access Control

Access Controls (aka ACLs) are the best way to share your photos.

Each ACL is tied to one or several tags and generates a unique link. You can give this link to anyone. The links adds
up. This mean that if you give 2 ACLs links to one person, this person will have access to whatever either links gives
him access to.

There is a default ACL that you never see. It allows any visitor to see images tied to the ** Public ** tag.

#### Sharing examples

*Example 1*

I have two tags, ** Family ** and ** Friends **. I create one ACL for each tag and give one to my friends and the other one
to my parent. I give my wife both links so that she can see all the pictures I make.

*Example 2*

I create as many tags as I do activities. For example, last week-end was my mother's birthday so I create a tag called
** 2013 Mom Birthday **. This tag is shared with anyone that was present.

If everytime I do an activity I create a specific tag, I can choose to just share this tag with whoever was present.

TODOs
=====

Unordered list of things on my plate.

- refactor the code (crappy all over)
- cookie for 'remember me' on access controls
- installation wizard
- show detail of image
- show image name on mouse hover
- capability to add description to pictures
- batch edit of pictures
- tags autocomplete
- add tags on image upload
- use Redis as memory store
- automatically convert tiff to jpeg and work as an archiving mecanism
- span multiple servers (either smart resolution of images file paths or shared storage bay or amazon S3...)
- multi-tenancy

The MIT License (MIT)
=====================

Copyright (c) 2013 Nicolas Herment

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
