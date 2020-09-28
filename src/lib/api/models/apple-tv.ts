
import { Command } from './command';

/**
 * Represents the model of an Apple TV that is used by the API.
 */
export class AppleTv {

    /**
     * Gets or sets a value that determines whether the Apple TV is on.
     */
    public isOn?: boolean;

    /**
     * Gets or sets a value that determines whether the Apple TV is playing.
     */
    public isPlaying?: boolean;

    /**
     * Gets or sets a value that determines which app the Apple TV is playing.
     */
    public currentApp?: string;

    /**
     * Gets or sets a list of commands that should be executed.
     */
    public commands?: Array<Command>;
}
