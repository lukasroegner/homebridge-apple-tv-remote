
const appletv = require('node-appletv-x');

/**
 * Represents a physical Apple TV device.
 * @param platform The AppleTvPlatform instance.
 * @param config The device configuration.
 * @param credentials The credentials of the device.
 */
function AppleTvDevice(platform, config, credentials) {
    const device = this;
    const { UUIDGen, Accessory, Characteristic, Service } = platform;

    // Sets the unique identifier, name and platform
    device.name = config.name;
    device.uniqueIdentifier = credentials.uniqueIdentifier;
    device.credentials = credentials;
    device.platform = platform;
    device.appleTvApi = null;

    // Gets all accessories from the platform that match the ID
    let unusedDeviceAccessories = platform.accessories.filter(function(a) { return a.context.uniqueIdentifier === device.uniqueIdentifier; });
    let newDeviceAccessories = [];
    let deviceAccessories = [];

    // Gets the switch accessory
    let switchAccessory = null;
    if (config.isOnOffSwitchEnabled || config.isPlayPauseSwitchEnabled) {
        switchAccessory = unusedDeviceAccessories.find(function(a) { return a.context.kind === 'SwitchAccessory'; });
        if (switchAccessory) {
            unusedDeviceAccessories.splice(unusedDeviceAccessories.indexOf(switchAccessory), 1);
        } else {
            platform.log('Adding new accessory with unique ID ' + device.uniqueIdentifier + ' and kind SwitchAccessory.');
            switchAccessory = new Accessory(config.name, UUIDGen.generate(device.uniqueIdentifier + 'SwitchAccessory'));
            switchAccessory.context.uniqueIdentifier = device.uniqueIdentifier;
            switchAccessory.context.kind = 'SwitchAccessory';
            newDeviceAccessories.push(switchAccessory);
        }
        deviceAccessories.push(switchAccessory);

        // Registers the newly created accessories
        platform.api.registerPlatformAccessories(platform.pluginName, platform.platformName, newDeviceAccessories);
    }

    // Removes all unused accessories
    for (let i = 0; i < unusedDeviceAccessories.length; i++) {
        const unusedDeviceAccessory = unusedDeviceAccessories[i];
        platform.log('Removing unused accessory with unique ID ' + device.uniqueIdentifier + ' and kind ' + unusedDeviceAccessory.context.kind + '.');
        platform.accessories.splice(platform.accessories.indexOf(unusedDeviceAccessory), 1);
    }
    platform.api.unregisterPlatformAccessories(platform.pluginName, platform.platformName, unusedDeviceAccessories);

    // Updates the accessory information
    if (config.isOnOffSwitchEnabled || config.isPlayPauseSwitchEnabled) {
        for (let i = 0; i < deviceAccessories.length; i++) {
            const deviceAccessory = deviceAccessories[i];
            let accessoryInformationService = deviceAccessory.getService(Service.AccessoryInformation);
            if (!accessoryInformationService) {
                accessoryInformationService = deviceAccessory.addService(Service.AccessoryInformation);
            }
            accessoryInformationService
                .setCharacteristic(Characteristic.Manufacturer, 'Apple')
                .setCharacteristic(Characteristic.Model, 'Apple TV')
                .setCharacteristic(Characteristic.SerialNumber, device.uniqueIdentifier);
        }

        // Updates the on/off switch service
        device.onOffSwitchService = switchAccessory.getServiceByUUIDAndSubType(Service.Switch, 'Power');
        if (config.isOnOffSwitchEnabled) {
            if (!device.onOffSwitchService) {
                device.onOffSwitchService = switchAccessory.addService(Service.Switch, 'Power', 'Power');
            }
        } else {
            if (device.onOffSwitchService) {
                switchAccessory.removeService(device.onOffSwitchService);
                device.onOffSwitchService = null;
            }
        }

        // Updates the play/pause switch service
        device.playPauseSwitchService = switchAccessory.getServiceByUUIDAndSubType(Service.Switch, 'Play');
        if (config.isPlayPauseSwitchEnabled) {
            if (!device.playPauseSwitchService) {
                device.playPauseSwitchService = switchAccessory.addService(Service.Switch, 'Play', 'Play');
            }
        } else {
            if (device.playPauseSwitchService) {
                switchAccessory.removeService(device.playPauseSwitchService);
                device.playPauseSwitchService = null;
            }
        }

        // Subscribes for changes of the on/off switch
        if (device.onOffSwitchService) {
            device.onOffSwitchService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {
                platform.log(device.uniqueIdentifier + ' - Switch Power to ' + (value ? 'ON' : 'OFF'));

                // Sends the command to the Apple TV
                if (value) {
                    if (!device.onOffSwitchService.getCharacteristic(Characteristic.On).value) {
                        device.pressKey('topmenu').then(function() {
                            platform.log(device.uniqueIdentifier + ' - Switched ON');
                        }, function() {
                            platform.log(device.uniqueIdentifier + ' - Switch ON failed');
                        });
                    }
                } else {
                    if (device.onOffSwitchService.getCharacteristic(Characteristic.On).value) {
                        device.longPressKey('topmenu').then(function() {
                            device.pressKey('select').then(function() {
                                platform.log(device.uniqueIdentifier + ' - Switched OFF');
                            }, function() {
                                platform.log(device.uniqueIdentifier + ' - Switch OFF failed');
                            });
                        }, function() {
                            platform.log(device.uniqueIdentifier + ' - Switch OFF failed');
                        });
                    }
                }

                // Performs the callback
                callback(null);
            });
        }

        // Subscribes for changes of the play/pause switch
        if (device.playPauseSwitchService) {
            device.playPauseSwitchService.getCharacteristic(Characteristic.On).on('set', function (value, callback) {
                platform.log(device.uniqueIdentifier + ' - Switch Play State to ' + (value ? 'Play' : 'Pause'));

                // Sends the command to the Apple TV
                if (value) {
                    device.pressKey('play').then(function() {
                        platform.log(device.uniqueIdentifier + ' - Switched Play State to ON');
                    }, function() {
                        platform.log(device.uniqueIdentifier + ' - Switch Play State to ON failed');
                    });
                } else {
                    device.pressKey('pause').then(function() {
                        platform.log(device.uniqueIdentifier + ' - Switched Play State to OFF');
                    }, function() {
                        platform.log(device.uniqueIdentifier + ' - Switch Play State to OFF failed');
                    });
                }

                // Performs the callback
                callback(null);
            });
        }
    }

    // Connects to the Apple TV
    device.connect();
}

/**
 * Is called to connect to the Apple TV.
 */
AppleTvDevice.prototype.connect = function() {
    const device = this;
    const { Characteristic } = device.platform;

    // Checks if homebridge is shutting down
    if (device.platform.isShuttingDown) {
        return;
    }

    // Tries to scan for the Apple TV
    device.platform.log(device.uniqueIdentifier + ' - Scanning for Apple TV...');
    appletv.scan(device.uniqueIdentifier, device.platform.config.scanTimeout).then(function (appleTvApis) {

        // Initializes the Apple TV API object
        const appleTvApi = appleTvApis[0];
        device.platform.log(device.uniqueIdentifier + ' - Apple TV found, IP address: ' + appleTvApi.address);

        // Tries to open the connection to the Apple TV
        device.platform.log(device.uniqueIdentifier + ' - Connecting to Apple TV...');
        appleTvApi.openConnection(device.credentials).then(function () {
            device.platform.log(device.uniqueIdentifier + ' - Connected to Apple TV.');

            // Stores the Apple TV API object
            device.appleTvApi = appleTvApi;

            // Subscribes to messages
            device.appleTvApi.on('message', function(message) {
    
                // Updates the play state
                if (message.payload && typeof message.payload.playbackState !== 'undefined') {
                    if (device.playPauseSwitchService) {
                        device.platform.log(device.uniqueIdentifier + ' - Update Play State to ' + message.payload.playbackState);
                        device.playPauseSwitchService.updateCharacteristic(Characteristic.On, message.payload.playbackState === 1);
                    }
                }
    
                // Updates the on/off state
                if (message.payload && typeof message.payload.logicalDeviceCount !== 'undefined') {
                    device.platform.log(device.uniqueIdentifier + ' - Update Standby State to ' + message.payload.logicalDeviceCount);
                    if (device.onOffSwitchService) {
                        device.onOffSwitchService.updateCharacteristic(Characteristic.On, message.payload.logicalDeviceCount > 0);
                    }
                    if (device.playPauseSwitchService && message.payload.logicalDeviceCount == 0) {
                        device.playPauseSwitchService.updateCharacteristic(Characteristic.On, false);
                    }
                }
            });
    
            // Subscribes to connection issues
            device.appleTvApi.on('close', function() {
                device.connect();
            });

            // Initially gets the device information
            device.appleTvApi.sendIntroduction();
        }, function () {

            // Tries to connect again
            device.platform.log(device.uniqueIdentifier + ' - Connection failed. Trying again soon.');
            setTimeout(function() {
                device.connect();
            }, device.platform.config.connectRetryInterval * 1000);
        });
    }, function() {

        // Tries to scan again
        device.platform.log(device.uniqueIdentifier + ' - Apple TV not found. Trying again soon.');
        setTimeout(function() {
            device.connect();
        }, device.platform.config.connectRetryInterval * 1000);
    });
}

/**
 * Is called to disconnect from an Apple TV.
 */
AppleTvDevice.prototype.disconnect = function() {
    const device = this;

    // Closes the existing connection
    device.platform.log(device.uniqueIdentifier + ' - Disconnect');
    if (device.appleTvApi) {
        device.appleTvApi.closeConnection();
        device.appleTvApi = null;
    }
}

/**
 * Sends a key press to the Apple TV.
 * @param key The key to be pressed.
 */
AppleTvDevice.prototype.pressKey = function(key) {
    const device = this;

    // Checks if the Apple TV is connected
    if (!device.appleTvApi) {
        device.platform.log(device.uniqueIdentifier + ' - Could not send press key ' + key + ', Apple TV not connected');
        return new Promise(function(resolve, reject) { reject(); });
    }

    // Gets the usage and sends the actual key press
    device.platform.log(device.uniqueIdentifier + ' - Press key ' + key);
    const usage = device.getUsage(key);
    if (usage) {
        return device.appleTvApi.sendKeyPressAndRelease(usage.usePage, usage.usage);
    } else {
        return new Promise(function(resolve, reject) { reject(); });
    }
}

/**
 * Sends a long key press to the Apple TV.
 * @param key The key to be pressed.
 */
AppleTvDevice.prototype.longPressKey = function(key) {
    const device = this;

    // Checks if the Apple TV is connected
    if (!device.appleTvApi) {
        device.platform.log(device.uniqueIdentifier + ' - Could not send long press key ' + key + ', Apple TV not connected');
        return new Promise(function(resolve, reject) { reject(); });
    }
    
    // Gets the usage and sends the actual key press
    device.platform.log(device.uniqueIdentifier + ' - Press key ' + key);
    const usage = device.getUsage(key);
    if (usage) {
        return device.appleTvApi.sendKeyPress(usage.usePage, usage.usage, true).then(function() {
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    device.appleTvApi.sendKeyPress(usage.usePage, usage.usage, false).then(function() { resolve(); }, function() { reject(); });
                }, 1000);
            });
        });
    } else {
        return new Promise(function(resolve, reject) { reject(); });
    }
}

/**
* Gets the usage from the key name.
* @param key The string representation.
* @returns Returns the usage information.
*/
AppleTvDevice.prototype.getUsage = function (key) {
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
module.exports = AppleTvDevice;
