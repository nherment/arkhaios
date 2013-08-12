
var fs              = require("fs")
var wrench          = require("wrench")
var moment          = require("moment")
var uuid            = require("uuid")
var DBHelper        = require("../db/DBHelper.js").DBHelper
var logger          = require("../util/Logger.js")
var im              = require("imagemagick")

var UPLOAD_DIR = process.cwd() + "/uploads"

function UploadManager() {

    wrench.mkdirSyncRecursive(UPLOAD_DIR, 0744);

    var self = this

    this.upload = function(fileInfo, callback) {

        if(!fileInfo) {
            // TODO: error
            setImmediate(callback)
            return
        }

        var uploadFileDir = UPLOAD_DIR + "/" + moment().format("YYYY-MM-DD")
        wrench.mkdirSyncRecursive(uploadFileDir, 0744)

        logger.info("Uploading file ["+fileInfo.name+"]")

        var imageUuid = uuid.v4()

        var filePath = uploadFileDir + "/" + imageUuid

        im.identify(fileInfo.path, function(err, features) {

            if (err) {

                callback(err, undefined)

            } else {

                var image = {
                    uid: imageUuid,
                    path: filePath,
                    name: fileInfo.name,
                    type: fileInfo.type,
                    size: fileInfo.size,
                    dateUploaded: new Date(),
                    width: features.width,
                    height: features.height
                }

                logger.info("Moving file from ["+fileInfo.path+"] to ["+image.path+"]")

                moveFile(fileInfo.path, image.path, function(err) {

                    if(err) {
                        logger.error(err)
                        callback(err, undefined)
                    } else {
                        DBHelper.Image.save(image, function(err, savedImage) {
                            if(err) {
                                logger.error(err)
                                callback(err, undefined)
                            } else {
                                callback(undefined, savedImage)
                            }
                        })
                    }
                })
            }
        })
    }
}

function moveFile(src, dst, cb) {
    function copyIfFailed(err) {
        if (!err) {
            return cb(null);
        } else {
            logger.error(err)
            copy(src, dst, function(err) {
                if (!err) {
                    // TODO
                    // should we revert the copy if the unlink fails?
                    fs.unlink(src, cb);
                } else {
                    cb(err);
                }
            });
        }
    }

    fs.stat(dst, function (err) {
        if (!err) {
            return cb(new Error("File " + dst + " exists."));
        }
        fs.rename(src, dst, copyIfFailed);
    })
}

function copy(from, to, cb) {

    logger.info("Copying file from ["+from+"] to ["+to+"]")

    var is = fs.createReadStream(from);
    var os = fs.createWriteStream(to);

    var done = false;

    is.pipe(os);
    is.on('end',function() {
        if(!done) {
            done = true
            cb()
        }
    });
    is.on('error', function(err) {
        if(!done) {
            done = true
            cb(err)
        }
    })

}

module.exports = UploadManager