
var _               = require("underscore")
var DB              = require("./DB.js").DB
var DBReady         = require("./DB.js").Event
var EventEmitter    = require('events').EventEmitter
var ParallelRunner  = require("serial").ParallelRunner
var logger          = require("../util/Logger.js")

var DBHelper = {}

DBReady.on('ready', function(){
    module.exports.Event.emit('ready')
})

DBHelper.Image = {
    findOne: function(query, options, callback) {

        DB.findOne("images", query, options, callback)

    },

    findByKey: function(uid, options, callback) {
        DB.findOne("images", {'uid': uid}, options, callback)

    },

    find: function(query, fields_or_options, options_or_callback, callback) {

        DB.find("images", query, fields_or_options, options_or_callback, callback)

    },

    count: function(query, optsOrCallback, callback) {
        DB.count("images", query, optsOrCallback, callback)
    },

    update: function(query, obj, options, callback) {

        DB.update("images", query, obj, options, callback)

    },

    save: function(obj, callback) {

        if(obj._id) {

            DB.update("images", {"_id":obj._id}, obj, {safe: true}, callback)

        } else if(_.isArray(obj)) {

            var callbackCount = obj.length

            console.log("It's an array of length ["+callbackCount+"]")

            var error
            var results = []

            var doneCallback = function(err, result) {

                callbackCount --
                console.log(callbackCount)

                if(err) {
                    logger.error(err)
                    error = new Error("Multiple errors while saving objects")
                }

                if(result) {
                    results.push(result)
                }

                if(callbackCount === 0) {
                    callback(error, result)
                }

            }

            for(var i = 0 ; i < obj.length ; i++) {

                if(obj[i] && obj[i]._id) {
                    console.log("update ["+i+"]")
                    DB.update({"_id": obj[i]._id}, obj[i], {safe: true}, function(err, result) {
                        console.log("update is back")
                        doneCallback(err, result)
                    })
                } else {
                    console.log("save ["+i+"]")
                    DB.save("images", obj[i], function(err, result) {
                        console.log("save is back")
                        doneCallback(err, result)
                    })
                }

            }

        } else {

            DB.save("images", obj, callback)

        }
    },

    findAndModify: function(query, sortOrder, update, options, callback) {
        DB.findAndModify("images", query, sortOrder, update, options, callback)
    },

    remove: function(selector,option_or_callback,callback){
        DB.remove("images",selector,option_or_callback,callback)
    }
}


module.exports = {
    DBHelper: DBHelper,
    Event: new EventEmitter()
}

