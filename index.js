
const AppleTvPlatform = require('./src/apple-tv-platform');

/**
 * Defines the export of the plugin entry point.
 * @param homebridge The homebridge API that contains all classes, objects and functions for communicating with HomeKit.
 */
module.exports = function (homebridge) {
    homebridge.registerPlatform('homebridge-apple-tv-remote', 'AppleTvPlatform', AppleTvPlatform, true);
}
