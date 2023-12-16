import { LS } from "./shared.js";
import { defaults } from "./shared.js";

function saveOptions() {

    const options = {
        flipWait_ms: document.getElementById("flipWait_ms").value,
        automaticStart: document.getElementById("automaticStart").checked
    };
    console.log(options);
    LS.setItem("flipWait_ms", options.flipWait_ms);
    LS.setItem("automaticStart", options.automaticStart);
    document.getElementById("status").innerHTML = "Saved.";

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

document.getElementById("save").onclick = saveOptions;
const flipWait_ms = await LS.getItem("flipWait_ms") || defaults.flipWait_ms;
document.getElementById("flipWait_ms").value = flipWait_ms;

const automaticStart = await LS.getItem("automaticStart");
if (automaticStart === undefined) {
    automaticStart = defaults.automaticStart;
}
document.getElementById("automaticStart").checked = automaticStart;

