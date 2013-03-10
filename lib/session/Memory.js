/**
 * Memory module constructor
 * @constructor
 */
function Memory() {
    this.moduleName = 'kickup.session.Memory';
    this._sessions = {};
}

/**
 * Creates a new session
 */
Memory.prototype.create = function() {
    var sid = this._generateSID();
    this._sessions[sid] = {};
    return sid;
};

/**
 * Generates a Session ID (v4 UUID)
 * @private
 */
Memory.prototype._generateSID = function(ab) {
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
 * Returns the requested session, found by SID
 * @param {String} sid Session ID
 * @returns {Object} Session data
 */
Memory.prototype.getBySID = function(sid) {
    if(!this._sessions.hasOwnProperty(sid)) {
        throw new KickUp.error.Internal('Session does not exist: ' + sid);
    }
    return this._sessions[sid];
}

/**
 * Exports the session.Memory module
 * @type {Function}
 */
module.exports = Memory;