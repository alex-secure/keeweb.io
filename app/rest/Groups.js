/**
 * Groups route constructor
 * @constructor
 */
function Groups() {
    this.moduleName = 'app.rest.Groups';

    App.require('kickup.server.RestifyHandler');
    App.require('kickup.session.Memory');
}

/**
 * Implements the REST routes
 */
Groups.prototype.implement = function() {
    var _this = this;

    // GET /groups
    App.rest.get('/groups', new App._.server.RestifyHandler(function() {
        this.requireAuth(App.rest.authentication);

        this.stack.push(_this._getGroups.bind(_this));
    }));
};

/**
 * Returns all the groups in the loaded database
 * @private
 */
Groups.prototype._getGroups = function(req, res, cb) {
    /**
     * Parses an array of KeePass groups recursively
     * @param {Array} groups Array of groups (keepass.io format)
     * @returns {Array}
     */
    function parseGroups(groups) {
        var result = [];

        for(var key in groups) {
            var group = groups[key];
            result.push({
                id: key,
                name: group.name,
                notes: group.notes,
                icon: group.iconID,
                expanded: group.isExpanded,
                selected: group.lastTopVisibleEntry,
                groups: parseGroups(group.groups)
            });
        }

        return result;
    }

    // Parse all the groups recursively and return them
    var groups = parseGroups(req.session.database.groups);
    res.send({
        success: true,
        data: groups
    });
    return cb();
};

/**
 * Exports the rest.Groups route
 * @type {Function}
 */
module.exports = Groups;