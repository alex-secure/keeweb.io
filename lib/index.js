/**
 * Module dependencies
 */
var path = require('path');

/**
 * KickUp constructor / namespace
 * @constructor
 */
function KickUp() {
    this._ = {};
    this.$ = {};
}
global.KickUp = KickUp;

/**
 * Load KickUp custom errors
 * @type {Object}
 */
KickUp.error = require('./Error');

/**
 * Creates a new application with KickUp.
 * @param {Function} constructor Initialization function
 * @returns {KickUp}
 */
KickUp.create = function(constructor) {
    var _instance = new KickUp();
    constructor.apply(_instance);
    return _instance;
};

/**
 * Gets the module scope of an already loaded module
 * @param {Object} scope Scope which should be checked
 * @param {Array} names Module name splitted by dots (without class name)
 * @returns {*} Module scope or false
 * @private
 */
KickUp.prototype._getModuleScope = function(scope, names) {
    var index = 0;
    while(index < names.length) {
        if(!scope.hasOwnProperty(names[index])) return false;
        scope = scope[names[index]];
        index++;
    }
    return scope;
};

/**
 * Initializes the module scope for a new module
* @param {Object} scope Scope
 * @param {Array} names Module name splitted by dots (without class name)
 * @returns {Object} Module scope
 * @private
 */
KickUp.prototype._createModuleScope = function(scope, names) {
    names.forEach(function(name) {
        if(!scope.hasOwnProperty(name)) scope[name] = {};
        scope = scope[name];
    });
    return scope;
};

/**
 * Loads a new module into the application
 * @param {String} name Name of the module (will be loaded if necessary)
 * @param {Object} options Contains the options for the module
 */
KickUp.prototype.use = function(name, options) {
    // Check if specified module name is in the correct namespace
    var names = name.split('.');
    if(names[0] !== 'kickup' && names[0] !== 'app') {
        throw new KickUp.error.Parameter('name', 'Module begins with an invalid namespace.');
    }
    var namespace = names[0];
    names = names.slice(1);

    // Load the module if it was not already loaded
    var className = names.pop();
    var scope = (namespace === 'kickup' ? this._ : this.$);
    var moduleScope = this._getModuleScope(scope, names);

    if(!moduleScope || !moduleScope[className]) {
        var scope = this._createModuleScope(scope, names);
        var filename = (namespace === 'kickup' ? path.join(__dirname) : path.join(__dirname, '..', 'app'));
        filename = path.join(filename, names.join('/'), className);

        moduleScope = this._getModuleScope(scope, names);
        scope[className] = require(filename);

        if(scope[className].IS_SINGLETON) {
            scope[className] = new scope[className]();
        }
    }
};

/**
 * Requires that a module is loaded in the current application
 * NOTICE: Only supports the kickup namespace
 * @param {String} name Module name
 */
KickUp.prototype.require = function(name) {
    // Check if specified module name is in the correct namespace
    var names = name.split('.');
    if(names[0] !== 'kickup' && names[0] !== 'app') {
        throw new KickUp.error.Parameter('name', 'Module begins with an invalid namespace.');
    }
    var namespace = names[0];
    names = names.slice(1);

    // Check if the module was already loaded
    var className = names.pop();
    var moduleScope = this._getModuleScope(this._, names);

    if(!moduleScope || !moduleScope[className]) {
        throw new KickUp.error.ModuleNotLoaded(name, 'Module is not loaded.');
    }
}

/**
 * Exports the KickUp library
 * @type {KickUp}
 */
module.exports = KickUp;