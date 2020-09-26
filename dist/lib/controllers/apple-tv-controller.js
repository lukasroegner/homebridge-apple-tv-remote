"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var homebridge_framework_1 = require("homebridge-framework");
/**
 * Represents a controller for an Apple TV. Controllers represent physical Apple TVs in HomeKit.
 */
var AppleTvController = /** @class */ (function () {
    /**
     * Initializes a new AppleTvController instance.
     * @param platform The plugin platform.
     * @param deviceConfiguration The configuration of the Apple TV that is represented by this controller.
     * @param client The client that is used to communicate with the Apple TV.
     */
    function AppleTvController(platform, deviceConfiguration, client) {
        var _this = this;
        platform.logger.info("[" + deviceConfiguration.name + "] Initializing...");
        // Configures the client for event emitting
        client.areEventsEnabled = true;
        // Creates the accessory
        var accessory = platform.useAccessory(deviceConfiguration.name, client.id);
        accessory.setInformation({
            manufacturer: 'Apple',
            model: 'Apple TV',
            serialNumber: client.id,
            firmwareRevision: null,
            hardwareRevision: null
        });
        // Creates the On/Off switch if requested
        if (deviceConfiguration.isOnOffSwitchEnabled) {
            platform.logger.info("[" + deviceConfiguration.name + "] Adding on/off switch");
            var onOffSwitchService = accessory.useService(homebridge_framework_1.Homebridge.Services.Switch, deviceConfiguration.onOffSwitchName || 'Power', 'on-off-switch');
            // Adds the characteristics for the service
            var onCharacteristic_1 = onOffSwitchService.useCharacteristic(homebridge_framework_1.Homebridge.Characteristics.On);
            onCharacteristic_1.valueChanged = function (newValue) {
                if (onCharacteristic_1.value !== newValue) {
                    platform.logger.info("[" + deviceConfiguration.name + "] On/off switch changed to " + newValue);
                    try {
                        if (newValue) {
                            client.switchOn();
                        }
                        else {
                            client.switchOff();
                        }
                    }
                    catch (e) {
                        platform.logger.warn("[" + deviceConfiguration.name + "] failed to change On/off to " + newValue);
                    }
                }
            };
            // Subscribes for events of the client
            client.on('isOnChanged', function (_) {
                platform.logger.debug("[" + deviceConfiguration.name + "] On/off switch updated to " + client.isOn);
                onCharacteristic_1.value = client.isOn;
            });
        }
        // Creates the Play/Pause switch if requested
        if (deviceConfiguration.isPlayPauseSwitchEnabled) {
            platform.logger.info("[" + deviceConfiguration.name + "] Adding play/pause switch");
            deviceConfiguration.appPlayPauseSwitches.forEach(function (PlayPauseSwitch) {
                var playPauseSwitchService = accessory.useService(homebridge_framework_1.Homebridge.Services.Switch, PlayPauseSwitch.name || 'Play', PlayPauseSwitch.name + "-Status");
                // Adds the characteristics for the service
                var onCharacteristic = playPauseSwitchService.useCharacteristic(homebridge_framework_1.Homebridge.Characteristics.On);
                onCharacteristic.valueChanged = function (newValue) {
                    if (onCharacteristic.value !== newValue) {
                        platform.logger.info("[" + deviceConfiguration.name + "] Play/pause switch changed to " + newValue);
                        try {
                            if (newValue) {
                                client.play();
                            }
                            else {
                                client.pause();
                            }
                        }
                        catch (e) {
                            platform.logger.warn("[" + deviceConfiguration.name + "] Failed to change play/pause to " + newValue);
                        }
                    }
                };
                // Subscribes for events of the client
                client.on('isPlayingChanged', function (_) {
                    platform.logger.debug("[" + deviceConfiguration.name + "] Play/pause switch updated to " + client.isPlaying);
                    if (PlayPauseSwitch.bundleIdentifier == client.currentApp) {
                        onCharacteristic.value = client.isPlaying;
                    }
                    else {
                        onCharacteristic.value = false;
                    }
                });
            });
        }
        // Creates the command switches if requested
        if (deviceConfiguration.commandSwitches && deviceConfiguration.commandSwitches.length > 0) {
            var _loop_1 = function (commandSwitchConfiguration) {
                if (commandSwitchConfiguration.name) {
                    platform.logger.info("[" + deviceConfiguration.name + "] Adding command switch " + commandSwitchConfiguration.name);
                    var commandSwitchService = accessory.useService(homebridge_framework_1.Homebridge.Services.Switch, commandSwitchConfiguration.name, commandSwitchConfiguration.name + "-switch");
                    // Adds the characteristics for the service
                    var onCharacteristic_2 = commandSwitchService.useCharacteristic(homebridge_framework_1.Homebridge.Characteristics.On);
                    onCharacteristic_2.valueChanged = function (newValue) {
                        if (newValue) {
                            platform.logger.info("[" + deviceConfiguration.name + "] Command switch " + commandSwitchConfiguration.name + " changed to " + newValue);
                            // Defines the function for executing the commands
                            var executeCommands = function () { return __awaiter(_this, void 0, void 0, function () {
                                var _loop_2, _i, _a, command, e_1;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _b.trys.push([0, 5, , 6]);
                                            if (!(commandSwitchConfiguration.commands && commandSwitchConfiguration.commands.length > 0)) return [3 /*break*/, 4];
                                            _loop_2 = function (command) {
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            if (!command.wait) return [3 /*break*/, 2];
                                                            return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, command.wait || 0); })];
                                                        case 1:
                                                            _a.sent();
                                                            _a.label = 2;
                                                        case 2:
                                                            if (!command.key) return [3 /*break*/, 6];
                                                            if (!command.longPress) return [3 /*break*/, 4];
                                                            return [4 /*yield*/, client.longPressKeyAsync(command.key)];
                                                        case 3:
                                                            _a.sent();
                                                            return [3 /*break*/, 6];
                                                        case 4: return [4 /*yield*/, client.pressKeyAsync(command.key)];
                                                        case 5:
                                                            _a.sent();
                                                            _a.label = 6;
                                                        case 6: return [2 /*return*/];
                                                    }
                                                });
                                            };
                                            _i = 0, _a = commandSwitchConfiguration.commands;
                                            _b.label = 1;
                                        case 1:
                                            if (!(_i < _a.length)) return [3 /*break*/, 4];
                                            command = _a[_i];
                                            return [5 /*yield**/, _loop_2(command)];
                                        case 2:
                                            _b.sent();
                                            _b.label = 3;
                                        case 3:
                                            _i++;
                                            return [3 /*break*/, 1];
                                        case 4: return [3 /*break*/, 6];
                                        case 5:
                                            e_1 = _b.sent();
                                            platform.logger.warn("[" + deviceConfiguration.name + "] Failed to execute command for " + commandSwitchConfiguration.name);
                                            return [3 /*break*/, 6];
                                        case 6: return [2 /*return*/];
                                    }
                                });
                            }); };
                            // Starts the execution of the commands
                            executeCommands();
                            // Sets a timeout that resets the "stateless" switch
                            setTimeout(function () { return onCharacteristic_2.value = false; }, 1000);
                        }
                    };
                }
            };
            for (var _i = 0, _a = deviceConfiguration.commandSwitches; _i < _a.length; _i++) {
                var commandSwitchConfiguration = _a[_i];
                _loop_1(commandSwitchConfiguration);
            }
        }
    }
    return AppleTvController;
}());
exports.AppleTvController = AppleTvController;
