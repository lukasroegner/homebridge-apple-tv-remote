
import * as AppleTv from 'node-appletv-x';

import { HomebridgePlatform } from 'homebridge-framework';
import { Configuration } from './configuration/configuration';
import { AppleTvClient } from './clients/apple-tv-client';
import { AppleTvController } from './controllers/apple-tv-controller';
import { Api } from './api/api';

/**
 * Represents the platform of the plugin.
 */
export class Platform extends HomebridgePlatform<Configuration> {

    /**
     * Gets or sets the list of all clients that are used to communicate with the Apple TVs.
     */
    public clients = new Array<AppleTvClient>();

    /**
     * Gets or sets the list of all controllers that represent physical Apple TVs in HomeKit.
     */
    public controllers = new Array<AppleTvController>();

    /**
     * Gets the name of the plugin.
     */
    public get pluginName(): string {
        return 'homebridge-apple-tv-remote';
    }    
    
    /**
     * Gets the name of the platform which is used in the configuration file.
     */
    public get platformName(): string {
        return 'AppleTvPlatform';
    }

    /**
     * Is called when the platform is initialized.
     */
    public initialize() {
        this.logger.info(`Initialing platform...`);

        // Sets the API configuration
	    this.configuration.isApiEnabled = this.configuration.isApiEnabled || false;
        this.configuration.apiPort = this.configuration.apiPort || 40304;

        // Sets the timeouts and intervals
        this.configuration.scanTimeout = this.configuration.scanTimeout || 2;
        this.configuration.maximumConnectRetry = this.configuration.maximumConnectRetry || 10;
        this.configuration.connectRetryInterval = this.configuration.connectRetryInterval || 5;
        this.configuration.heartbeatInterval = this.configuration.heartbeatInterval || 60;
        this.configuration.isOnDampeningTimeout = this.configuration.isOnDampeningTimeout || 2;
        this.configuration.isPlayingDampeningTimeout = this.configuration.isPlayingDampeningTimeout || 1;

        // Cycles over all configured devices and creates the corresponding controllers and clients
        if (this.configuration.devices) {
            for (let deviceConfiguration of this.configuration.devices) {
                if (deviceConfiguration.name) {

                    // Checks whether the credentials are valid and can be parsed
                    try {
                        AppleTv.parseCredentials(deviceConfiguration.credentials);
                    } catch {
                        this.logger.warn(`[${deviceConfiguration.name}] Credentials are invalid. Make sure that you copied them correctly.`);
                        continue;
                    }

                    // Creates a new client for the device configuration
                    if (deviceConfiguration.isOnOffSwitchEnabled || deviceConfiguration.isOnOffTvEnabled || deviceConfiguration.isPlayPauseSwitchEnabled || this.configuration.isApiEnabled || (deviceConfiguration.commandSwitches && deviceConfiguration.commandSwitches.length > 0) || (deviceConfiguration.appPlayPauseSwitches && deviceConfiguration.appPlayPauseSwitches.length > 0)) {
                        const appleTvClient = new AppleTvClient(this, deviceConfiguration);
                        this.clients.push(appleTvClient);

                        // Creates an Apple TV controller for the device configuration
                        if (deviceConfiguration.isOnOffSwitchEnabled || deviceConfiguration.isOnOffTvEnabled || deviceConfiguration.isPlayPauseSwitchEnabled || (deviceConfiguration.commandSwitches && deviceConfiguration.commandSwitches.length > 0) || (deviceConfiguration.appPlayPauseSwitches && deviceConfiguration.appPlayPauseSwitches.length > 0)) {
                            const appleTvController = new AppleTvController(this, deviceConfiguration, appleTvClient);
                            this.controllers.push(appleTvController);
                        }
                    } else {
                        this.logger.warn(`[${deviceConfiguration.name}] Device not used.`);
                    }
                } else {
                    this.logger.warn(`Device name missing in the configuration.`);
                }
            }
        } else {
            this.logger.warn(`No devices configured.`);
        }

        // Enables the API
        if (this.configuration.isApiEnabled) {
            new Api(this);
        }
    }

    /**
     * Is called when homebridge is shut down.
     */
    public destroy() {
        this.logger.info(`Shutting down Apple TV clients...`);

        // Destroys all clients
        for (let client of this.clients) {
            client.destroy();
        }
    }
}
