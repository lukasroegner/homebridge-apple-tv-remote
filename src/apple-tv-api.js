
const http = require('http');
const url = require('url');

/**
 * Represents the API.
 * @param platform The AppleTvPlatform instance.
 */
function AppleTvApi(platform) {
    const api = this;

    // Sets the platform
    api.platform = platform;

    // Checks if all required information is provided
    if (!api.platform.config.apiPort) {
        api.platform.log('No API port provided.');
        return;
    }
    if (!api.platform.config.apiToken) {
        api.platform.log('No API token provided.');
        return;
    }

    // Starts the server
    try {
        http.createServer(function (request, response) {
            const payload = [];

            // Subscribes for events of the request
            request.on('error', function () {
                api.platform.log('API - Error received.');
            }).on('data', function (chunk) {
                payload.push(chunk);
            }).on('end', function () {

                // Subscribes to errors when sending the response
                response.on('error', function () {
                    api.platform.log('API - Error sending the response.');
                });

                // Validates the token
                if (!request.headers['authorization']) {
                    api.platform.log('Authorization header missing.');
                    response.statusCode = 401;
                    response.end();
                    return;
                }
                if (request.headers['authorization'] !== api.platform.config.apiToken) {
                    api.platform.log('Token invalid.');
                    response.statusCode = 401;
                    response.end();
                    return;
                }

                // Validates the Apple TV name
                const appleTvName = api.getAppleTvName(request.url);
                if (!appleTvName) {
                    api.platform.log('No Apple TV name found.');
                    response.statusCode = 404;
                    response.end();
                    return;
                }

                // Gets the corresponding Apple TV
                const appleTv = api.platform.devices.find(function(d) { return d.name === appleTvName; });
                if (!appleTv) {
                    api.platform.log('No Apple TV found.');
                    response.statusCode = 404;
                    response.end();
                    return;
                }
            
                // Validates the body
                let body = null;
                if (payload && payload.length > 0) {
                    body = Buffer.concat(payload).toString();
                    if (body) {
                        body = JSON.parse(body);
                    }
                }
                
                // Performs the action based on the Apple TV and method
                switch (request.method) {
                    case 'POST':
                        api.handlePost(appleTv, body, response);
                        return;
                }

                api.platform.log('No action matched.');
                response.statusCode = 404;
                response.end();
            });
        }).listen(api.platform.config.apiPort, "0.0.0.0");
        api.platform.log('API started.');
    } catch (e) {
        api.platform.log('API could not be started: ' + JSON.stringify(e));
    }
}

/**
 * Handles requests to POST /{appleTvName}.
 * @param appleTv The Apple TV.
 * @param body The body of the request.
 * @param response The response object.
 */
AppleTvApi.prototype.handlePost = function (appleTv, body, response) {
    const api = this;

    // Writes the response
    if (body && body.commands && body.commands.length > 0) {
        const commands = body.commands;

        // Defines the handler function for a single command
        const commandHandler = function() {

            // Checks if commands are to be processed
            if (commands.length === 0) {
                response.statusCode = 200;
                response.end();
                return;
            }

            // Retrieves the first command
            const removedCommands = commands.splice(0, 1);
            const command = removedCommands[0];

            // Executes the command
            if (command.wait) {
                setTimeout(function() { commandHandler(); }, command.wait);
            } else {

                // Gets the usage
                const usage = api.platform.getUsage(command.key);
                if (!command.longPress) {
                    appleTv.appleTv.sendKeyPressAndRelease(usage.usePage, usage.usage).then(function() { commandHandler(); }, function() {
                        api.platform.log('Error while executing commands.');
                        response.statusCode = 400;
                        response.end();
                    });
                } else {
                    appleTv.appleTv.sendKeyPress(usage.usePage, usage.usage, true).then(function() { 
                        setTimeout(function() {
                            appleTv.appleTv.sendKeyPress(usage.usePage, usage.usage, false).then(function() { commandHandler(); }, function() {
                                api.platform.log('Error while executing commands.');
                                response.statusCode = 400;
                                response.end();
                            });
                        }, 1000);
                     }, function() {
                        api.platform.log('Error while executing commands.');
                        response.statusCode = 400;
                        response.end();
                    });
                }
            }
        };

        // Initially executes the handler
        commandHandler();
    } else {
        api.platform.log('Error while executing commands.');
        response.statusCode = 400;
        response.end();
    }
}

/**
 * Gets the Apple TV name from the URL.
 * @param uri The uri of the request.
 * @returns Returns the Apple TV name.
 */
AppleTvApi.prototype.getAppleTvName = function (uri) {

    // Parses the request path
    const uriParts = url.parse(uri);

    // Checks if the URL matches the Apple TV name
    uriMatch = /\/(.+)/g.exec(uriParts.pathname);
    if (uriMatch && uriMatch.length === 2) {
        return decodeURI(uriMatch[1]);
    }

    // Returns null as no Apple TV name found
    return null;
}

/**
 * Defines the export of the file.
 */
module.exports = AppleTvApi;
