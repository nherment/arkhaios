
var crypto          = require("crypto")
var DBHelper        = require("../db/DBHelper.js").DBHelper
var logger          = require("../util/Logger.js")
var Analytics       = require("../web/Analytics.js")

module.exports = function(app) {
    return function() {

        app.post("/login", function(req, res) {

            var password = req.param("password")

            password = hash(password)

            DBHelper.Config.findByKey("admin", {}, function(err, admin) {
                if(err) {
                    res.send(err, 400)
                } else if(admin) {

                    if(admin.password === password) {
                        req.session.admin = true
                        res.redirect("/admin")
                    } else {
                        req.session.admin = false
                        res.send({reason: "wrong password"}, 403)
                    }

                } else {

                    admin = {
                        key: "admin",
                        password: password
                    }

                    DBHelper.Config.save(admin, function(err, admin) {
                        if(err) {
                            res.send(err, 400)
                        } else {
                            logger.info("First login. Administrator password created")
                            req.session.admin = true
                            res.redirect("/admin")
                        }
                    })
                }
            })
        })

        function hash(string) {
            var sha512 = crypto.createHash("sha512")
            sha512.update(string, "utf8")
            return sha512.digest("base64")
        }

        app.get("/logout", function(req, res) {
            Analytics.trackPage("/logout")
            req.session.destroy()
            res.redirect("/")
        })



        app.get("/:aclUid", function(req, res) {

            Analytics.trackPage("/auth/"+req.param("aclUid"))

            if(req.cookies.acls) {
                res.cookie("acls", req.cookies.acls.concat(req.param("aclUid")))
            }

            AclHandler.populateSessionWithAccessibleTags(req, function(err) {

                if(err) {

                    logger.error(err)
                    res.send(err, 400)

                } else {

                    logger.info("Authenticated with ACL ["+req.param("aclUid")+"]. Access to tags ["+JSON.stringify(req.session.tags)+"]")
                    res.redirect("/")
                }
            })
        })

    }
}