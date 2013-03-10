/**
 * Module dependencies
 */
var path = require('path'),
    kpio = require('keepass.io');

/**
 * Login route constructor
 * @constructor
 */
function Login() {
    App.require('kickup.server.RestifyHandler');
    App.require('kickup.session.Memory');
}

/**
 * Implements the REST routes
 */
Login.prototype.implement = function() {
    var _this = this;

    // GET /login
    App.rest.get('/login/:dbname', new App._.server.RestifyHandler(function() {
        this.stack.push(_this._requestAuthentication.bind(_this));
        this.stack.push(_this._checkCredentials.bind(_this));
    }));
};

/**
 * Requests authentication if no data was transmitted
 * @private
 */
Login.prototype._requestAuthentication = function(req, res, cb) {
    // Request authorization if no data was transmitted
    if(!req.authorization || !req.authorization.basic || !req.authorization.basic.password) {
        res.header('WWW-Authenticate', 'Basic realm="restify"');
        return cb(new App._.server.Restify.error.Unauthorized('Authorization required'));
    }
    return cb();
};

/**
 * Checks the login credentials (tries to open the database)
 * @private
 */
Login.prototype._checkCredentials = function(req, res, cb) {
    var db = new kpio();
    db.setCredentials({
        password: req.authorization.basic.password
    });

    var filename = path.join(__dirname, '..', '..', 'databases', req.params.dbname);
    db.load(filename, function(err, data) {
        if(err) {
            return cb(new App._.server.Restify.error.InvalidCredentials('Credentials are invalid.'));
        }

        var sid = App.session.create();
        res.send({
            success: true,
            sid: sid
        });
        return cb();
    });
};

/**
 * Exports the rest.Login route
 * @type {Function}
 */
module.exports = Login;