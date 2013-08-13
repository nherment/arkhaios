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