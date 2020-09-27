import { CommandSwitchConfiguration } from "./command-switch-configuration";
import { AppPlayPauseSwitchConfiguration } from "./app-play-pause-switch-configuration";

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
     * Gets or sets the initial name of the On/Off switch.
     */
    onOffSwitchName: string;

    /**
     * Gets or sets a value that determines whether an On/Off TV accessory is exposed to HomeKit.
     */
    isOnOffTvEnabled: boolean;

    /**
     * Gets or sets the name of the On/Off TV accessory.
     */
    onOffTvName: string;

    /**
     * Gets or sets a value that determines whether a Play/Pause switch is exposed to HomeKit.
     */
    isPlayPauseSwitchEnabled: boolean;

    /**
     * Gets or sets the initial name of the Play/Pause switch.
     */    
    playPauseSwitchName: string;

    /**
     * Gets or sets a list of Play/Pause switches that should be additionally exposed to HomeKit.
     */
    appPlayPauseSwitches: Array<AppPlayPauseSwitchConfiguration>;

    /**
     * Gets or sets a list of command switches that should be additionally exposed to HomeKit.
     */
    commandSwitches: Array<CommandSwitchConfiguration>;
}

