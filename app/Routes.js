/**
 * Module dependencies
 */
var path = require('path');

/**
 * Array which contains all the active routes
 * @type {Array}
 */
var ACTIVE_ROUTES = [
    'Login'
];

/**
 * Routes module constructor
 * @constructor
 */
function Routes() {
    this.moduleName = 'app.Routes';
    this._logger = null;

    App.require('kickup.server.Restify');
}
Routes.IS_SINGLETON = true;

/**
 * Changes the active logger
 * @param {Object} logger Logger instance
 */
Routes.prototype.setLogger = function(logger) {
    if(!logger) {
        throw new KickUp.error.Parameter('logger', 'Must be a valid logger instance');
    }
    this._logger = logger;
};

/**
 * Implements all the REST routes
 */
Routes.prototype.implement = function() {
    ACTIVE_ROUTES.forEach(function(route) {
        var routeInstance = new (require(path.join(__dirname, 'rest', route)))();
        routeInstance.implement();

        if(this._logger) this._logger.debug('Route implemented: ' + route);
    }.bind(this));
};

/**
 * Exports the app.Routes module
 * @type {Routes}
 */
module.exports = Routes;