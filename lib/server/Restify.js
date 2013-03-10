/**
 * Module dependencies
 */
var restify = require('restify');

/**
 * Restify module constructor
 * @param {Object} options
 * @constructor
 */
function Restify(options) {
    if(!options) options = {};
    this.moduleName = 'kickup.util.Restify';
    this._listening = false;
    this._server = this._createServer(options);

    // Default authentication methods
    this.authentication = {
        check: this._defaultAuthCheck.bind(this),
        get: this._defaultAuthGet.bind(this)
    };
}

/**
 * Wrap all the restify errors (so the application must not include 'restify')
 * @type {Object}
*/
Restify.error = {
    Rest: restify.RestError,
    BadDigest: restify.BadDigestError,
    BadMethod: restify.BadMethodError,
    Internal: restify.InternalError,
    InvalidArgument: restify.InvalidArgumentError,
    InvalidContent: restify.InvalidContentError,
    InvalidCredentials: restify.InvalidCredentialsError,
    InvalidHeader: restify.InvalidHeaderError,
    InvalidVersion: restify.InvalidVersionError,
    MissingParameter: restify.MissingParameterError,
    NotAuthorized: restify.NotAuthorizedError,
    RequestExpired: restify.RequestExpiredError,
    RequestThrottled: restify.RequestThrottledError,
    WrongAccept: restify.WrongAcceptError,

    Unauthorized: restify.UnauthorizedError
};

/**
 * Creates a new Restify server instance
 * @param {Object} options Options which will be passed over to restify
 * @returns {Restify}
 * @private
 */
Restify.prototype._createServer = function(options) {
    var server = restify.createServer(options);

    this._implementOPTIONS(server);
    if(options.plugins) {
        options.plugins.forEach(function(plugin) {
            var pluginInstance = null;
            switch(plugin) {
                case 'acceptParser':
                    pluginInstance = restify[plugin](server.acceptable);
                    break;
                default:
                    pluginInstance = restify[plugin]();
                    break;
            }

            server.use(pluginInstance);
        });
    }

    return server;
};

/**
 * Implements the HTTP method OPTIONS
 * @param {Restify} server
 * @private
 */
Restify.prototype._implementOPTIONS = function(server) {
    server.on('MethodNotAllowed', function(req, res) {
        if(req.method.toUpperCase() === 'OPTIONS') {
            if(res.methods.indexOf('OPTIONS') === -1) res.methods.push('OPTIONS');
            var allowedHeaders = ['Accept', 'Accept-Version', 'Content-Type', 'Api-Version', 'X-Requested-With'];

            res.header('Access-Control-Allow-Credentials', true);
            res.header('Access-Control-Allow-Headers', allowedHeaders.join(', '));
            res.header('Access-Control-Allow-Methods', res.methods.join(', '));
            res.header('Access-Control-Allow-Origin', '*');
            return res.send(204);
        } else {
            return res.send(new restify.MethodNotAllowedError());
        }
    });
};

/**
 * Creates a new GET route
 * @param {String} route Name of the route
 * @param {Function} handler Route handler
 */
Restify.prototype.get = function(route, handler) {
    // Validate parameters
    if(!route) {
        throw new KickUp.error.Parameter('route', 'No route specified.');
    }
    if(!handler || handler.constructor.name !== 'RestifyHandler') {
        throw new KickUp.error.Parameter('method', 'No valid RestifyHandler provided.');
    }

    // Create a new route
    this._server.get(route, function(req, res, next) {
        handler.run(req, res, next);
    });
};

/**
 * Starts listening on the given port
 * @param {Number} port
 * @param {Function} callback
 */
Restify.prototype.listen = function(port, callback) {
    // Validate parameters
    if(isNaN(port) || !isFinite(port)) {
        throw new KickUp.error.Parameter('port', 'Must be a number.');
    }

    // Start listening
    this._server.listen(port, function() {
        this._listening = true;

        if(callback && callback.constructor === Function) {
            callback();
        }
    }.bind(this));
};

/**
 * Default authentication check (always return false & output a warning)
 * @return {Boolean}
 */
Restify.prototype._defaultAuthCheck = function() {
    throw new KickUp.error.Internal('No authentication.check method was provided.');
    return false;
};

/**
 * Gets the session data after an successful authentication
 * @return {Object}
 */
Restify.prototype._defaultAuthGet = function() {
    throw new KickUp.error.Internal('No authentication.get method was provided.');
    return {};
};

/**
 * Exports the server.Restify module
 * @type {Restify}
 */
module.exports = Restify;