function sendMessages() {
    chrome.runtime.sendMessage({
        action: "setOptions",
        options: {
            flipWait_ms: document.getElementById("flipWait_ms").value,
            automaticStart: document.getElementById("automaticStart").checked
        }
    }, function (response) {
        document.getElementById("status").innerHTML = "Saved.";
    });

    return false;
}

document.getElementById("save").onclick = sendMessages;

chrome.storage.local.get(["flipWait_ms", "automaticStart"], function (result) {
    document.getElementById("flipWait_ms").value = result.flipWait_ms;
    document.getElementById("automaticStart").checked = result.automaticStart;
});