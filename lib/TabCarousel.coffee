'use strict'

if require?
  localStorage = require('localStorage')
else
  localStorage = this.localStorage

# @namespace
carousel = {}
root = exports ? this
root.carousel = carousel

# Chrome extension to automatically cycle through tabs.
# 
# @seealso http://code.google.com/chrome/extensions/background_pages.html
# @author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
ns = carousel

# @constant
ns.defaults =
  # Interval between tabs, in ms.
  flipWait_ms: 15 * 1000,
  # Interval between reloading a tab, in ms.  Let's not kill other people's servers with automated requests.
  reloadWait_ms: 5 * 60 * 1000

# English-language tutorial text for first run.
# @constant
ns.tutorialText =
  """
  First-Use Tutorial

  TabCarousel is simple:  open tabs you want to monitor throughout the day, then click the toolbar icon.  To stop, click the icon again.

  By default, TabCarousel will flip through your tabs every #{String(ns.defaults.flipWait_ms / 1000)} s, reloading them every #{String(ns.defaults.reloadWait_ms / 1000 / 60)} min.  It's great on a unused display or TV.  Put Chrome in full-screen mode (F11, or cmd-shift-f on the Mac) and let it go.

  If you want to change how often TabCarousel flips through your tabs, right click on the toolbar icon and choose "Options".
  """

# Keep track of the last time a tab was refreshed so we can wait at least 5 minutes betweent refreshes.
ns.lastReloads_ms = {}

# Reload the given tab, if it has been more than ns.reloadWait_ms ago since it's last been reloaded.
# @function
ns.reload = (tabId) ->
  now_ms = Date.now()
  lastReload_ms = ns.lastReloads_ms[tabId]

  if !lastReload_ms || (now_ms - lastReload_ms >= ns.defaults.reloadWait_ms)
    # If a tab fails reloading, the host shows up as chrome://chromewebdata/
    # Protocol chrome:// URLs can't be reloaded through script injection, but you can simulate a reload using tabs.update.
    chrome.tabs.get tabId, (t) ->
      chrome.tabs.update(tabId, url: t.url)
    ns.lastReloads_ms[tabId] = now_ms

# Select the given tab count, mod the number of tabs currently open.
#
# @function
# @seealso http://code.google.com/chrome/extensions/tabs.html
# @seealso http://code.google.com/chrome/extensions/content_scripts.html#pi
ns.select = (windowId, count) ->
  chrome.tabs.getAllInWindow windowId, (tabs) ->
    tab = tabs[count % tabs.length]
    nextTab = tabs[(count + 1) % tabs.length]
    chrome.tabs.update(tab.id, selected: true)
    ns.reload(nextTab.id)

# Put the carousel into motion.
# @function
ns.start = (ms) ->
  continuation
  count = 0
  windowId # window in which Carousel was started

  unless ms
    ms = ns.flipWait_ms()

  chrome.windows.getCurrent (w) ->
    windowId = w.id

  chrome.browserAction.setIcon(path: 'images/icon_32_exp_1.75_stop_emblem.png')
  chrome.browserAction.setTitle(title: 'Stop Carousel')

  continuation = () ->
    ns.select(windowId, count)
    count += 1
    ns.lastTimeout = setTimeout(continuation, ms)

  continuation()

# Is the carousel in motion?
# @function
ns.running = () ->
  !!ns.lastTimeout

# Stop the carousel.
# @function
ns.stop = () ->
  clearTimeout(ns.lastTimeout)
  ns.lastTimeout = undefined
  chrome.browserAction.setIcon(path: 'images/icon_32.png')
  chrome.browserAction.setTitle(title: 'Start Carousel')

# Accessor for first run timestamp.
# @function
ns.firstRun = (value) ->
  if value
    localStorage.firstRun = value
  else
    !localStorage.firstRun

# Accessor for user set flip wait timing or the default.
# @function
ns.flipWait_ms = (ms) ->
  if ms
    localStorage.flipWait_ms = ms
  else
    localStorage.flipWait_ms || ns.defaults.flipWait_ms

# Accessor for user set automatic start preference.
# @function
ns.automaticStart = (value) ->
  if 1 == arguments.length
    localStorage.automaticStart = !!value
  else
    if localStorage.automaticStart
      JSON.parse(localStorage.automaticStart)

# Display the first-run tutorial.
# @function
ns.tutorial = () ->
  window.alert(ns.tutorialText)
  ns.firstRun(Date.now())

# Chrome browser action (toolbar button) click handler.
# @function
ns.click = () ->
  if ns.firstRun()
    ns.tutorial()

  if !ns.running()
    ns.start()
  else
    ns.stop()

# Background page onLoad handler.
# @function
ns.load = () ->
  chrome.browserAction.onClicked.addListener(ns.click)
  chrome.browserAction.setTitle(title: 'Start Carousel')

  if ns.automaticStart()
    ns.start()

# @constructor
ns.OptionsController = (form) ->
  this.form = form
  this.form.flipWait_ms.value = ns.flipWait_ms()
  this.form.automaticStart.checked = ns.automaticStart()
  this.form.onsubmit = this.onsubmit

ns.OptionsController.prototype =
  # Save callback for Options form.  Keep in mind "this" is the form, not the controller.
  # @method
  onsubmit: ->
    status = document.getElementById('status')
    status.innerHTML = ''

    ns.flipWait_ms(this.flipWait_ms.value)
    ns.automaticStart(this.automaticStart.value)

    # So the user sees a blink when saving values multiple times without leaving the page.
    setTimeout(->
      status.innerHTML = 'Saved'
      status.style.color = 'green'
    , 100)

    false
