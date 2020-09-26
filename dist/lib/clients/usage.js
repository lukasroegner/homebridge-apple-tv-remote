"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Represents the collection of possible keys.
 */
var Usage = /** @class */ (function () {
    function Usage() {
    }
    /**
     * Gets the usage by key.
     * @param key The string representation of the key.
     */
    Usage.getByKey = function (key) {
        switch (key) {
            case 'up':
                return { usePage: 1, usage: 0x8C };
            case 'down':
                return { usePage: 1, usage: 0x8D };
            case 'left':
                return { usePage: 1, usage: 0x8B };
            case 'right':
                return { usePage: 1, usage: 0x8A };
            case 'menu':
                return { usePage: 1, usage: 0x86 };
            case 'topmenu':
                return { usePage: 12, usage: 0x60 };
            case 'home':
                return { usePage: 12, usage: 0x40 };
            case 'play':
                return { usePage: 12, usage: 0xB0 };
            case 'pause':
                return { usePage: 12, usage: 0xB1 };
            case 'stop':
                return { usePage: 12, usage: 0xB7 };
            case 'next':
                return { usePage: 12, usage: 0xB5 };
            case 'previous':
                return { usePage: 12, usage: 0xB6 };
            case 'suspend':
                return { usePage: 1, usage: 0x82 };
            case 'wake':
                return { usePage: 1, usage: 0x83 };
            case 'volumeup':
                return { usePage: 12, usage: 0xE9 };
            case 'volumedown':
                return { usePage: 12, usage: 0xEA };
            case 'select':
                return { usePage: 1, usage: 0x89 };
            default:
                throw new Error('Key not found.');
        }
    };
    return Usage;
}());
exports.Usage = Usage;
