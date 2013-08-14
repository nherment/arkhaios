var logger          = require("../util/Logger.js")
var DBHelper        = require("../db/DBHelper.js").DBHelper

function middleware () {
    return function(req, res, next) {
        if(!req.session.tags || req.query.aclUid) {
            populateSessionWithAccessibleTags(req, function(err) {
                next(err)
            })
        } else {
            setImmediate(next)
        }
    }
}

function populateSessionWithAccessibleTags(request, callback) {
    getAccessibleTags(request, function(err, tags) {
        if(err) {
            callback(err)
        } else {
            request.session.tags = tags
            callback()
        }
    })
}


function getAccessibleTags(request, callback) {

    logger.info("retrieving accessible tags")

    var aclUids = []

    if(request.param("aclUid")) {
        aclUids.push(request.param("aclUid"))
    }

    if(request.query.aclUid) {
        aclUids.push(request.query.aclUid)
    }

    if(request.cookies.acls) {
        for(var i = 0 ; i < request.cookies.acls ; i++) {
            if(aclUids.indexOf(request.cookies.acls[i]) === -1) {
                aclUids.push(request.cookies.acls[i])
            }
        }
    }

    if(aclUids.length > 0) {

        logger.info("User using ACLs "+JSON.stringify(aclUids));

        DBHelper.ACL.find(
            {uid: {"$in": aclUids}},
            {},
            function(err, acls) {

                if(err) {
                    logger.error(err)
                    callback(err)
                } else {

                    var tags = []

                    for(var i = 0 ; i < acls.length ; i++) {
                        tags = tags.concat(acls[i].tags)
                    }

                    if(tags.indexOf("Public") === -1) {
                        tags.push("Public")
                    }

                    logger.info("Authenticated with ACLs " + JSON.stringify(acls) + ". Access to tags " + JSON.stringify(tags))
                    callback(undefined, tags)
                }

            }
        )

    } else {

        setImmediate(function() {
            callback(undefined, ["Public"])
        })

    }
}

exports.middleware = middleware
exports.populateSessionWithAccessibleTags = populateSessionWithAccessibleTags