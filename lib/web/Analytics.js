
var logger          = require("../../lib/util/Logger.js")
var GoogleAnalytics = require("ga")

if(!process.env.ARKHAIOS_GA_UA) {
    logger.warn("Missing environment variable [ARKHAIOS_GA_UA]. Server side Google Analytics will be disabled.")
}

if(!process.env.ARKHAIOS_GA_HOST) {
    logger.warn("Missing environment variable [ARKHAIOS_GA_HOST]. Server side Google Analytics will be disabled.")
}

function Analytics() {

    if(process.env.ARKHAIOS_GA_UA && process.env.ARKHAIOS_GA_HOST) {
        var ga = new GoogleAnalytics(process.env.ARKHAIOS_GA_UA, process.env.ARKHAIOS_GA_HOST)
    }

    this.trackPage = function(pageName) {
        if(ga) {
            ga.trackPage(pageName);
        }
    }

    this.trackEvent = function(event) {
//        {
//            category: 'Videos',
//            action: 'Video Loading',
//            label: 'Gone With the Wind',
//            value: 42
//        }

        if(ga) {
            ga.trackEvent(event)
        }
    }




}

module.exports = new Analytics();