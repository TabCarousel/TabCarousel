/**
 * Chrome plugin to cycle through tabs.
 * 
 * @author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
 * @seealso http://code.google.com/chrome/extensions/background_pages.html
 */
var carousel = (function () {
  /** @namespace */
  var ns = {};

  /**
   * Default interval between tabs, in ms.
   * @constant
   */
  ns.defaultWaitMs = 15000;

  /**
   * Keep track of the last time a tab was refreshed so we can wait at least 5 minutes betweent refreshes.
   * TODO
   */
  ns.lastReload = {};

  /**
   * Select the given tab count, mod the number of tabs currently open.
   * @function
   * @seealso http://code.google.com/chrome/extensions/tabs.html
   * @seealso http://code.google.com/chrome/extensions/content_scripts.html#pi
   */
  ns.select = function (count) {
    chrome.tabs.getAllInWindow(undefined, function (tabs) {
      var tab = tabs[count % tabs.length], nextTab = tabs[(count + 1) % tabs.length];
      chrome.tabs.update(tab.id, {selected: true});
      chrome.tabs.executeScript(nextTab.id, {code: 'document.location.reload()', allFrames: true});
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
    alert('Carousel stopped.');
    clearTimeout(ns.lastTimeout);
    ns.lastTimeout = undefined;
  };

  /**
   * Chrome browser action (toolbar button) click handler.
   * @function
   */
  ns.click = function () {
    var entry, ms, parsed;

    if (!ns.running()) {
      entry = prompt('Starting carousel.  Click toolbar button again to stop.\n\nPlease enter wait interval in ms, or leave empty to use the default (' + ns.defaultWaitMs + ' ms)');

      parsed = parseInt(entry, 10);
      ms = parsed > 0 ? parsed : ns.defaultWaitMs;

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
