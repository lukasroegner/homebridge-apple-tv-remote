
import { Command } from '../api/models/command';

/**
 * Represents a command switch in the homebridge configuration for the plugin.
 */
export interface CommandSwitchConfiguration {

    /**
     * Gets or sets a unique name for the switch.
     */
    name: string;

    /**
     * Gets or sets the commands that should be executed when the switch is activated.
     */
    commands: Array<Command>;
}
