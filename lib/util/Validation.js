/**
 * Validation module constructor
 * @constructor
 */
function Validation() {
    this.moduleName = 'kickup.util.Validation';
}
Validation.IS_SINGLETON = true;

/**
 * Checks if 'data' is a valid function which can be called
 * @param {*} data Variable which should be checked
 * @returns {Boolean}
 */
Validation.prototype.isFunction = function(data) {
    if(!data) return false;
    if(data.constructor !== Function) return false;
    return true;
};

/**
 * Checks if 'data' is a valid number
 * @param {*} data Variable which should be checked
 * @returns {Boolean}
 */
Validation.prototype.isNumber = function(data) {
    if(!data) return false;
    return !isNaN(data) && isFinite(data);
};

/**
 * Checks if the constructor of 'data' equals to the given constructor
 * @param {*} data Variable which should be checked
 * @param {Object} constructor
 * @return {Boolean}
 */
Validation.prototype.isClass = function(data, constructor) {
    return data && data.constructor === constructor;
};

/**
 * Exports the util.Validation module
 * @type {Function}
 */
module.exports = Validation;