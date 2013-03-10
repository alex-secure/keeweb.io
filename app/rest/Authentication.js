/**
 * Module dependencies
 */
var path = require('path'),
    kpio = require('keepass.io');

/**
 * Authentication route constructor
 * @constructor
 */
function Authentication() {
    this.moduleName = 'app.rest.Authentication';

    App.require('kickup.server.RestifyHandler');
    App.require('kickup.session.Memory');
}

/**
 * Implements the REST routes
 */
Authentication.prototype.implement = function() {
    var _this = this;

    // GET /login/:dbname
    App.rest.get('/login/:dbname', new App._.server.RestifyHandler(function() {
        this.stack.push(_this._requestAuthentication.bind(_this));
        this.stack.push(_this._checkCredentials.bind(_this));
    }));

    // GET /logout
    App.rest.get('/logout', new App._.server.RestifyHandler(function() {
        this.stack.push(_this._logout.bind(_this));
    }));
};

/**
 * Requests authentication if no data was transmitted
 * @private
 */
Authentication.prototype._requestAuthentication = function(req, res, cb) {
    // Request authorization if no data was transmitted
    if(!req.authorization || !req.authorization.basic || !req.authorization.basic.password) {
        res.header('WWW-Authenticate', 'Basic realm="REST"');
        return cb(new App._.server.Restify.error.Unauthorized('Authorization required'));
    }

    return cb();
};

/**
 * Checks the login credentials (tries to open the database)
 * @private
 */
Authentication.prototype._checkCredentials = function(req, res, cb) {
    var db = new kpio();
    db.setCredentials({
        password: req.authorization.basic.password
    });

    var filename = path.join(__dirname, '..', '..', 'databases', req.params.dbname);
    db.load(filename, function(err, data) {
        if(err) {
            res.header('WWW-Authenticate', 'Basic realm="REST"');
            return cb(new App._.server.Restify.error.Unauthorized(err.toString()));
        }

        var sid = App.session.create();
        App.session.save(sid, {
            database: data
        });
        res.send({
            success: true,
            sid: sid
        });
        return cb();
    });
};

/**
 * Destroys the current session
 * @private
 */
Authentication.prototype._logout = function(req, res, cb) {
    if(!req.authorization || !req.authorization.basic || !req.authorization.basic.password) {
        return cb(new App._.server.Restify.error.Unauthorized('No session exists.'));
    }

    var sid = req.authorization.basic.password;
    res.send({
        success: true,
        destroyed: App.session.remove(sid)
    });
    return cb();
};

/**
 * Exports the rest.Authentication route
 * @type {Function}
 */
module.exports = Authentication;