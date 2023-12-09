
/**
 * Chrome plugin to cycle through tabs.
 * 
 * @author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
 * @seealso http://code.google.com/chrome/extensions/background_pages.html
 */

const LS = {
    getAllItems: () => chrome.storage.local.get(),
    getItem: async key => (await chrome.storage.local.get(key))[key],
    setItem: (key, val) => chrome.storage.local.set({ [key]: val }),
    removeItems: keys => chrome.storage.local.remove(keys),
};

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.action === "setOptions") {
            let options = request.options;
            // Do something with options.flipWait_ms and options.automaticStart
            // For example, save them in chrome.storage
            chrome.storage.local.set({ flipWait_ms: options.flipWait_ms, automaticStart: options.automaticStart }, function () {
                if (chrome.runtime.lastError) {
                    sendResponse({ status: 'error', message: chrome.runtime.lastError.message });
                } else {
                    sendResponse({ status: 'Saved.' });
                }
            });
            return true;  // Will respond asynchronously.
        }
    }
);


class Carousel {
    constructor() {
        this.defaults = {
            flipWait_ms: 15 * 1000,
            reloadWait_ms: 5 * 60 * 1000
        };

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

        if (!lastReload_ms || (now_ms - lastReload_ms >= this.defaults.reloadWait_ms)) {
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

    start(ms) {
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

    firstRun(value) {
        if (value) {
            localStorage['firstRun'] = value;
        } else {
            return !localStorage['firstRun'];
        }
    }

    flipWait_ms(ms) {
        if (ms) {
            LS.setItem('flipWait_ms', ms);
            //localStorage['flipWait_ms'] = ms;
        } else {
            return LS.getItem('flipWait_ms') || this.defaults.flipWait_ms;
            //return localStorage['flipWait_ms'] || this.defaults.flipWait_ms;
        }
    }

    automaticStart(value) {
        if (1 === arguments.length) {
            LS.setItem('automaticStart', !!value);
            //localStorage['automaticStart'] = !!value;
        } else {
            const automaticStart = LS.getItem('automaticStart');
            if (automaticStart !== undefined) {
                return JSON.parse(automaticStart);
            }
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

