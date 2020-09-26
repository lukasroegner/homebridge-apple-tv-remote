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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var AppleTv = __importStar(require("node-appletv-x"));
var events_1 = require("events");
var usage_1 = require("./usage");
/**
 * Represents a client that communicates with an Apple TV.
 */
var AppleTvClient = /** @class */ (function (_super) {
    __extends(AppleTvClient, _super);
    /**
     * Initializes a new AppleTvClient instance.
     * @param platform The platform of the plugin.
     * @param deviceConfiguration The configuration of the device with which the client should communicate.
     */
    function AppleTvClient(platform, deviceConfiguration) {
        var _this = _super.call(this) || this;
        _this.platform = platform;
        _this.deviceConfiguration = deviceConfiguration;
        /**
         * Contains the currently open connection to the Apple TV.
         */
        _this.appleTv = null;
        /**
         * Contains the handle for the interval that executes the heartbeat command.
         */
        _this.heartbeatIntervalHandle = null;
        /**
         * Contains a value that determines whether events are emitted when the status of the Apple TV changes.
         */
        _this._areEventsEnabled = false;
        /**
         * Contains a value that determines whether the Apple TV is powered on.
         */
        _this._isOn = false;
        /**
         * Contains a value that determines whether the Apple TV is playing.
         */
        _this._isPlaying = false;
        _this._currentApp = "";
        // Sets the user-defined name
        _this.name = deviceConfiguration.name;
        // Parses the credentials in order to extract the unique ID of the hardware
        _this.id = AppleTv.parseCredentials(deviceConfiguration.credentials).uniqueIdentifier;
        return _this;
    }
    /**
     * Sends a heartbeat message to the Apple TV.
     */
    AppleTvClient.prototype.sendHeartbeatAsync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_1, e_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.platform.logger.debug("[" + this.name + "] Sending heartbeat...");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connectAsync(false)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Error while connecting for heartbeat: " + e_1);
                        return [2 /*return*/];
                    case 4:
                        _a.trys.push([4, 6, , 7]);
                        // Sends the introduction message as a heartbeat
                        return [4 /*yield*/, this.appleTv.sendIntroduction()];
                    case 5:
                        // Sends the introduction message as a heartbeat
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        e_2 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Error while sending heartbeat: Socket closed.");
                        this.appleTv = null;
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Tries to get the on/off state of the Apple TV
     * @param messagePayload The message payload that contains the information to check whether the Apple TV is on.
     * @returns Returns a value that determines whether the Apple TV is on.
     */
    AppleTvClient.prototype.getIsOn = function (messagePayload) {
        // If the Apple TV is not a proxy for AirPlay playback, the logicalDeviceCount determines the state
        if (messagePayload.logicalDeviceCount > 0 && !messagePayload.isProxyGroupPlayer) {
            return true;
        }
        // If the Apple TV is a proxy for AirPlay playback, the logicalDeviceCount and the AirPlay state determine the state
        if (messagePayload.logicalDeviceCount > 0 && messagePayload.isProxyGroupPlayer && messagePayload.isAirplayActive) {
            return true;
        }
        return false;
    };
    /**
     * Tries to connect to an Apple TV.
     * @param forceReconnect Determines whether a reconnect should happen even if the Apple TV is already connected.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.connectAsync = function (forceReconnect, retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var appleTvs, uniqueIdentifier_1, appleTv, e_3;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.platform.logger.debug("[" + this.name + "] Connecting...");
                        // Set the default retry count
                        if (!retryCount) {
                            retryCount = this.platform.configuration.maximumConnectRetry;
                        }
                        this.platform.logger.debug("[" + this.name + "] Force reconnect: " + forceReconnect);
                        this.platform.logger.debug("[" + this.name + "] Retry count: " + retryCount);
                        // Checks if connection if already open
                        if (this.appleTv && !forceReconnect) {
                            this.platform.logger.debug("[" + this.name + "] Already connected");
                            return [2 /*return*/];
                        }
                        // Checks if a previous connection should be closed
                        if (this.appleTv) {
                            this.disconnect();
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 9]);
                        // Scans the network for the Apple TV
                        this.platform.logger.debug("[" + this.name + "] Scanning for Apple TV...");
                        return [4 /*yield*/, AppleTv.scan(undefined, this.platform.configuration.scanTimeout)];
                    case 2:
                        appleTvs = _a.sent();
                        uniqueIdentifier_1 = AppleTv.parseCredentials(this.deviceConfiguration.credentials).uniqueIdentifier;
                        appleTv = appleTvs.find(function (a) { return a.uid == uniqueIdentifier_1; });
                        if (!appleTv) {
                            throw new Error('Apple TV not found while scanning.');
                        }
                        // Subscribes for messages if events are enabled
                        if (this.areEventsEnabled) {
                            appleTv.on('message', function (m) {
                                if (m.payload) {
                                    // Updates the power state
                                    if (m.payload.logicalDeviceCount === 0 || m.payload.logicalDeviceCount > 0) {
                                        _this.platform.logger.debug("[" + _this.name + "] Message received: logicalDeviceCount - " + m.payload.logicalDeviceCount + " | isProxyGroupPlayer - " + m.payload.isProxyGroupPlayer + " | isAirplayActive - " + m.payload.isAirplayActive);
                                        _this._isOn = _this.getIsOn(m.payload);
                                        _this.emit('isOnChanged');
                                        // If the Apple TV has switched off, the play state should also be off
                                        if (!_this._isOn) {
                                            _this._isPlaying = false;
                                            _this.emit('isPlayingChanged');
                                        }
                                    }
                                    // Updates the playback state
                                    if (m.payload.playbackState) {
                                        _this.platform.logger.debug("[" + _this.name + "] Message received: playbackState - " + m.payload.playbackState);
                                        // Gets the new playing state
                                        var isPlaying = m.payload.playbackState == 1;
                                        var currentApp = m.payload.playerPath.client.bundleIdentifier;
                                        // Sends another heartbeat if the playback state changed
                                        if (_this._isPlaying !== isPlaying) {
                                            _this.sendHeartbeatAsync();
                                        }
                                        if (_this._currentApp !== currentApp) {
                                            _this.sendHeartbeatAsync();
                                        }
                                        // Updates the play state
                                        _this._isPlaying = isPlaying;
                                        _this._currentApp = currentApp;
                                        _this.emit('isPlayingChanged');
                                    }
                                }
                            });
                        }
                        // Subscribes for closed socket
                        appleTv.on('close', function () { return _this.appleTv = null; });
                        // Opens the connection to the found Apple TV
                        this.platform.logger.debug("[" + this.name + "] Connecting to Apple TV...");
                        return [4 /*yield*/, appleTv.openConnection(AppleTv.parseCredentials(this.deviceConfiguration.credentials))];
                    case 3:
                        _a.sent();
                        this.appleTv = appleTv;
                        this.platform.logger.info("[" + this.name + "] Connected");
                        return [3 /*break*/, 9];
                    case 4:
                        e_3 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Error while connecting: " + e_3);
                        // Decreased the retry count and tries again
                        retryCount--;
                        if (!(retryCount > 0)) return [3 /*break*/, 7];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, _this.platform.configuration.connectRetryInterval * 1000); })];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.connectAsync(true, retryCount)];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7: throw e_3;
                    case 8: return [3 /*break*/, 9];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Disconnects from the Apple TV.
     */
    AppleTvClient.prototype.disconnect = function () {
        this.platform.logger.debug("[" + this.name + "] Disconnecting...");
        // Tries to close the connection
        try {
            if (this.appleTv) {
                this.appleTv.closeConnection();
            }
            else {
                this.platform.logger.debug("[" + this.name + "] Already disconnected");
            }
        }
        finally {
            this.appleTv = null;
        }
    };
    Object.defineProperty(AppleTvClient.prototype, "areEventsEnabled", {
        /**
         * Gets a value that determines whether events are emitted when the status of the Apple TV changes.
         */
        get: function () {
            return this._areEventsEnabled;
        },
        /**
         * Sets a value that determines whether events are emitted when the status of the Apple TV changes.
         */
        set: function (value) {
            var _this = this;
            this._areEventsEnabled = value;
            // Checks if events are disabled
            if (!value) {
                // Clears the interval
                if (this.heartbeatIntervalHandle) {
                    clearInterval(this.heartbeatIntervalHandle);
                    this.heartbeatIntervalHandle = null;
                }
                // Disconnects from the Apple TV
                this.disconnect();
                return;
            }
            // Sets the heartbeat interval
            this.sendHeartbeatAsync();
            this.heartbeatIntervalHandle = setInterval(function () { return _this.sendHeartbeatAsync(); }, this.platform.configuration.heartbeatInterval * 1000);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppleTvClient.prototype, "isOn", {
        /**
         * Gets a value that determines whether the Apple TV is powered on.
         */
        get: function () {
            return this._isOn;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets a value that determines whether the Apple TV is powered on.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.isOnAsync = function (retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var e_4, message, e_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.platform.logger.info("[" + this.name + "] Getting power state...");
                        // If events are enabled, the value is already cached
                        if (this.areEventsEnabled) {
                            this.platform.logger.info("[" + this.name + "] Returning cached value " + this.isOn + " for power state");
                            return [2 /*return*/, this.isOn];
                        }
                        // Set the default retry count
                        if (!retryCount) {
                            retryCount = this.platform.configuration.maximumConnectRetry;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connectAsync(false)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_4 = _a.sent();
                        throw e_4;
                    case 4:
                        _a.trys.push([4, 6, , 10]);
                        return [4 /*yield*/, this.appleTv.sendIntroduction()];
                    case 5:
                        // Sends the introduction message, which returns the device info with the logical device count information
                        message = _a.sent();
                        return [3 /*break*/, 10];
                    case 6:
                        e_5 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Error while getting power state: " + e_5);
                        // Decreased the retry count and tries again
                        retryCount--;
                        if (!(retryCount > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.isOnAsync(retryCount)];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8: throw e_5;
                    case 9: return [3 /*break*/, 10];
                    case 10:
                        // Returns the value indicating whether the device is on.
                        this.platform.logger.info("[" + this.name + "] Returning value " + this.getIsOn(message.payload) + " for power state");
                        return [2 /*return*/, this.getIsOn(message.payload)];
                }
            });
        });
    };
    Object.defineProperty(AppleTvClient.prototype, "isPlaying", {
        /**
         * Gets a value that determines whether the Apple TV is playing.
         */
        get: function () {
            return this._isPlaying;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AppleTvClient.prototype, "currentApp", {
        get: function () {
            return this._currentApp;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets a value that determines whether the Apple TV is playing.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.isPlayingAsync = function (retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var e_6, nowPlayingInfo, e_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.platform.logger.info("[" + this.name + "] Getting play state...");
                        // If events are enabled, the value is already cached
                        if (this.areEventsEnabled) {
                            this.platform.logger.info("[" + this.name + "] Returning cached value " + this.isPlaying + " for play state");
                            return [2 /*return*/, this.isPlaying];
                        }
                        // Set the default retry count
                        if (!retryCount) {
                            retryCount = this.platform.configuration.maximumConnectRetry;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connectAsync(false)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _a.sent();
                        throw e_6;
                    case 4:
                        _a.trys.push([4, 6, , 10]);
                        return [4 /*yield*/, this.appleTv.requestPlaybackQueue({
                                location: 0,
                                length: 1
                            })];
                    case 5:
                        // Requests the playback state
                        nowPlayingInfo = _a.sent();
                        return [3 /*break*/, 10];
                    case 6:
                        e_7 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Error while getting play state: " + e_7);
                        // Decreased the retry count and tries again
                        retryCount--;
                        if (!(retryCount > 0)) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.isPlayingAsync(retryCount)];
                    case 7: return [2 /*return*/, _a.sent()];
                    case 8: throw e_7;
                    case 9: return [3 /*break*/, 10];
                    case 10:
                        // Returns the value indicating whether the device is on.
                        this.platform.logger.info("[" + this.name + "] Returning value " + (nowPlayingInfo.playbackState === AppleTv.NowPlayingInfo.State.Playing) + " for play state");
                        return [2 /*return*/, nowPlayingInfo.playbackState === AppleTv.NowPlayingInfo.State.Playing];
                }
            });
        });
    };
    /**
     * Switches the Apple TV on. This method does not wait for the Apple TV to respond.
     */
    AppleTvClient.prototype.switchOn = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.switchOnAsync()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_8 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Giving up. Error while switching on");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Switches the Apple TV on.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.switchOnAsync = function (retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isOnAsync()];
                    case 1:
                        if (!!(_a.sent())) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.pressKeyAsync('topmenu', false, retryCount)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Switches the Apple TV off. This method does not wait for the Apple TV to respond.
     */
    AppleTvClient.prototype.switchOff = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_9;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.switchOffAsync()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_9 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Giving up. Error while switching off");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Switches the Apple TV off.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.switchOffAsync = function (retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.isOnAsync()];
                    case 1:
                        if (!_a.sent()) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.pressKeyAsync('topmenu', true, retryCount)];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.pressKeyAsync('select', false, 0)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Virtually clicks on the play button. This method does not wait for the Apple TV to respond.
     */
    AppleTvClient.prototype.play = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_10;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.playAsync()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_10 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Giving up. Error while sending play command");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Virtually clicks on the play button.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.playAsync = function (retryCount) {
        return this.pressKeyAsync('play', false, retryCount);
    };
    /**
     * Virtually clicks on the pause button. This method does not wait for the Apple TV to respond.
     */
    AppleTvClient.prototype.pause = function () {
        return __awaiter(this, void 0, void 0, function () {
            var e_11;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.pauseAsync()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        e_11 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Giving up. Error while sending pause command");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Virtually clicks on the pause button.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.pauseAsync = function (retryCount) {
        return this.pressKeyAsync('pause', false, retryCount);
    };
    /**
     * Virtually clicks on the a button.
     * @param key The key to press.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.longPressKeyAsync = function (key, retryCount) {
        return this.pressKeyAsync(key, true, retryCount);
    };
    /**
     * Virtually clicks on the a button.
     * @param key The key to press.
     * @param longPress Determines whether the key should be pressed long.
     * @param retryCount The number of retries that are left.
     */
    AppleTvClient.prototype.pressKeyAsync = function (key, longPress, retryCount) {
        return __awaiter(this, void 0, void 0, function () {
            var usage, e_12, e_13;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.platform.logger.info("[" + this.name + "] Pressing key " + key + "...");
                        try {
                            usage = usage_1.Usage.getByKey(key);
                        }
                        catch (e) {
                            this.platform.logger.warn("[" + this.name + "] Error while pressing key " + key + ": key not found");
                            throw e;
                        }
                        // Set the default retry count
                        if (!retryCount) {
                            retryCount = 2;
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.connectAsync(false)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_12 = _a.sent();
                        throw e_12;
                    case 4:
                        _a.trys.push([4, 9, , 13]);
                        // Requests the playback state
                        return [4 /*yield*/, this.appleTv.sendKeyPress(usage.usePage, usage.usage, true)];
                    case 5:
                        // Requests the playback state
                        _a.sent();
                        if (!longPress) return [3 /*break*/, 7];
                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [4 /*yield*/, this.appleTv.sendKeyPress(usage.usePage, usage.usage, false)];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 9:
                        e_13 = _a.sent();
                        this.platform.logger.warn("[" + this.name + "] Error while pressing key " + key + ": " + e_13);
                        // Decreased the retry count and tries again
                        retryCount--;
                        if (!(retryCount > 0)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.pressKeyAsync(key, longPress, retryCount)];
                    case 10: return [2 /*return*/, _a.sent()];
                    case 11: throw e_13;
                    case 12: return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Is called when homebridge is shut down.
     */
    AppleTvClient.prototype.destroy = function () {
        // Clears the interval for the heartbeat
        this.areEventsEnabled = false;
    };
    return AppleTvClient;
}(events_1.EventEmitter));
exports.AppleTvClient = AppleTvClient;
