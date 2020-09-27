
import { Platform } from '../platform';
import { DeviceConfiguration } from '../configuration/device-configuration';
import { AppleTvClient } from '../clients/apple-tv-client';
import { Homebridge } from 'homebridge-framework';

/**
 * Represents a controller for an Apple TV. Controllers represent physical Apple TVs in HomeKit.
 */
export class AppleTvController {

    /**
     * Initializes a new AppleTvController instance.
     * @param platform The plugin platform.
     * @param deviceConfiguration The configuration of the Apple TV that is represented by this controller.
     * @param client The client that is used to communicate with the Apple TV.
     */
    constructor(platform: Platform, deviceConfiguration: DeviceConfiguration, client: AppleTvClient) {
        platform.logger.info(`[${deviceConfiguration.name}] Initializing...`);

        // Configures the client for event emitting
        client.areEventsEnabled = true;

        // Creates the accessory
        const accessory = platform.useAccessory(deviceConfiguration.name, client.id);
        accessory.setInformation({
            manufacturer: 'Apple',
            model: 'Apple TV',
            serialNumber: client.id,
            firmwareRevision: null,
            hardwareRevision: null
        });

        // Creates the On/Off switch if requested
        if (deviceConfiguration.isOnOffSwitchEnabled) {
            platform.logger.info(`[${deviceConfiguration.name}] Adding on/off switch`);
            const onOffSwitchService = accessory.useService(Homebridge.Services.Switch, deviceConfiguration.onOffSwitchName || 'Power', 'on-off-switch');

            // Adds the characteristics for the service
            const onCharacteristic = onOffSwitchService.useCharacteristic<boolean>(Homebridge.Characteristics.On);
            onCharacteristic.valueChanged = newValue => {
                if (onCharacteristic.value !== newValue) {
                    platform.logger.info(`[${deviceConfiguration.name}] On/off switch changed to ${newValue}`);
                    try {
                        if (newValue) {
                            client.switchOn();
                        } else {
                            client.switchOff();
                        }
                    } catch (e) {
                        platform.logger.warn(`[${deviceConfiguration.name}] failed to change On/off to ${newValue}`);
                    }
                }
            };

            // Subscribes for events of the client
            client.on('isOnChanged', _ => {
                platform.logger.debug(`[${deviceConfiguration.name}] On/off switch updated to ${client.isOn}`);
                onCharacteristic.value = client.isOn;
            });
        }

        // Creates the Play/Pause switch if requested
        if (deviceConfiguration.isPlayPauseSwitchEnabled) {
            platform.logger.info(`[${deviceConfiguration.name}] Adding play/pause switch`);
            deviceConfiguration.appPlayPauseSwitches.forEach(PlayPauseSwitch => {
                const playPauseSwitchService = accessory.useService(Homebridge.Services.Switch, PlayPauseSwitch.name || 'Play', `${PlayPauseSwitch.name}-Status`);

                // Adds the characteristics for the service
                const onCharacteristic = playPauseSwitchService.useCharacteristic<boolean>(Homebridge.Characteristics.On);
                onCharacteristic.valueChanged = newValue => {
                    if (onCharacteristic.value !== newValue) {
                        platform.logger.info(`[${deviceConfiguration.name}] Play/pause switch changed to ${newValue}`);
                        try {
                            if (newValue) {
                                client.play();
                            } else {
                                client.pause();
                            }
                        } catch (e) {
                            platform.logger.warn(`[${deviceConfiguration.name}] Failed to change play/pause to ${newValue}`);
                        }
                    }
                };

                // Subscribes for events of the client
                client.on('isPlayingChanged', _ => {
                    platform.logger.debug(`[${deviceConfiguration.name}] Play/pause switch updated to ${client.isPlaying}`);
                    if(PlayPauseSwitch.bundleIdentifier == client.currentApp || PlayPauseSwitch.bundleIdentifier == "*")
                    {
                        onCharacteristic.value = client.isPlaying;
                    }
                    else
                    {
                        onCharacteristic.value = false;
                    }
                    
                });
            });
        }

        // Creates the command switches if requested
        if (deviceConfiguration.commandSwitches && deviceConfiguration.commandSwitches.length > 0) {
            for (let commandSwitchConfiguration of deviceConfiguration.commandSwitches) {
                if (commandSwitchConfiguration.name) {
                    platform.logger.info(`[${deviceConfiguration.name}] Adding command switch ${commandSwitchConfiguration.name}`);
                    const commandSwitchService = accessory.useService(Homebridge.Services.Switch, commandSwitchConfiguration.name, `${commandSwitchConfiguration.name}-switch`);

                    // Adds the characteristics for the service
                    const onCharacteristic = commandSwitchService.useCharacteristic<boolean>(Homebridge.Characteristics.On);
                    onCharacteristic.valueChanged = newValue => {
                        if (newValue) {
                            platform.logger.info(`[${deviceConfiguration.name}] Command switch ${commandSwitchConfiguration.name} changed to ${newValue}`);

                            // Defines the function for executing the commands
                            const executeCommands = async () => {
                                try {
                                    if (commandSwitchConfiguration.commands && commandSwitchConfiguration.commands.length > 0) {
                                        for (let command of commandSwitchConfiguration.commands) {
                                            if (command.wait) {
                                                await new Promise(resolve => setTimeout(resolve, command.wait || 0));
                                            }
                                            if (command.key) {
                                                if (command.longPress) {
                                                    await client.longPressKeyAsync(command.key);
                                                } else {
                                                    await client.pressKeyAsync(command.key);
                                                }
                                            }
                                        }
                                    }
                                } catch (e) {
                                    platform.logger.warn(`[${deviceConfiguration.name}] Failed to execute command for ${commandSwitchConfiguration.name}`);
                                }
                            };

                            // Starts the execution of the commands
                            executeCommands();

                            // Sets a timeout that resets the "stateless" switch
                            setTimeout(() => onCharacteristic.value = false, 1000);
                        }
                    };
                }
            }
        }

        // Creates the TV accessory if requested
        if (deviceConfiguration.isOnOffTvEnabled) {

            // Creates the new accessory
            platform.logger.info(`[${deviceConfiguration.name}] Adding on/off TV`);
            const onOffTvAccessory = platform.useExternalAccessory(deviceConfiguration.name, client.id, 'OnOffTvAccessory', Homebridge.Categories.APPLE_TV);
            onOffTvAccessory.setInformation({
                manufacturer: 'Apple',
                model: 'Apple TV',
                serialNumber: client.id,
                firmwareRevision: null,
                hardwareRevision: null
            });

            // Creates the main service
            const onOffTvService = onOffTvAccessory.useService(Homebridge.Services.Television, deviceConfiguration.onOffTvName || 'Power');

            // Sets the name
            onOffTvService.useCharacteristic<string>(Homebridge.Characteristics.ConfiguredName, deviceConfiguration.onOffTvName || 'Power');

            // Adds the characteristics for the service
            const activeCharacteristic = onOffTvService.useCharacteristic<number>(Homebridge.Characteristics.Active);
            activeCharacteristic.valueChanged = newValue => {
                if (activeCharacteristic.value !== newValue) {
                    platform.logger.info(`[${deviceConfiguration.name}] On/off TV changed to ${newValue}`);
                    try {
                        if (newValue === Homebridge.Characteristics.Active.ACTIVE) {
                            client.switchOn();
                        } else {
                            client.switchOff();
                        }
                    } catch (e) {
                        platform.logger.warn(`[${deviceConfiguration.name}] failed to change on/off TV to ${newValue}`);
                    }
                }
            };

            // Subscribes for events of the client
            client.on('isOnChanged', _ => {
                platform.logger.debug(`[${deviceConfiguration.name}] On/off TV updated to ${client.isOn}`);
                activeCharacteristic.value = client.isOn ? Homebridge.Characteristics.Active.ACTIVE : Homebridge.Characteristics.Active.INACTIVE;
            });
        }
    }
}
