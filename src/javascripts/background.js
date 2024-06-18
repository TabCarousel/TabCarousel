
/**
 * Chrome plugin to cycle through tabs.
 *
 * @author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
 * @author Madhur Ahuja, @madhur
 * @seealso http://code.google.com/chrome/extensions/background_pages.html
 */

import { LS } from './shared.js';
import { defaults } from './shared.js';
import { constants } from './shared.js';

// Keep the service worker active
setInterval(()=>{self.serviceWorker.postMessage('test')},20000);

chrome.runtime.onInstalled.addListener(({reason}) => {
    if (reason === 'install') {
        chrome.tabs.create({
            url: 'onboarding.html'
        });
    }
    loadCarousel();
});


/**
 * Carousel class for managing and controlling tab cycling in a Chrome extension.
 *
 * @class
 *
 * @property {Object} lastReloads_ms - An object to store the last reload time of each tab.
 * @property {number} lastTimeout - The ID of the last timeout set with setTimeout().
 *
 * @method constructor() - Initializes a new instance of the Carousel class.
 * @method reload(tabId) - Reloads a tab if it hasn't been reloaded recently.
 * @method select(windowId, count) - Selects a tab in a window and reloads the next tab.
 * @method start() - Starts the carousel, cycling through tabs in the current window.
 */
class Carousel {
    constructor() {
        this.lastReloads_ms = {};
        this.lastTimeout = undefined;
    }

    async reload(tabId) {
        const now_ms = Date.now();
        const lastReload_ms = this.lastReloads_ms[tabId];
        let bypassCache = await this.bypassCache();

        if (!lastReload_ms || (now_ms - lastReload_ms >= defaults.reloadWait_ms)) {
            if (bypassCache) {
                chrome.tabs.reload(tabId, { bypassCache: true });
            }
            else {
                chrome.tabs.reload(tabId);
            }
            this.lastReloads_ms[tabId] = now_ms;
        }
    }

    select(windowId, count) {

        chrome.tabs.query({ windowId: windowId }, (tabs) => {
            if (tabs.length === 0) {
                return;
            }
            const tab = tabs[count % tabs.length];
            const nextTab = tabs[(count + 1) % tabs.length];
            chrome.tabs.update(tab.id, { active: true });
            this.reload(nextTab.id);
        });
    }

    async start() {
        let count = 0;
        let windowId;
        let ms = await this.flipWait_ms();

        chrome.windows.getCurrent((w) => {
            windowId = w.id;
        });
        chrome.action.setIcon({ path: 'images/icon_32_exp_1.75_stop_emblem.png' });
        chrome.action.setTitle({ title: 'Stop Carousel' });

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
        chrome.action.setIcon({ path: 'images/icon_32.png' });
        chrome.action.setTitle({ title: 'Start Carousel' });
    }

    async flipWait_ms() {
        return await LS.getItem(constants.flipWait_ms) || defaults.flipWait_ms;
    }

    async reloadWait_ms() {
        return await LS.getItem(constants.reloadWait_ms) || defaults.reloadWait_ms;
    }

    async bypassCache() {
        let bypassCache =  await LS.getItem(constants.bypassCache) || defaults.bypassCache;
        if (bypassCache !== undefined) {
            return JSON.parse(bypassCache);
        }
    }

    async automaticStart() {
        const automaticStart = await LS.getItem(constants.automaticStart);
        if (automaticStart !== undefined) {
            return JSON.parse(automaticStart);
        }
    }

    async click() {
        if (!this.running()) {
            await this.start();
        } else {
            this.stop();
        }
    }

    async load() {
        chrome.action.onClicked.addListener(async () => await this.click());
        chrome.action.setTitle({ title: 'Start Carousel' });

        if (await this.automaticStart()) {
            await this.start();
        }
    }
}



chrome.runtime.onStartup.addListener(() => {
    // Code to run on extension startup
    loadCarousel();
});

async function loadCarousel() {
    const carousel = new Carousel();
    await carousel.load();
}
