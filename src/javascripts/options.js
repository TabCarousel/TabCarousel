import LS from "./shared.js";


function saveOptions() {

    // LS.setItem({ flipWait_ms: options.flipWait_ms, automaticStart: options.automaticStart }, function () {
    //     if (chrome.runtime.lastError) {
    //         sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
    //     } else {
    //         sendResponse({ status: 'Saved.' });
    //     }
    // });

    LS.setItem("flipWait_ms", options.flipWait_ms);
    LS.setItem("automaticStart", options.automaticStart);
    document.getElementById("status").innerHTML = "Saved.";

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

chrome.storage.local.get(["flipWait_ms", "automaticStart"], function (result) {
    document.getElementById("flipWait_ms").value = result.flipWait_ms;
    document.getElementById("automaticStart").checked = result.automaticStart;
});