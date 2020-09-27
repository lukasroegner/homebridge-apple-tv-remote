/**
 * Represents an app specific Play/Pause switch in the homebridge configuration for the plugin.
 */
export interface AppPlayPauseSwitchConfiguration {
    /**
     * Gets or sets a unique name for the switch.
     */
    name: string;

    /**
     * Gets or sets the bundle identifier of the app that this switch represents, e.g. 'com.netflix.Netflix' or 'com.google.ios.youtube'.
     */
    bundleIdentifier: string;
}
