
const appletv = require('node-appletv-x');

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
	platform.isShuttingDown = false;

	// Initializes the configuration
	platform.config.devices = platform.config.devices || [];
	platform.config.isApiEnabled = platform.config.isApiEnabled || false;
	platform.config.apiPort = platform.config.apiPort || 40304;
	platform.config.apiToken = platform.config.apiToken || null;
	platform.config.scanTimeout = 10;
	platform.config.connectRetryInterval = 5;

	// Checks whether the API object is available
	if (!api) {
		platform.log('Homebridge API not available, please update your homebridge version!');
		return;
	}

	// Saves the API object to register new devices later on
	platform.log('Homebridge API available.');
	platform.api = api;

	// Subscribes to the shutdown event
	platform.api.on('shutdown', function() {
		platform.isShuttingDown = true;
		for (let i = 0; i < platform.devices.length; i++) {
			platform.devices[i].disconnect();
		}
	});

	// Subscribes to the event that is raised when homebridge finished loading cached accessories
	platform.api.on('didFinishLaunching', function () {
		platform.log('Cached accessories loaded.');

		// Cycles over all configured Apple TVs
		for (let i = 0; i < platform.config.devices.length; i++) {
			const deviceConfig = platform.config.devices[i];

			// Parses the credentials from the string
			const credentials = appletv.parseCredentials(deviceConfig.credentials);

			// Adds the device to the list of Apple TVs
			platform.log('Add Apple TV with unique ID ' + credentials.uniqueIdentifier + ' (' + deviceConfig.name + ').');
			platform.devices.push(new AppleTvDevice(platform, deviceConfig, credentials));
		}

		// Removes the accessories that are not bound to a device
		let unusedAccessories = platform.accessories.filter(function (a) { return !platform.devices.some(function (d) { return d.uniqueIdentifier === a.context.uniqueIdentifier; }); });
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
* Defines the export of the file.
*/
module.exports = AppleTvPlatform;
