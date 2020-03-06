
import { Homebridge } from 'homebridge-framework';
import { Platform } from './lib/platform';

// Registers the platform at homebridge
module.exports = Homebridge.register(new Platform());
