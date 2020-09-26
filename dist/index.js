"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var homebridge_framework_1 = require("homebridge-framework");
var platform_1 = require("./lib/platform");
// Registers the platform at homebridge
module.exports = homebridge_framework_1.Homebridge.register(new platform_1.Platform());
