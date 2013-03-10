/**
 * Memory module constructor
 * @constructor
 */
function Memory(lifetime) {
    this.moduleName = 'kickup.session.Memory';
    this._sessions = {};
    this._logger = null;
    this._lifetime = lifetime;
}

/**
 * Changes the active logger
 * @param {Object} logger Logger instance
 */
Memory.prototype.setLogger = function(logger) {
    if(!logger) {
        throw new KickUp.error.Parameter('logger', 'Must be a valid logger instance');
    }
    this._logger = logger;
};

/**
 * Creates a new session
 */
Memory.prototype.create = function() {
    var sid = this._generateSID(0, 0);
    this._sessions[sid] = {
        __lastAction: new Date()
    };
    return sid;
};

/**
 * Saves the session data
 * @param {String} sid Session ID
 * @param {Object} data Session data
 */
Memory.prototype.save = function(sid, data) {
    if(!this._sessions.hasOwnProperty(sid)) {
        throw new KickUp.error.Internal('Session does not exist: ' + sid);
    }
    data.__lastAction = new Date();
    this._sessions[sid] = data;
};

/**
 * Returns the requested session, found by SID
 * @param {String} sid Session ID
 * @returns {Object} Session data
 */
Memory.prototype.load = function(sid) {
    if(!this._sessions.hasOwnProperty(sid)) {
        throw new KickUp.error.Internal('Session does not exist: ' + sid);
    }
    var data = this._sessions[sid];
    data.sid = sid;
    return data;
};

/**
 * Removes the session with the given ID
 * @param {String} sid Session ID
 */
Memory.prototype.remove = function(sid) {
    if(!this._sessions.hasOwnProperty(sid)) {
        return []; // Session was already destroyed
    }

    this._sessions[sid] = null;
    delete this._sessions[sid];
    return [sid];
};

/**
 * Destroy all inactive sessions
 */
Memory.prototype.clean = function() {
    var now = new Date();

    for(var key in this._sessions) {
        var session = this._sessions[key];
        if(now - session.__lastAction > this._lifetime) {
            if(this._logger) {
                this._logger.debug('Session timeouted. Removed: ' + key);
                this.remove(key);
            }
        }
    }
};

/**
 * Generates a Session ID (v4 UUID)
 * @private
 */
Memory.prototype._generateSID = function(a, b) {
    for(b=a='';a++<36;b+=a*51&52?(a^15?8^Math.random()*(a^20?16:4):4).toString(16):'-'){}
    return b;
};

/**
 * Checks if the specified SID is valid
 * @param {String} sid Session ID
 * @returns {Boolean}
 */
Memory.prototype.checkSID = function(sid) {
    if(this._sessions.hasOwnProperty(sid)) return true;
    return false;
};

/**
 * Exports the session.Memory module
 * @type {Function}
 */
module.exports = Memory;