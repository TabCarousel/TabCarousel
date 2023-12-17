/**
 * shared.js
 * 
 * This script is responsible for managing shared constants, default values, and local storage operations.
 * 
 * @module
 * 
 * @exports {Object} LS - An object with methods for interacting with chrome's local storage.
 * @exports {Object} defaults - An object containing default values for the extension's settings.
 * @exports {Object} constants - An object containing constant keys used in the extension.
 * 
 * @property {Object} LS.getAllItems - Returns all items in chrome's local storage.
 * @property {Function} LS.getItem - Returns a specific item from chrome's local storage.
 * @property {Function} LS.setItem - Sets a specific item in chrome's local storage.
 * @property {Function} LS.removeItems - Removes specific items from chrome's local storage.
 * 
 * @property {number} defaults.flipWait_ms - The default time to wait before flipping to the next tab.
 * @property {number} defaults.reloadWait_ms - The default time to wait before reloading a tab.
 * @property {boolean} defaults.automaticStart - The default setting for whether the extension should start automatically.
 * 
 * @property {string} constants.reloadWait_ms - The key for the reload wait time setting.
 * @property {string} constants.flipWait_ms - The key for the flip wait time setting.
 * @property {string} constants.automaticStart - The key for the automatic start setting.
 * @property {string} constants.firstRun - The key for the first run setting.
 */

export const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({ [key]: val }),
    removeItems: keys => chrome.storage.local.remove(keys),
};

export const defaults = {
    flipWait_ms: 15 * 1000,
    reloadWait_ms: 5 * 60 * 1000,
    automaticStart: false
};

export const constants = {
    reloadWait_ms: 'reloadWait_ms',
    flipWait_ms: 'flipWait_ms',
    automaticStart: 'automaticStart',
    firstRun: 'firstRun'
};