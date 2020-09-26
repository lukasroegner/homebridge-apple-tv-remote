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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var body_parser_1 = __importDefault(require("body-parser"));
var apple_tv_1 = require("./models/apple-tv");
/**
 * Represents the HTTP API that the plugin exposes.
 */
var Api = /** @class */ (function () {
    /**
     * Initializes a new Api instance.
     * @param platform The platform of the plugin.
     */
    function Api(platform) {
        var _this = this;
        platform.logger.info("[API] Initializing...");
        // Initializes the express server and enables JSON bodies
        var server = express_1.default();
        server.use(body_parser_1.default.json());
        // Configures a middleware to authenticate requests
        server.use(function (req, res, next) {
            // Checks the token
            if (!req.headers.authorization || req.headers.authorization !== platform.configuration.apiToken) {
                platform.logger.warn("[API] Token invalid");
                return res.sendStatus(401);
            }
            // As the token is valid, the next middleware can be executed
            return next();
        });
        // Handles GET requests
        server.get('/:name', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var client, appleTv, _a, _b, e_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        client = platform.clients.find(function (c) { return c.name == req.params.name; });
                        if (!client) {
                            platform.logger.warn("[API] [" + req.params.name + "] Not found");
                            return [2 /*return*/, res.sendStatus(404)];
                        }
                        _c.label = 1;
                    case 1:
                        _c.trys.push([1, 4, , 5]);
                        appleTv = new apple_tv_1.AppleTv();
                        _a = appleTv;
                        return [4 /*yield*/, client.isOnAsync()];
                    case 2:
                        _a.isOn = _c.sent();
                        _b = appleTv;
                        return [4 /*yield*/, client.isPlayingAsync()];
                    case 3:
                        _b.isPlaying = _c.sent();
                        // Checks if disconnection is needed (in case events are disabled)
                        if (!client.areEventsEnabled) {
                            client.disconnect();
                        }
                        // Returns the response as JSON
                        return [2 /*return*/, res.json(appleTv)];
                    case 4:
                        e_1 = _c.sent();
                        platform.logger.warn("[API] [" + req.params.name + "] Bad request: " + e_1);
                        return [2 /*return*/, res.sendStatus(401)];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
        // Handles POST requests
        server.post('/:name', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var client, appleTv, _loop_1, _i, _a, command, e_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        client = platform.clients.find(function (c) { return c.name == req.params.name; });
                        if (!client) {
                            platform.logger.warn("[API] [" + req.params.name + "] Not found");
                            return [2 /*return*/, res.sendStatus(404)];
                        }
                        appleTv = req.body;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 14, , 15]);
                        if (!(appleTv.isOn === true)) return [3 /*break*/, 3];
                        return [4 /*yield*/, client.switchOnAsync()];
                    case 2:
                        _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!(appleTv.isOn === false)) return [3 /*break*/, 5];
                        return [4 /*yield*/, client.switchOffAsync()];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!(appleTv.isPlaying === true)) return [3 /*break*/, 7];
                        return [4 /*yield*/, client.playAsync()];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7:
                        if (!(appleTv.isPlaying === false)) return [3 /*break*/, 9];
                        return [4 /*yield*/, client.pauseAsync()];
                    case 8:
                        _b.sent();
                        _b.label = 9;
                    case 9:
                        if (!(appleTv.commands && appleTv.commands.length > 0)) return [3 /*break*/, 13];
                        _loop_1 = function (command) {
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
                        _i = 0, _a = appleTv.commands;
                        _b.label = 10;
                    case 10:
                        if (!(_i < _a.length)) return [3 /*break*/, 13];
                        command = _a[_i];
                        return [5 /*yield**/, _loop_1(command)];
                    case 11:
                        _b.sent();
                        _b.label = 12;
                    case 12:
                        _i++;
                        return [3 /*break*/, 10];
                    case 13:
                        // Checks if disconnection is needed (in case events are disabled)
                        if (!client.areEventsEnabled) {
                            client.disconnect();
                        }
                        // Returns an HTTP OK
                        return [2 /*return*/, res.sendStatus(200)];
                    case 14:
                        e_2 = _b.sent();
                        platform.logger.warn("[API] [" + req.params.name + "] Bad request: " + e_2);
                        return [2 /*return*/, res.sendStatus(401)];
                    case 15: return [2 /*return*/];
                }
            });
        }); });
        // Starts the HTTP server
        server.listen(platform.configuration.apiPort, function () {
            platform.logger.info("[API] Started");
        });
    }
    return Api;
}());
exports.Api = Api;
