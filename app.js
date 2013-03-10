/**
 * Module dependencies
 */
var kickup = require('./lib');

// Create a new KickUp application
var App = kickup.create(function() {
    this.use('kickup.util.Logger');
    this.use('kickup.util.Validation');
    this.use('kickup.session.Memory');

    this.use('kickup.server.Restify');
    this.use('kickup.server.RestifyHandler');
});
global.App = App;

// Load application modules
App.use('app.Routes');

// Initialize logging
App.log = new App._.util.Logger({ prefix: 'keewebio' });
App.log.info('Starting up keeweb.io...');

// Initialize sessions
App.log.debug('Initializing sessions');
App.session = new App._.session.Memory();

// Create a new REST server instance
App.log.debug('Creating REST server instance');
App.rest = new App._.server.Restify({
    name: 'keeweb',
    ssl: false,
    plugins: [
        'acceptParser',
        'authorizationParser',
        'bodyParser'
    ]
});

// REST authentication methods
App.rest.authentication.check = function(sid) {
    return App.session.checkSID(sid);
};
App.rest.authentication.get = function(sid) {
    return App.session.getBySID(sid);
};

// Implement routes
App.log.debug('Implementing REST routes');
App.$.Routes.setLogger(App.log.clone('keewebio.Routes'));
App.$.Routes.implement();

// Start listening
App.rest.listen(3000, function() {
    App.log.info('keeweb.io REST listening on port 3000');
});