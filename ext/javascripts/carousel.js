/**
 * Chrome plugin to cycle through tabs.
 * 
 * @author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
 * @seealso http://code.google.com/chrome/extensions/background_pages.html
 */
var carousel = (function () {
  /** Module @namespace */
  var ns = {};

  /** @constant */
  ns.defaults = {
    /** Interval between tabs, in ms. */
    selectWait_ms: 15 * 1000,
    /** Interval between reloading a tab, in ms.  Let's not kill other people's servers with automated requests. */
    reloadWait_ms: 5 * 60 * 1000
  };

  /**
   * Keep track of the last time a tab was refreshed so we can wait at least 5 minutes betweent refreshes.
   * TODO
   */
  ns.lastReloads_ms = {};

  /**
   * Reload the given tab, if it has been more than ns.reloadWait_ms ago since it's last been reloaded.
   * @function
   */
  ns.reload = function (tabId) {
    var now_ms = (new Date()).getTime(),
      lastReload_ms = ns.lastReloads_ms[tabId];
    
    if (!lastReload_ms || (now_ms - lastReload_ms >= ns.defaults.reloadWait_ms)) {
      chrome.tabs.executeScript(tabId, {code: 'document.location.reload()', allFrames: true});
      ns.lastReloads_ms[tabId] = now_ms;
    }
  };

  /**
   * Select the given tab count, mod the number of tabs currently open.
   * @function
   * @seealso http://code.google.com/chrome/extensions/tabs.html
   * @seealso http://code.google.com/chrome/extensions/content_scripts.html#pi
   */
  ns.select = function (count) {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
      var tab = tabs[count % tabs.length],
        nextTab = tabs[(count + 1) % tabs.length];
      chrome.tabs.update(tab.id, {selected: true});
      ns.reload(nextTab.id);
    });
  };

  /**
   * Put the carousel into motion.
   * @function
   */
  ns.start = function (ms) {
    var continuation, count = 0;

    continuation = function () {
      ns.select(count);
      count += 1;
      ns.lastTimeout = setTimeout(continuation, ms);
    };

    continuation();
  };

  /**
   * Is the carousel in motion?
   * @function
   */
  ns.running = function () {
    return !!ns.lastTimeout;
  };

  /**
   * Stop the carousel.
   * @function
   */
  ns.stop = function () {
    clearTimeout(ns.lastTimeout);
    ns.lastTimeout = undefined;
    alert('Carousel stopped.');
  };

  /**
   * Chrome browser action (toolbar button) click handler.
   * @function
   */
  ns.click = function () {
    var entry, ms, parsed;

    if (!ns.running()) {
      entry = prompt('Starting carousel.  Click toolbar button again to stop.\n\nPlease enter wait interval in ms, or leave empty to use the default (' + ns.defaults.selectWait_ms + ' ms)');

      parsed = parseInt(entry, 10);
      ms = parsed > 0 ? parsed : ns.defaults.selectWait_ms;

      ns.start(ms);
    } else {
      ns.stop();
    }
  };

  /**
   * Background page onLoad handler.
   * @function
   */
  ns.load = function () {
    chrome.browserAction.onClicked.addListener(ns.click);
  };

  return ns;
}());
