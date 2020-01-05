
const appletv = require('node-appletv');

const AppleTvDevice = require('./apple-tv-device');
const AppleTvApi = require('./apple-tv-api');

/**
 * Initializes a new platform instance for the AppleTV plugin.
 * @param log The logging function.
 * @param config The configuration that is passed to the plugin (from the config.json file).
 * @param api The API instance of homebridge (may be null on older homebridge versions).
 */
function AppleTvPlatform(log, config, api) {
    const platform = this;

    // Saves objects for functions
    platform.Accessory = api.platformAccessory;
    platform.Categories = api.hap.Accessory.Categories;
    platform.Service = api.hap.Service;
    platform.Characteristic = api.hap.Characteristic;
    platform.UUIDGen = api.hap.uuid;
    platform.hap = api.hap;
    platform.pluginName = 'homebridge-appletv';
    platform.platformName = 'AppleTvPlatform';

    // Checks whether a configuration is provided, otherwise the plugin should not be initialized
    if (!config) {
        return;
    }

    // Defines the variables that are used throughout the platform
    platform.log = log;
    platform.config = config;
    platform.devices = [];
    platform.accessories = [];

    // Initializes the configuration
    platform.config.devices = platform.config.devices || [];
    platform.config.isApiEnabled = platform.config.isApiEnabled || false;
    platform.config.apiPort = platform.config.apiPort || 40304;
    platform.config.apiToken = platform.config.apiToken || null;

    // Checks whether the API object is available
    if (!api) {
        platform.log('Homebridge API not available, please update your homebridge version!');
        return;
    }

    // Saves the API object to register new devices later on
    platform.log('Homebridge API available.');
    platform.api = api;

    // Subscribes to the event that is raised when homebridge finished loading cached accessories
    platform.api.on('didFinishLaunching', function () {
        platform.log('Cached accessories loaded.');

        // Initializes a device for each device from the configuration
        const promises = [];
        for (let i = 0; i < platform.config.devices.length; i++) {
            const deviceConfig = platform.config.devices[i];
            
            // Parses the credentials from the string
            const credentials = appletv.parseCredentials(deviceConfig.credentials);

            // Searches for the device
            platform.log('Searching for AppleTV with unique ID ' + credentials.uniqueIdentifier + ' (' + deviceConfig.name + ')');
            promises.push(appletv.scan(credentials.uniqueIdentifier).then(function (appleTvs) {
                platform.log('AppleTV with unique ID ' + credentials.uniqueIdentifier + ' (' + deviceConfig.name + ') found. Connecting...');

                // Opens the connection to the device
                return appleTvs[0].openConnection(credentials).then(function (appleTv) {
                    platform.log('Connected to AppleTV with unique ID ' + credentials.uniqueIdentifier + ' (' + deviceConfig.name + ')');

                    // Adds the device to the list of Apple TVs
                    platform.devices.push(new AppleTvDevice(platform, deviceConfig, credentials, appleTv));
                }, function() {
                    platform.log('Connection with AppleTV with unique ID ' + credentials.uniqueIdentifier + ' (' + deviceConfig.name + ') could not be established');
                });
            }, function() {
                platform.log('AppleTV with unique ID ' + credentials.uniqueIdentifier + ' (' + deviceConfig.name + ') not found.');
            }));
        }

        // Removes the accessories that are not bound to a device
        Promise.all(promises).then(function () {
            let unusedAccessories = platform.accessories.filter(function(a) { return !platform.devices.some(function(d) { return d.uniqueIdentifier === a.context.uniqueIdentifier; }); });
            for (let i = 0; i < unusedAccessories.length; i++) {
                const unusedAccessory = unusedAccessories[i];
                platform.log('Removing accessory with unique ID ' + unusedAccessory.context.uniqueIdentifier + ' and kind ' + unusedAccessory.context.kind + '.');
                platform.accessories.splice(platform.accessories.indexOf(unusedAccessory), 1);
            }
            platform.api.unregisterPlatformAccessories(platform.pluginName, platform.platformName, unusedAccessories);
    
            // Starts the API if requested
            if (platform.config.isApiEnabled) {
                platform.appleTvApi = new AppleTvApi(platform);
            }
        });
    });
}

/**
 * Configures a previously cached accessory.
 * @param accessory The cached accessory.
 */
AppleTvPlatform.prototype.configureAccessory = function (accessory) {
    const platform = this;

    // Adds the cached accessory to the list
    platform.accessories.push(accessory);
}

/**
 * Gets the usage from the key name.
 * @param key The string representation.
 * @returns Returns the usage information.
 */
AppleTvPlatform.prototype.getUsage = function (key) {
    switch (key) {
        case 'up':
          return { usePage: 1, usage: 0x8C };
        case 'down':
          return { usePage: 1, usage: 0x8D };
        case 'left':
          return { usePage: 1, usage: 0x8B };
        case 'right':
          return { usePage: 1, usage: 0x8A };
        case 'menu':
          return { usePage: 1, usage: 0x86 };
        case 'topmenu':
            return { usePage: 12, usage: 0x60 };
        case 'home':
            return { usePage: 12, usage: 0x40 };
        case 'play':
          return { usePage: 12, usage: 0xB0 };
        case 'pause':
          return { usePage: 12, usage: 0xB1 };
        case 'stop':
            return { usePage: 12, usage: 0xB7 };
        case 'next':
          return { usePage: 12, usage: 0xB5 };
        case 'previous':
          return { usePage: 12, usage: 0xB6 };
        case 'suspend':
          return { usePage: 1, usage: 0x82 };
        case 'wake':
            return { usePage: 1, usage: 0x83 };
        case 'volumeup':
            return { usePage: 12, usage: 0xE9 };
        case 'volumedown':
            return { usePage: 12, usage: 0xEA };
        case 'select':
          return { usePage: 1, usage: 0x89 };
      }
}

/**
 * Defines the export of the file.
 */
module.exports = AppleTvPlatform;
