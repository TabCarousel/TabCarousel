/**
 * options.js
 * 
 * This script is responsible for managing the options/settings of the extension.
 * 
 * @module
 * 
 * @requires shared.js - Contains shared constants and default values.
 * 
 * @function saveOptions() - Saves the user's options to local storage.
 * 
 * @event save.onclick - Triggers the saveOptions function when the save button is clicked.
 * 
 * @var flipWait_ms - Retrieves the flipWait_ms value from local storage or uses the default value.
 * 
 * @var automaticStart - Retrieves the automaticStart value from local storage or uses the default value.
 */

import { LS } from './shared.js';
import { defaults } from './shared.js';
import { constants } from './shared.js';

function saveOptions() {
    const options = {
        flipWait_ms: document.getElementById(constants.flipWait_ms).value,
        automaticStart: document.getElementById(constants.automaticStart).checked
    };
    LS.setItem(constants.flipWait_ms, options.flipWait_ms);
    LS.setItem(constants.automaticStart, options.automaticStart);
    document.getElementById('status').innerHTML = 'Saved.';
    return false;
}

document.getElementById('save').onclick = saveOptions;
const flipWait_ms = await LS.getItem(constants.flipWait_ms) || defaults.flipWait_ms;
document.getElementById(constants.flipWait_ms).value = flipWait_ms;

let automaticStart = await LS.getItem(constants.automaticStart);
if (automaticStart === undefined) {
    automaticStart = defaults.automaticStart;
}
document.getElementById(constants.automaticStart).checked = automaticStart;

