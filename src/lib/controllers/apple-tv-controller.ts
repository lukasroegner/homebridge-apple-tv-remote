
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
        platform.logger.debug(`[${deviceConfiguration.name}] Initializing...`);

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
            platform.logger.debug(`[${deviceConfiguration.name}] Adding on/off switch`);
            const onOffSwitchService = accessory.useService(Homebridge.Services.Switch, 'Power', 'on-off-switch');

            // Adds the characteristics for the service
            const onCharacteristic = onOffSwitchService.useCharacteristic<boolean>(Homebridge.Characteristics.On);
            onCharacteristic.valueChanged = newValue => {
                platform.logger.info(`[${deviceConfiguration.name}] On/off switch changed to ${newValue}`);
                if (newValue) {
                    client.switchOnAsync();
                } else {
                    client.switchOffAsync();
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
            platform.logger.debug(`[${deviceConfiguration.name}] Adding play/pause switch`);
            const playPauseSwitchService = accessory.useService(Homebridge.Services.Switch, 'Play', 'play-pause-switch');

            // Adds the characteristics for the service
            const onCharacteristic = playPauseSwitchService.useCharacteristic<boolean>(Homebridge.Characteristics.On);
            onCharacteristic.valueChanged = newValue => {
                platform.logger.info(`[${deviceConfiguration.name}] Play/pause switch changed to ${newValue}`);
                if (newValue) {
                    client.playAsync();
                } else {
                    client.pauseAsync();
                }
            };

            // Subscribes for events of the client
            client.on('isPlayingChanged', _ => {
                platform.logger.debug(`[${deviceConfiguration.name}] Play/pause switch updated to ${client.isPlaying}`);
                onCharacteristic.value = client.isPlaying;
            });
        }
    }
}
