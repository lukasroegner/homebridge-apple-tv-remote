"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AppleTv = __importStar(require("node-appletv-x"));
var homebridge_framework_1 = require("homebridge-framework");
var apple_tv_client_1 = require("./clients/apple-tv-client");
var apple_tv_controller_1 = require("./controllers/apple-tv-controller");
var api_1 = require("./api/api");
/**
 * Represents the platform of the plugin.
 */
var Platform = /** @class */ (function (_super) {
    __extends(Platform, _super);
    function Platform() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Gets or sets the list of all clients that are used to communicate with the Apple TVs.
         */
        _this.clients = new Array();
        /**
         * Gets or sets the list of all controllers that represent physical Apple TVs in HomeKit.
         */
        _this.controllers = new Array();
        return _this;
    }
    Object.defineProperty(Platform.prototype, "pluginName", {
        /**
         * Gets the name of the plugin.
         */
        get: function () {
            return 'homebridge-apple-tv-remote';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Platform.prototype, "platformName", {
        /**
         * Gets the name of the platform which is used in the configuration file.
         */
        get: function () {
            return 'AppleTvPlatform';
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Is called when the platform is initialized.
     */
    Platform.prototype.initialize = function () {
        this.logger.info("Initialing platform...");
        // Sets the API configuration
        this.configuration.isApiEnabled = this.configuration.isApiEnabled || false;
        this.configuration.apiPort = this.configuration.apiPort || 40304;
        // Sets the timeouts and intervals
        this.configuration.scanTimeout = this.configuration.scanTimeout || 2;
        this.configuration.maximumConnectRetry = this.configuration.maximumConnectRetry || 10;
        this.configuration.connectRetryInterval = this.configuration.connectRetryInterval || 5;
        this.configuration.heartbeatInterval = this.configuration.heartbeatInterval || 60;
        // Cycles over all configured devices and creates the corresponding controllers and clients
        if (this.configuration.devices) {
            for (var _i = 0, _a = this.configuration.devices; _i < _a.length; _i++) {
                var deviceConfiguration = _a[_i];
                if (deviceConfiguration.name) {
                    // Checks whether the credentials are valid and can be parsed
                    try {
                        AppleTv.parseCredentials(deviceConfiguration.credentials);
                    }
                    catch (_b) {
                        this.logger.warn("[" + deviceConfiguration.name + "] Credentials are invalid. Make sure that you copied them correctly.");
                        continue;
                    }
                    // Creates a new client for the device configuration
                    if (deviceConfiguration.isOnOffSwitchEnabled || deviceConfiguration.isPlayPauseSwitchEnabled || this.configuration.isApiEnabled || (deviceConfiguration.commandSwitches && deviceConfiguration.commandSwitches.length > 0)) {
                        var appleTvClient = new apple_tv_client_1.AppleTvClient(this, deviceConfiguration);
                        this.clients.push(appleTvClient);
                        // Creates an Apple TV controller for the device configuration
                        if (deviceConfiguration.isOnOffSwitchEnabled || deviceConfiguration.isPlayPauseSwitchEnabled || (deviceConfiguration.commandSwitches && deviceConfiguration.commandSwitches.length > 0)) {
                            var appleTvController = new apple_tv_controller_1.AppleTvController(this, deviceConfiguration, appleTvClient);
                            this.controllers.push(appleTvController);
                        }
                    }
                    else {
                        this.logger.warn("[" + deviceConfiguration.name + "] Device not used.");
                    }
                }
                else {
                    this.logger.warn("Device name missing in the configuration.");
                }
            }
        }
        else {
            this.logger.warn("No devices configured.");
        }
        // Enables the API
        if (this.configuration.isApiEnabled) {
            new api_1.Api(this);
        }
    };
    /**
     * Is called when homebridge is shut down.
     */
    Platform.prototype.destroy = function () {
        this.logger.info("Shutting down Apple TV clients...");
        // Destroys all clients
        for (var _i = 0, _a = this.clients; _i < _a.length; _i++) {
            var client = _a[_i];
            client.destroy();
        }
    };
    return Platform;
}(homebridge_framework_1.HomebridgePlatform));
exports.Platform = Platform;
