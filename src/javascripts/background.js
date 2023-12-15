
/**
 * Chrome plugin to cycle through tabs.
 * 
 * @author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
 * @seealso http://code.google.com/chrome/extensions/background_pages.html
 */

import {LS} from "./shared.js";
import {defaults} from "./shared.js";

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "setOptions") {
            let options = request.options;
            // Do something with options.flipWait_ms and options.automaticStart
            // For example, save them in chrome.storage
            
            return true;  // Will respond asynchronously.
        }
    }
);


class Carousel {
    constructor() {
        this.tutorialText = [
            'First-Use Tutorial',
            '',
            'TabCarousel is simple:  open tabs you want to monitor throughout the day, then click the toolbar icon.  To stop, click the icon again.',
            '',
            `By default, TabCarousel will flip through your tabs every ${this.defaults.flipWait_ms / 1000} s, reloading them every ${this.defaults.reloadWait_ms / 1000 / 60} min.  It's great on a unused display or TV.  Put Chrome in full-screen mode (F11, or cmd-shift-f on the Mac) and let it go.`,
            '',
            'If you want to change how often TabCarousel flips through your tabs, right click on the toolbar icon and choose "Options".'
        ].join('\n');

        this.lastReloads_ms = {};
        this.lastTimeout = undefined;
    }

    reload(tabId) {
        const now_ms = Date.now();
        const lastReload_ms = this.lastReloads_ms[tabId];

        if (!lastReload_ms || (now_ms - lastReload_ms >= defaults.reloadWait_ms)) {
            chrome.tabs.reload(tabId);
            this.lastReloads_ms[tabId] = now_ms;
        }
    }

    select(windowId, count) {
        chrome.tabs.getAllInWindow(windowId, (tabs) => {
            const tab = tabs[count % tabs.length];
            const nextTab = tabs[(count + 1) % tabs.length];
            chrome.tabs.update(tab.id, { selected: true });
            this.reload(nextTab.id);
        });
    }

    start() {
        let count = 0;
        let windowId;

        if (!ms) { ms = this.flipWait_ms(); }
        chrome.windows.getCurrent((w) => { windowId = w.id; });

        chrome.browserAction.setIcon({ path: 'images/icon_32_exp_1.75_stop_emblem.png' });
        chrome.browserAction.setTitle({ title: 'Stop Carousel' });

        const continuation = () => {
            this.select(windowId, count);
            count += 1;
            this.lastTimeout = setTimeout(continuation, ms);
        };

        continuation();
    }

    running() {
        return !!this.lastTimeout;
    }

    stop() {
        clearTimeout(this.lastTimeout);
        this.lastTimeout = undefined;
        chrome.browserAction.setIcon({ path: 'images/icon_32.png' });
        chrome.browserAction.setTitle({ title: 'Start Carousel' });
    }

    firstRun() {
        return !LS.getItem('firstRun');
    }

    flipWait_ms() {
            return LS.getItem('flipWait_ms') || defaults.flipWait_ms;
    }

    automaticStart() {
            const automaticStart = LS.getItem('automaticStart');
            if (automaticStart !== undefined) {
                return JSON.parse(automaticStart);
            }
    }

    tutorial() {
        alert(this.tutorialText);
        this.firstRun(Date.now());
    }

    click() {
        if (this.firstRun()) { this.tutorial(); }

        if (!this.running()) {
            this.start();
        } else {
            this.stop();
        }
    }

    load() {
        chrome.action.onClicked.addListener(() => this.click());
        chrome.action.setTitle({ title: 'Start Carousel' });

        if (this.automaticStart()) { this.start(); }
    }
}

const carousel = new Carousel();

