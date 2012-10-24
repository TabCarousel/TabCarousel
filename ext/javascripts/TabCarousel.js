/**
 * TabCarousel - a Chrome extension to cycle through tabs.
 * Copyright (C) 2011-2012 Benjamin Oakes
 * 
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

// Namespace
var TabCarousel = {};

(function () {
  var Config = Backbone.Model.extend({
    localStorage: new Store('TabCarousel-Configuration'),
    id: 'singleton',

    defaults: {
      // Is this the first time that TabCarousel has been run?
      firstRun: true,
      // Does TabCarousel start when it is loaded?
      automaticStart: false,
      // Interval between switching tabs, in ms.
      flipWait_ms: 15 * 1000,
      // Interval between reloading a tab, in ms.  Let's not kill other people's servers with automated requests. :)
      reloadWait_ms: 5 * 60 * 1000
    },

    initialize: function () {
      // If the model is changed, save immediately
      //
      // See also: http://stackoverflow.com/questions/7461216/how-can-i-bind-this-save-to-a-backbone-js-model-change-event
      this.on('change', this.save);
    }
  });

  var config = new Config();
  // Make sure we have the data from `localStorage`
  config.fetch();

  // These are some temporary shims while moving to Backbone.js
  // 
  // Start shim.
  this.defaults = config.defaults;
  var ns = this;
  // End shim.
  
  /** English-language tutorial text for first run. */
  ns.tutorialText = [
    'First-Use Tutorial',
    '',
    'TabCarousel is simple:  open tabs you want to monitor throughout the day, then click the toolbar icon.  To stop, click the icon again.',
    '',
    'By default, TabCarousel will flip through your tabs every ' + String(ns.defaults.flipWait_ms / 1000) + ' s, reloading them every ' + String(ns.defaults.reloadWait_ms / 1000 / 60) + " min.  It's great on a unused display or TV.  Put Chrome in full-screen mode (F11, or cmd-shift-f on the Mac) and let it go.",
    '',
    'If you want to change how often TabCarousel flips through your tabs, right click on the toolbar icon and choose "Options".'
  ].join('\n');

  /**
   * Keep track of the last time a tab was refreshed so we can wait at least 5 minutes betweent refreshes.
   */
  ns.lastReloads_ms = {};

  /**
   * Reload the given tab, if it has been more than ns.reloadWait_ms ago since it's last been reloaded.
   * @function
   */
  ns.reload = function (tabId) {
    var now_ms = Date.now(),
      lastReload_ms = ns.lastReloads_ms[tabId];
    
    if (!lastReload_ms || (now_ms - lastReload_ms >= ns.defaults.reloadWait_ms)) {
      // If a tab fails reloading, the host shows up as chrome://chromewebdata/
      // Protocol chrome:// URLs can't be reloaded through script injection, but you can simulate a reload using tabs.update.
      chrome.tabs.get(tabId, function (t) { chrome.tabs.update(tabId, {url: t.url}) });
      ns.lastReloads_ms[tabId] = now_ms;
    }
  };

  /**
   * Select the given tab count, mod the number of tabs currently open.
   * @function
   * @seealso http://code.google.com/chrome/extensions/tabs.html
   * @seealso http://code.google.com/chrome/extensions/content_scripts.html#pi
   */
  ns.select = function (windowId, count) {
    chrome.tabs.getAllInWindow(windowId, function (tabs) {
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
    var continuation,
      count = 0,
      windowId; // window in which Carousel was started

    if (!ms) { ms = config.get('flipWait_ms'); }
    chrome.windows.getCurrent(function (w) { windowId = w.id; });

    chrome.browserAction.setIcon({path: 'images/icon_32_exp_1.75_stop_emblem.png'});
    chrome.browserAction.setTitle({title: 'Stop Carousel'});

    continuation = function () {
      ns.select(windowId, count);
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
    chrome.browserAction.setIcon({path: 'images/icon_32.png'});
    chrome.browserAction.setTitle({title: 'Start Carousel'});
  };

  /**
   * Display the first-run tutorial.
   * @function
   */
  ns.tutorial = function () {
    alert(ns.tutorialText);
    config.set('firstRun', false);
  };

  /**
   * Chrome browser action (toolbar button) click handler.
   * @function
   */
  ns.click = function () {
    var entry, ms, parsed;

    if (config.get('firstRun')) { ns.tutorial(); }

    if (!ns.running()) {
      ns.start();
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
    chrome.browserAction.setTitle({title: 'Start Carousel'});

    if (config.get('automaticStart')) { ns.start(); }
  };

  /**
   * @constructor
   */
  ns.OptionsController = function (form) {
    this.form = form;
    this.form.flipWait_ms.value = config.get('flipWait_ms');
    this.form.automaticStart.checked = config.get('automaticStart');
    this.form.onsubmit = this.onsubmit;
  };

  ns.OptionsController.prototype = {
    /**
     * Save callback for Options form.  Keep in mind "this" is the form, not the controller.
     * @function
     */
    onsubmit: function (e) {
      var $this = $(this)

      $this.find('.alert').hide();

      config.set('flipWait_ms', this.flipWait_ms.value);
      config.set('automaticStart', this.automaticStart.checked);

      $this.find('.alert-success').show();

      return false;
    }
  };
}.call(TabCarousel));

(function () {
  // Hide the parent element.  Useful for "close" buttons.
  //
  // Unlike the built-in behavior for Bootstrap close buttons, this does **not** delete the content; it just hides it.
  function hideParent() {
    $(this).parent().hide();
  }

  this.components = {
    init: function () {
      $('.close.hide-parent').click(hideParent);
    }
  };
}.call(TabCarousel));
