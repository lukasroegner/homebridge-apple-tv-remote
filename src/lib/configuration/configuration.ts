
import { DeviceConfiguration } from './device-configuration';

/**
 * Represents the homebridge configuration for the plugin.
 */
export interface Configuration {

    /**
     * Gets or sets the devices that should be exposed to HomeKit/via API.
     */
    devices: Array<DeviceConfiguration>;

    /**
     * Gets or sets a value that determines whether the plugin should expose an HTTP API.
     */
    isApiEnabled: boolean;
    
    /**
     * Gets or sets the port at which the API should be available.
     */
    apiPort: number;
    
    /**
     * Gets or sets the secret token that is used to authenticate against the API.
     */
    apiToken: string;
    
    /**
     * Gets or sets the timeout for scanning for Apple TVs in seconds.
     */
    scanTimeout: number;

    /**
     * Gets or sets the maximum number of retry attempts before failing.
     */
    maximumConnectRetry: number;
    
    /**
     * Gets or sets the interval between retries in seconds.
     */
    connectRetryInterval: number;
    
    /**
     * Gets or sets the interval at which heartbeats are sent to the Apple TV in seconds.
     */
	heartbeatInterval: number;
}
