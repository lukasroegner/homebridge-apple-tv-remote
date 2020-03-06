
/**
 * Represents a command that is executed as virtual button input for the Apple TV.
 */
export class Command {

    /**
     * Gets or sets the number of milliseconds to wait when executing this command.
     */
    public wait?: number;

    /**
     * Gets or sets the key that should be virtually pressed.
     */
    public key?: string;

    /**
     * Gets or sets a value that determines whether the key should be pressed long.
     */
    public longPress?: boolean;

}