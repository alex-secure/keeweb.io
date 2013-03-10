/**
 * Module dependencies
 */
var restify = require('restify');

/**
 * RestifyHandler constructor
 * @param {Function} constructor
 * @constructor
 */
function RestifyHandler(constructor) {
    this._authMethods = null;
    this.stack = [];

    if(!constructor || constructor.constructor !== Function) {
        throw new KickUp.error.Parameter('constructor', 'Needs to be a function.');
    }
    constructor.apply(this);
}

/**
 * Requires authentication for the route
 * @param {Object} authMethods Authentication methods
 */
RestifyHandler.prototype.requireAuth = function(authMethods) {
    this._authMethods = authMethods;
};

/**
 * Run the route handler (creates a copy of the handler stack)
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
RestifyHandler.prototype.run = function(req, res, next) {
    // Is authentication required?
    if(this._authMethods) {
        if(!req.authorization || !req.authorization.basic) {
            res.header('WWW-Authenticate', 'Basic realm="REST"');
            return next(new restify.UnauthorizedError('Authorization required'));
        }

        var auth = req.authorization.basic;
        if(!this._authMethods.check(auth.username, auth.password)) {
            res.header('WWW-Authenticate', 'Basic realm="REST"');
            return next(new restify.UnauthorizedError('Invalid credentials were provided.'));
        } else {
            req.session = this._authMethods.get(auth.username, auth.password);
        }
    }

    // Process the route
    this._workStack = this.stack.slice(0); // slice(0) creates a copy of the array
    this._pop(req, res, next);
};

/**
 * Goes through the stack and calls all the functions
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 * @param {Error} err Error object (should be null when no error occured)
 * @returns {Boolean}
 * @private
 */
RestifyHandler.prototype._pop = function(req, res, next, err) {
    if(err) {
        return next(err);
    }

    var fn = this._workStack.shift();
    if(fn && fn.constructor === Function) {
        return fn(req, res, function(err) {
            this._pop(req, res, next, err);
        }.bind(this));
    }

    return next();
};

/**
 * Exports the server.RestifyHandler module
 * @type {RestifyHandler}
 */
module.exports = RestifyHandler;