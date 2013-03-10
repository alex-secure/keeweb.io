/**
 * Module dependencies
 */
var colors = require('colors'),
    dateformat = require('dateformat');

/**
 * Logger module constructor
 * @param {Object} options
 * @constructor
 */
function Logger(options) {
    this.moduleName = 'kickup.util.Logger';

    this._options = {
        prefix: 'kickup',
        datefmt: 'HH:MM:ss'
    };
    for(var key in options) this._options[key] = options[key];
}

/**
 * All available log levels
 * @type {Object}
 */
var LOGLEVEL = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * Clones the logger object with a new prefix
 * @param {String} prefix
 */
Logger.prototype.clone = function(prefix) {
    var logger = new Logger(this._options);
    logger._setPrefix(prefix);
    return logger;
};

/**
 * Changes the prefix of the logger (clone should be used instead)
 * @param {String} prefix
 * @private
 */
Logger.prototype._setPrefix = function(prefix) {
    this._options.prefix = prefix;
};

/**
 * Logs a message
 * @param {Number} level Log level
 * @param {Array} args Arguments
 */
Logger.prototype.log = function(level, args) {
    args = Array.prototype.slice.call(args);

    // Generate log message
    var msg = '';
    msg += '[' + dateformat(this._options.datefmt) + '] ';
    msg += this._options.prefix + '> ';

    // Output
    switch(level) {
        case LOGLEVEL.DEBUG: msg = msg.grey; break;
        case LOGLEVEL.INFO: msg = msg.green; break;
        case LOGLEVEL.WARN: msg = msg.yellow; break;
        case LOGLEVEL.ERROR: msg = msg.red; break;
        default: msg = msg.grey; break;
    }
    console.log(msg + args.join(' '));
};

/**
 * Convenience wrappers
 */
Logger.prototype.debug = function() { this.log(LOGLEVEL.DEBUG, arguments); };
Logger.prototype.info = function() { this.log(LOGLEVEL.INFO, arguments); };
Logger.prototype.warn = function() { this.log(LOGLEVEL.WARN, arguments); };
Logger.prototype.error = function() { this.log(LOGLEVEL.ERROR, arguments); };

/**
 * Exports the util.Logger module
 * @type {Logger}
 */
module.exports = Logger;