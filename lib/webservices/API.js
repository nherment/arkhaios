
var uuid            = require("uuid")
var DBHelper        = require("../db/DBHelper.js").DBHelper
var logger          = require("../util/Logger.js")
var gm              = require("gm")
var _               = require("underscore")
var UploadManager   = require("../files/UploadManager.js")
var Analytics       = require("../web/Analytics.js")
var SerialRunner    = require("serial").SerialRunner


var uploadManager = new UploadManager()

module.exports = function(app) {
    return function() {

        app.post("/acl", function(req, res) {

            if(!req.session.admin) {
                res.send({reason: "login required"}, 401)
                return
            }

            var acl = {
                uid: uuid.v4(),
                name: req.param("name"),
                tags: req.param("tags") ? req.param("tags").split(",") : []
            }

            DBHelper.ACL.save(acl, function(err, savedAcl) {

                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else {
                    res.redirect("/admin")
                }

            })

        })
        app.post("/acl/:uid", function(req, res) {

            if(!req.session.admin) {
                res.send({reason: "login required"}, 401)
                return
            }

            DBHelper.ACL.findByKey(req.param("uid"), {}, function(err, acl) {
                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else if(acl) {
                    var hasChanged = false;

                    for(var attr in req.body) {
                        switch(attr) {
                            case "uid":
                                logger.warn("Attempt to change the UID of the acl is refused");
                                break;
                            case "tags":
                                req.body[attr] = req.body[attr].split(",");
                            default:
                                if(!_.isEqual(acl[attr], req.body[attr])) {
                                    acl[attr] = req.body[attr];
                                    hasChanged = true;
                                }
                                break;
                        }
                    }

                    if(hasChanged) {
                        DBHelper.ACL.save(acl, function(err, updatedAcl) {
                            if(err) {
                                logger.error(err)
                                res.send(err, 400)
                            } else {
                                res.redirect("/admin")
                            }
                        })
                    } else {
                        res.redirect("/admin")
                    }
                } else {
                    // TODO log error
                    res.redirect("/admin")
                }
            })

        })


        app.get("/acl/list", function(req, res) {

            if(!req.session.admin) {
                return res.send({reason: "login required"}, 401)
            }

            var from = req.param("from")
            var to = req.param("to")

            DBHelper.ACL.find(
                {},
                {
                    _id: 0,
                    uid: 1,
                    name: 1,
                    tags: 1
                },
                {
                    sort:   [["name", "asc"]]
//            limit:  (to-from),
//            skip:   from
                },
                function(err, acls) {

                    if(err) {
                        res.send(err, 400)
                    } else {
                        res.send(acls)
                    }

                }
            )

        })

        app.post("/upload", function(req, res) {

            if(!req.session.admin) {
                res.send({reason: "login required"}, 401)
                return
            }

            logger.info("Received upload: "+JSON.stringify(req.files))

            if(req.files) {
                if(_.isArray(req.files.file)) {
                    var r = new SerialRunner()

                    for(var i = 0  ; i < req.files.file.length ; i++) {

                        r.add(uploadManager.upload, req.files.file[i])

                    }

                    var errors = []

                    r.onError(function(err) {
                        errors.push(err)
                    })

                    r.run(function() {
                        if(errors.length > 0) {
                            res.send(errors, 400)
                        } else {
                            res.redirect("/admin")
                        }
                    })

                } else {
                    uploadManager.upload(req.files.file, function(err, imageInfo) {
                        if(err) {
                            logger.error(err)
                            res.send(err, 400)
                        } else {
                            res.redirect("/admin")
                        }
                    })

                }
            } else {

                logger.error("Could not find files to upload in the http request")
                res.send({ "reason": "missing files to upload" }, 400)

            }

        })

        app.get("/count/:tag", function(req, res) {

            var query = {tags: {"$in": req.session.tags}}

            if(req.session.admin) {
                query = {}
            }

            DBHelper.Image.count(query, {}, function(err, count) {
                if(err) {
                    res.send(err, 500)
                } else {
                    res.send({count: count})
                }
            })
        })

        app.get("/list/:tag/:from/:to", function(req, res) {

//    if(!req.session.tags) {
//        if(req.cookies.acls) {
//
//        }
//        res.cookie('rememberme', ["",""], { expires: new Date(Date.now() + 900000), httpOnly: true });
//    }


            var to = req.param("to")
            var from = req.param("from")


            var query = {tags: {"$in": req.session.tags}}

            if(req.session.admin) {
                query = {}
            }

            DBHelper.Image.find(
                query,
                {
                    _id: 0,
                    uid: 1,
                    name: 1,
                    width: 1,
                    height: 1,
                    tags: 1,
                    "dateUploaded": 1
                },
                {
                    sort:   [["dateUploaded", "desc"]],
                    limit:  (to-from),
                    skip:   from
                },
                function(err, imagesInfos) {

                    if(err) {
                        res.send(err, 400)
                    } else {
                        res.send(imagesInfos)
                    }

                }
            )

        })

        app.get("/info/:uid", function(req, res) {

            // TODO: add ACL check

            DBHelper.Image.findByKey(req.param("uid"), {}, function(err, imageInfo) {
                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else {
                    var fs = require("fs")
                    logger.info("Found image at path ["+imageInfo.path+"]")
                    res.send(imageInfo)
                }
            })

        })

        app.post("/image/:uid", function(req, res) {
            if(!req.session.admin) {
                res.send({reason: "login required"}, 401)
                return
            }

            DBHelper.Image.findByKey(req.param("uid"), {}, function(err, imageInfo) {
                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else if(imageInfo) {
                    var hasChanged = false;

                    for(var attr in req.body) {
                        switch(attr) {
                            case "uid":
                                logger.warn("Attempt to change the UID of the image is refused");
                                break;
                            case "tags":
                                req.body[attr] = req.body[attr].split(",");
                            default:
                                if(!_.isEqual(imageInfo[attr], req.body[attr])) {
                                    imageInfo[attr] = req.body[attr];
                                    hasChanged = true;
                                }
                                break;
                        }
                    }

                    if(hasChanged) {
                        DBHelper.Image.save(imageInfo, function(err, updatedImageInfo) {
                            if(err) {
                                logger.error(err)
                                res.send(err, 400)
                            } else {
                                res.redirect("/admin")
                            }
                        })
                    } else {
                        res.redirect("/admin")
                    }
                } else {
                    // TODO log error
                    res.redirect("/admin")
                }
            })

        })


        function tagsMatch(tags1, tags2) {

            var match = false

            if(tags1 && tags2) {
                for(var i = 0 ; i < tags1.length ; i++) {
                    if(tags2.indexOf(tags1[i]) !== -1) {
                        match = true
                        break
                    }
                }
            }

            return match
        }

        app.delete("/image/:uid", function(req, res) {

            if(!req.session.admin) {
                res.send({reason: "login required"}, 401)
                return
            }

            DBHelper.Image.findByKey(req.param("uid"), {}, function(err, imageInfo) {
                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else if(imageInfo) {

                    var fs = require("fs")
                    logger.info("Found image at path ["+imageInfo.path+"]")

                    Analytics.trackEvent({
                        category: 'Image',
                        action: 'delete',
                        label: imageInfo.name,
                        value: req.param("uid")
                    })


                    logger.info("deleting image ["+imageInfo.uid+"]")
                    DBHelper.Image.remove({uid: imageInfo.uid}, function(err) {
                        if(err) {
                            logger.error(err)
                            res.send(err, 400)
                        } else {
                            fs.unlink(imageInfo.path, function(err) {
                                if(err) {
                                    logger.error(err)
                                    res.send(err, 400)
                                } else {
                                    res.send(imageInfo)

                                    logger.info("deleted image ["+imageInfo.uid+"]")
                                }
                            })
                        }
                    })

                } else {
                    res.send("Could not find image with UID ["+req.param("uid")+"]", 404)
                }
            })
        })

        app.get("/image/:uid", function(req, res) {

//    Analytics.trackPage("/api/image/"+req.param("uid"))

            DBHelper.Image.findByKey(req.param("uid"), {}, function(err, imageInfo) {
                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else if(imageInfo) {

                    var fs = require("fs")
                    logger.info("Found image at path ["+imageInfo.path+"]")

                    if(!req.session.admin && !tagsMatch(req.session.tags, imageInfo.tags)) {
                        return res.send({"reason": "You are not authorized to see this image"}, 403)
                    }

                    var width = req.param("width")
                    var height = req.param("height")

                    if(width || height) {

                        Analytics.trackEvent({
                            category: 'Image',
                            action: 'small',
                            label: imageInfo.name,
                            value: req.param("uid")
                        })

                        if(!width) {
                            if(imageInfo.width) {
                                width = imageInfo.width
                            } else {
                                width = 5 * height;
                            }
                        }
                        if(!height) {
                            if(imageInfo.height) {
                                height = imageInfo.height
                            } else {
                                height = 5 * width;
                            }
                        }

                        logger.info("returning resized image with width="+width+", height="+height)

                        var format;

                        switch(imageInfo.type) {
                            case "image/png":
                                format = "png";
                                break;
                            case "image/jpg":
                            case "image/jpeg":
                            default:
                                format = "jpg"
                                break;
                        }

                        var resizeOptions = {
                            srcPath: imageInfo.path,
                            srcData: null,
                            srcFormat: null,
                            dstPath: undefined,
                            quality: 1,
                            format: format,
                            progressive: false,
                            width: width,
                            height: height,
                            strip: true,
                            filter: 'Lagrange',
                            sharpening: 0.2,
                            customArgs: []
                        }

                        var stream = gm(imageInfo.path).resize(width, height).stream();

                        res.contentType(imageInfo.type);

                        stream.on("data", function(data) {
                            res.write(data)
                        })

                        stream.on("end", function(data) {
                            res.end();
                        })

                        stream.on("error", function() {
                            res.send({reason: "unknown error while resizing the image"}, 500);
                        })

                    } else {

                        Analytics.trackEvent({
                            category: 'Image',
                            action: 'raw',
                            label: imageInfo.name,
                            value: req.param("uid")
                        })

                        res.setHeader("ContentType", "image/jpeg")
                        var readStream = fs.createReadStream(imageInfo.path);
                        readStream.pipe(res);
                    }

                } else {
                    res.send("Could not find image with UID ["+req.param("uid")+"]", 404)
                }
            })

        })
    }

}