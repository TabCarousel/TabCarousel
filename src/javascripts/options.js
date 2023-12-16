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

    // Send message for background.js to update its options

    // chrome.runtime.sendMessage({
    //     action: "setOptions",
    //     options: {
    //         flipWait_ms: document.getElementById("flipWait_ms").value,
    //         automaticStart: document.getElementById("automaticStart").checked
    //     }
    // }, function (response) {
    //     document.getElementById("status").innerHTML = "Saved.";
    // });

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

