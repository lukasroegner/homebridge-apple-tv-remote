
import { Platform } from '../platform';
import express from 'express';
import bodyParser from 'body-parser';
import { AppleTv } from './models/apple-tv';

/**
 * Represents the HTTP API that the plugin exposes.
 */
export class Api {

    /**
     * Initializes a new Api instance.
     * @param platform The platform of the plugin.
     */
    constructor(platform: Platform) {
        platform.logger.debug(`[API] Initializing...`);

        // Initializes the express server and enables JSON bodies
        const server = express();
        server.use(bodyParser.json());
        
        // Configures a middleware to authenticate requests
        server.use((req, res, next) => {

            // Checks the token
            if (!req.headers.authorization || req.headers.authorization !== platform.configuration.apiToken) {
                platform.logger.warn(`[API] Token invalid`);
                return res.sendStatus(401);
            }

            // As the token is valid, the next middleware can be executed
            return next();
        });

        // Handles GET requests
        server.get('/:name', async (req, res) => {

            // Gets the client by name
            const client = platform.clients.find(c => c.name == req.params.name);
            if (!client) {
                platform.logger.warn(`[API] [${req.params.name}] Not found`);
                return res.sendStatus(404);
            }

            // Returns the Apple TV information
            try {
                const appleTv = new AppleTv();
                appleTv.isOn = await client.isOnAsync();
                appleTv.isPlaying = await client.isPlayingAsync();

                // Checks if disconnection is needed (in case events are disabled)
                if (!client.areEventsEnabled) {
                    client.disconnect();
                }

                // Returns the response as JSON
                return res.json(appleTv);
            } catch (e) {
                platform.logger.warn(`[API] [${req.params.name}] Bad request: ${e}`);
                return res.sendStatus(401);
            }
        });

        // Handles POST requests
        server.post('/:name', async (req, res) => {

            // Gets the client by name
            const client = platform.clients.find(c => c.name == req.params.name);
            if (!client) {
                platform.logger.warn(`[API] [${req.params.name}] Not found`);
                return res.sendStatus(404);
            }

            // Gets the body
            const appleTv: AppleTv = req.body;
            
            // Executes the commands
            try {

                // Executes on/off commands
                if (appleTv.isOn === true) {
                    await client.switchOnAsync();
                }
                if (appleTv.isOn === false) {
                    await client.switchOffAsync();
                }

                // Executes play/pause commands
                if (appleTv.isPlaying === true) {
                    await client.playAsync();
                }
                if (appleTv.isPlaying === false) {
                    await client.pauseAsync();
                }

                // Executes key press commands
                if (appleTv.commands && appleTv.commands.length > 0) {
                    for (let command of appleTv.commands) {
                        if (command.wait) {
                            await new Promise(resolve => setTimeout(resolve, command.wait || 0));
                        }
                        if (command.key) {
                            if (command.longPress) {
                                await client.longPressKeyAsync(command.key);
                            } else {
                                await client.pressKeyAsync(command.key);
                            }
                        }
                    }
                }

                // Checks if disconnection is needed (in case events are disabled)
                if (!client.areEventsEnabled) {
                    client.disconnect();
                }

                // Returns an HTTP OK
                return res.sendStatus(200);
            } catch (e) {
                platform.logger.warn(`[API] [${req.params.name}] Bad request: ${e}`);
                return res.sendStatus(401);
            }
        });
        
        // Starts the HTTP server
        server.listen(platform.configuration.apiPort, () => {
            platform.logger.debug(`[API] Started`);
        });
    }
}
