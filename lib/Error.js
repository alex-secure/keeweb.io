/**
 * Module dependencies
 */
var util = require('util');

/**
 * AbstractError constructor
 * @param {String} msg Error message
 * @param {Function} constructor Constructor function
 * @constructor
 */
var AbstractError = function(msg, constructor) {
    Error.captureStackTrace(this, constructor || this);
    this.message = msg || 'Unknown error';
};
util.inherits(AbstractError, Error);
AbstractError.prototype.name = 'AbstractError';

/**
 * InternalError constructor
 * @param {String} msg Error description
 * @constructor
 */
var InternalError = function(msg) {
    InternalError.super_.call(this, msg);
};
util.inherits(InternalError, AbstractError);
InternalError.prototype.name = 'InternalError';

/**
 * ParameterError constructor
 * @param {String} param Name of the invalid parameter
 * @param {String} msg Additional description why the parameter is invalid
 * @constructor
 */
var ParameterError = function(param, msg) {
    ParameterError.super_.call(this, 'Error in Parameter \'' + param + '\': ' + msg);
};
util.inherits(ParameterError, AbstractError);
ParameterError.prototype.name = 'ParameterError';

/**
 * ModuleNotLoadedError constructor
 * @param {String} moduleName Name of the module
 * @constructor
 */
var ModuleNotLoadedError = function(moduleName) {
    ModuleNotLoadedError.super_.call(this, 'Module is required but was not loaded: ' + moduleName);
};
util.inherits(ModuleNotLoadedError, AbstractError);
ModuleNotLoadedError.prototype.name = 'ModuleNotLoadedError';

/**
 * Exports the custom errors
 * @type {Object}
 */
module.exports = {
    Internal: InternalError,
    Parameter: ParameterError,
    ModuleNotLoaded: ModuleNotLoadedError
};