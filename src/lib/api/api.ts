
/// <reference types="express-serve-static-core" />

import { Platform } from '../platform';
import { AppleTv } from './models/apple-tv';

import express from 'express';
import bodyParser from 'body-parser';

/**
 * Represents the HTTP API that the plugin exposes.
 */
export class Api {

    /**
     * Initializes a new Api instance.
     * @param platform The platform of the plugin.
     */
    constructor(private platform: Platform) {
        platform.logger.info(`[API] Initializing...`);

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

        // Handles get state requests
        server.get('/:name', async (req, res) => this.handleGetState(req, res));
        server.get('/:name/get', async (req, res) => this.handleGetState(req, res));

        // Handles set state requests
        server.post('/:name', async (req, res) => this.handleSetState(req, res));
        server.get('/:name/set', async (req, res) => this.handleSetState(req, res));
        
        // Starts the HTTP server
        server.listen(platform.configuration.apiPort, () => {
            platform.logger.info(`[API] Started`);
        });
    }

    /**
     * Handles an HTTP request to retrieve the state of an Apple TV.
     * @param req The request object.
     * @param res The response object.
     */
    private async handleGetState(req: any, res: any): Promise<void> {

        // Gets the client by name
        const client = this.platform.clients.find(c => c.name == req.params.name);
        if (!client) {
            this.platform.logger.warn(`[API] [${req.params.name}] Not found`);
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
            this.platform.logger.warn(`[API] [${req.params.name}] Bad request: ${e}`);
            return res.sendStatus(401);
        }
    }

    /**
     * Handles an HTTP request to set the state of an Apple TV.
     * @param req The request object.
     * @param res The response object.
     */
    private async handleSetState(req: any, res: any): Promise<void> {

        // Gets the client by name
        const client = this.platform.clients.find(c => c.name == req.params.name);
        if (!client) {
            this.platform.logger.warn(`[API] [${req.params.name}] Not found`);
            return res.sendStatus(404);
        }

        // Gets the body
        const appleTv: AppleTv = req.body;
        
        // Executes the commands
        try {

            // Executes on/off commands
            if (appleTv.isOn === true || (req.query && req.query.isOn == 'true')) {
                await client.switchOnAsync();
            }
            if (appleTv.isOn === false || (req.query && req.query.isOn == 'false')) {
                await client.switchOffAsync();
            }

            // Executes play/pause commands
            if (appleTv.isPlaying === true || (req.query && req.query.isPlaying == 'true')) {
                await client.playAsync();
            }
            if (appleTv.isPlaying === false || (req.query && req.query.isPlaying == 'false')) {
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
            this.platform.logger.warn(`[API] [${req.params.name}] Bad request: ${e}`);
            return res.sendStatus(401);
        }
    }
}
