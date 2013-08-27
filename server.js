var express         = require("express")
var logger          = require("./lib/util/Logger.js")
var fs              = require("fs")
var AclHandler      = require("./lib/auth/AclHandler.js")
var dust            = require("dustjs-linkedin")
var Analytics       = require("./lib/web/Analytics.js")
var RedisStore      = require("connect-redis")(express);

require('express-namespace')

var app = express()

app.use(express.static(__dirname + '/static'))

app.use(express.cookieParser("Arkhaios photography is gr34t"))

var redisConfig = getRedisConfig()

if(redisConfig) {
    app.use(express.session({
        store: new RedisStore(redisConfig),
        secret: "Arkhaios photography is gr34t"
    }));
} else {
    logger.warn("Redis configuration not found. Falling back to in-memory sessions.")
    app.use(express.session({secret: "Arkhaios photography is gr34t"}))
}
app.use(express.bodyParser())
app.use(AclHandler.middleware())


var compiledIndexPage

function getRedisConfig() {
    logger.debug("Redis config: HOST["+process.env.REDIS_HOST+"], PORT["+process.env.REDIS_PORT+"], PWD["+(process.env.REDIS_PWD ? "****":undefined)+"]")
    if(process.env.REDIS_HOST &&
       process.env.REDIS_PORT &&
       process.env.REDIS_PWD) {

        var conf = {
            host: process.env.REDIS_HOST,
            port: Number(process.env.REDIS_PORT),
            pass: process.env.REDIS_PWD
        }
        console.log(JSON.stringify(conf))
        return conf

    }
}

app.get("/", function(req, res) {

    // TODO: cache index in prod VS no cache in dev

    if(!compiledIndexPage) {
        compiledIndexPage = dust.compile(fs.readFileSync(__dirname + "/static/index.dust", "utf8"), "index");
        dust.loadSource(compiledIndexPage);
    }

    var data = {
        title: process.env.ARKHAIOS_TITLE || "Arkhaios",
        forkMe: process.env.ARKHAIOS_FORK_ME
    }

    if(process.env.ARKHAIOS_GA_UA && process.env.ARKHAIOS_GA_HOST) {
        data.googleAnalytics= {
            UA: process.env.ARKHAIOS_GA_UA,
            host: process.env.ARKHAIOS_GA_HOST
        }
    }

    dust.render("index", data, function(err, rendered) {
        if(err) {
            logger.error(err)
            res.send({reason: "non public"}, 500);
        } else {
//            res.contentType("text/html");
            res.send(rendered);
        }
    })
})


app.get("/login", function(req, res) {
    Analytics.trackPage("/login")
    res.sendfile(__dirname + "/static/login.html")
})

app.get("/admin", function(req, res) {
    if(req.session.admin) {
        res.sendfile(__dirname + "/static/admin.html")
    } else {
        res.redirect("/login")
    }
})

app.namespace("/admin", require("./lib/webservices/Admin.js")(app))
app.namespace("/auth", require("./lib/webservices/Auth.js")(app))
app.namespace("/api", require("./lib/webservices/API.js")(app))



var port = process.env.PORT || 3000

app.listen(port, function() {
    logger.info("Listening on port "+port)
})