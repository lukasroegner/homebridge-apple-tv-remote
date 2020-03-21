
/**
 * Represents an Apple TV device in the homebridge configuration for the plugin.
 */
export interface DeviceConfiguration {

    /**
     * Gets or sets a unique name for the device that will also be used in the API.
     */
    name: string;

    /**
     * Gets or sets the credentials that have been created with the appletv pair command.
     */
    credentials: string;

    /**
     * Gets or sets a value that determines whether an On/Off switch is exposed to HomeKit.
     */
    isOnOffSwitchEnabled: boolean;

    /**
     * Gets or sets a value that determines whether a Play/Pause switch is exposed to HomeKit.
     */
    isPlayPauseSwitchEnabled: boolean;
}
