var express         = require("express")
var _               = require("underscore")
var UploadManager   = require("./lib/files/UploadManager.js")
var logger          = require("./lib/util/Logger.js")
var DBHelper        = require("./lib/db/DBHelper.js").DBHelper
var gm              = require("gm")
var im              = require("imagemagick")
var SerialRunner    = require("serial").SerialRunner
//var passport        = require('passport')
//var LocalStrategy   = require('passport-local').Strategy;

var uploadManager = new UploadManager()

var app = express()

app.use(express.static(__dirname + '/static'))
app.use(express.cookieParser("Arkhaios photography is gr34t"))
app.use(express.cookieSession({secret: "Arkhaios photography is gr34t"}))
app.use(express.bodyParser())


//passport.use(new LocalStrategy(
//    function(username, password, done) {
//        DB.Config.findOne({ key: "admin" }, function(err, adminUser) {
//            if (err) { return done(err); }
//            if (!adminUser) {
//                return done(null, false, { message: 'No admin account. Populate the DataBase' });
//            }
//            if (!user.validPassword(password)) {
//                return done(null, false, { message: 'Incorrect password.' });
//            }
//            return done(null, user);
//        });
//    }
//));

app.get("/", function(req, res) {
    res.sendfile(__dirname + "/static/index.html")
})

app.get("/admin", function(req, res) {
    res.sendfile(__dirname + "/static/admin.html")
})

app.post("/api/upload", function(req, res) {

    if(process.env.ARKHAIOS_READ_ONLY) {
        res.send({"reason": "uploads have been disabled"}, 403)
        return;
    }

    if(req.files) {
        if(_.isArray(req.files.images)) {
            var r = new SerialRunner()

            for(var i = 0  ; i < req.files.images.length ; i++) {

                r.add(uploadManager.upload, req.files.images[i])

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
            uploadManager.upload(req.files.images, function(err, imageInfo) {
                if(err) {
                    logger.error(err)
                    res.send(err, 400)
                } else {
                    res.redirect("/admin")
                }
            })

        }
    } else {
        res.send("missing files to upload", 400)

    }

})

app.get("/api/count/:tag", function(req, res) {
    DBHelper.Image.count({}, {}, function(err, count) {
        if(err) {
            res.send(err, 500)
        } else {
            res.send({count: count})
        }
    })
})

app.get("/api/list/:tag/:from/:to", function(req, res) {

    var tag = req.param("tag")
    var from = req.param("from")
    var to = req.param("to")

    DBHelper.Image.find(
        {},
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

app.get("/api/info/:uid", function(req, res) {

    DBHelper.Image.findByKey(req.params.uid, {}, function(err, imageInfo) {
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

app.post("/api/image/:uid", function(req, res) {

    if(process.env.ARKHAIOS_READ_ONLY) {
        res.send({"reason": "image edition has been disabled"}, 403)
        return;
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
app.get("/api/image/:uid", function(req, res) {

    DBHelper.Image.findByKey(req.param("uid"), {}, function(err, imageInfo) {
        if(err) {
            logger.error(err)
            res.send(err, 400)
        } else if(imageInfo) {
            var fs = require("fs")
            logger.info("Found image at path ["+imageInfo.path+"]")

            var width = req.param("width")
            var height = req.param("height")

//            console.log("width=" + width + ", height=" + height)

            if(width || height) {

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
                console.log(height)
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

                im.resize(resizeOptions, function(err, stdout, stderr) {
                    res.contentType("image/jpeg");
                    res.end(stdout, 'binary');
                })

            } else {
                res.setHeader("ContentType", "image/jpeg")
                var readStream = fs.createReadStream(imageInfo.path);
                readStream.pipe(res);
            }

        } else {
            res.send("Could not find image with UID ["+req.param("uid")+"]", 404)
        }
    })

})

app.listen(process.env.PORT || 3000)