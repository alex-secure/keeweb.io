/**
 * Entries route constructor
 * @constructor
 */
function Entries() {
    this.moduleName = 'app.rest.Entries';

    App.require('kickup.server.RestifyHandler');
    App.require('kickup.session.Memory');
}

/**
 * Implements the REST routes
 */
Entries.prototype.implement = function() {
    var _this = this;

    // GET /entries/:gid
    App.rest.get('/entries/:gid', new App._.server.RestifyHandler(function() {
        this.requireAuth(App.rest.authentication);

        this.stack.push(_this._getEntries.bind(_this));
    }));
};

/**
 * Returns all the entries of a group
 * @private
 */
Entries.prototype._getEntries = function(req, res, cb) {
    /**
     * Tries to find a group with the specified ID
     * @param {String} gid Group ID
     * @param {Object} groups Object which should be searched through
     */
    function findGroup(gid, groups) {
        for(var key in groups) {
            if(key == gid) return groups[key];
            if(groups[key].groups) {
                var result = findGroup(gid, groups[key].groups);
                if(result) return result;
            }
        }
    }

    /**
     * Parses an array of KeePass entries recursively
     * @param {Array} entries Array of entries (keepass.io format)
     * @returns {Array}
     */
    function parseEntries(entries) {
        var result = [];

        for(var key in entries) {
            var entry = entries[key];
            result.push({
                id: key,
                title: entry.title,
                url: entry.url,
                username: entry.username,
                password: entry.password,
                notes: entry.notes,
                icon: entry.iconID
            });
        }

        return result;
    }

    // Try to find the group
    var group = findGroup(req.params.gid, req.session.database.groups);
    if(!group) {
        return cb(new App._.restify.InvalidArgument('Group with specified ID not found.'));
    }

    // Parse all the entries recursively and return them
    var entries = parseEntries(group.entries);
    res.send({
        success: true,
        group: req.params.gid,
        data: entries
    });
    return cb();
};

/**
 * Exports the rest.Entries route
 * @type {Function}
 */
module.exports = Entries;