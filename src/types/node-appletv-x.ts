
declare module 'node-appletv-x' {
    
    import { EventEmitter } from 'events';

    /**
     * Represents an information struct for playing information.
     */
    export class NowPlayingInfo {

        /**
         * Gets the current playback state.
         */
        playbackState: NowPlayingInfo.State;
    }

    /**
     * Represents the module for enums.
     */
    export module NowPlayingInfo {

        /**
         * Represents the playing state.
         */
        enum State {
            Playing = 'playing',
            Paused = 'paused'
        }
    }

    /**
     * Represents a message that is sent to the Apple TV or received from it.
     */
    export class Message {
        
        /**
         * Gets or sets the payload of the message.
         */
        payload: any;
    }

    /**
     * Represents the options that can be used when requesting the current playback state.
     */
    export interface PlaybackQueueRequestOptions {

        /**
         * An unknown, request location value.
         */
        location: number;

        /**
         * Gets or sets the requested queue.
         */
        length: number;
    }
    
    /**
     * Represents an Apple TV that has been found via scan.
     */
    export class AppleTV extends EventEmitter {
        
        /**
         * Gets the name of the Apple TV.
         */
        name: string;

        public address: string;
        public port: number;
        public uid: string;
        
        /**
        * Opens a connection to the AppleTV over the MRP protocol.
        * @param credentials The credentials object for this AppleTV
        * @returns A promise that resolves to the AppleTV object.
        */
        openConnection(credentials?: Credentials): Promise<AppleTV>;

        /**
        * Closes the connection to the Apple TV.
        */
        closeConnection(): void;
        
        /**
        * Requests the current playback queue from the Apple TV.
        * @param options Options to send
        * @returns A Promise that resolves to a NewPlayingInfo object.
        */
        requestPlaybackQueue(options: PlaybackQueueRequestOptions): Promise<NowPlayingInfo>;

        /**
         * Sends an introduction message that returns a message containing the power state of the Apple TV.
         */
        sendIntroduction(): Promise<Message>;

        /**
         * Sends a key press to the Apple TV.
         * @param usePage The page number of the key.
         * @param usage The usage number of the key.
         * @param down Determines whether the direction is down.
         */
        sendKeyPress(usePage: number, usage: number, down: boolean): Promise<AppleTV>;
    }

    /**
     * Represents the credentials object that is created by parsing the credentials string.
     */
    export class Credentials {

        /**
         * Gets the unique identifier of the Apple TV.
         */
        uniqueIdentifier: string;

        /**
        * Parse a credentials string into a Credentials object.
        * @param text  The credentials string.
        * @returns A credentials object.
        */
        static parse(text: string): Credentials;
    }
    
    /**
    * A convenience function to scan for AppleTVs on the local network.
    * @param uniqueIdentifier An optional identifier for the AppleTV to scan for. The AppleTV advertises this via Bonjour.
    * @param timeout An optional timeout value (in seconds) to give up the search after.
    * @returns A promise that resolves to an array of AppleTV objects. If you provide a `uniqueIdentifier` the array is guaranteed to only contain one object.
    */
    export function scan(uniqueIdentifier?: string, timeout?: number): Promise<AppleTV[]>;

    /**
    * A convenience function to parse a credentials string into a Credentials object.
    * @param text The credentials string.
    * @returns A credentials object.
    */
    export function parseCredentials(text: string): Credentials;
}
