###
TabCarousel
===========

A Chrome extension to automatically cycle through tabs.

Implementation plan:
--------------------

Options

* defaults
* firstRun
* flipWait_ms
* automaticStart

OptionsController

* constructor
* onsubmit

Carousel

* lastReloads_ms
* reload
* select
* start
* running
* stop

BackgroundController

* tutorialText
* tutorial
* click
* load

@seealso http://code.google.com/chrome/extensions/background_pages.html
@author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
###
'use strict'

if require?
  localStorage = require('localStorage')
else
  localStorage = window.localStorage

# @namespace
TabCarousel = {}
root = exports ? this
root.TabCarousel = TabCarousel
ns = TabCarousel

# @constant
ns.defaults =
  # Interval between tabs, in ms.
  flipWait_ms: 15 * 1000,
  # Interval between reloading a tab, in ms.  Let's not kill other people's servers with automated requests.
  reloadWait_ms: 5 * 60 * 1000

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

class OptionsController
  constructor: (form) ->
    @form = form
    @form.flipWait_ms.value = ns.flipWait_ms()
    @form.automaticStart.checked = ns.automaticStart()
    @form.onsubmit = @onsubmit

  # Save callback for Options form.  Keep in mind "this" is the form, not the controller.
  onsubmit: ->
    status = document.getElementById('status')
    status.innerHTML = ''

    ns.flipWait_ms(@flipWait_ms.value)
    ns.automaticStart(@automaticStart.value)

    # So the user sees a blink when saving values multiple times without leaving the page.
    setTimeout(->
      status.innerHTML = 'Saved'
      status.style.color = 'green'
    , 100)

    false

ns.OptionsController = OptionsController

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
  count = 0
  windowId = undefined # window in which TabCarousel was started

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

# English-language tutorial text for first run.
# @constant
ns.tutorialText =
  """
  First-Use Tutorial

  TabCarousel is simple:  open tabs you want to monitor throughout the day, then click the toolbar icon.  To stop, click the icon again.

  By default, TabCarousel will flip through your tabs every #{String(ns.defaults.flipWait_ms / 1000)} s, reloading them every #{String(ns.defaults.reloadWait_ms / 1000 / 60)} min.  It's great on a unused display or TV.  Put Chrome in full-screen mode (F11, or cmd-shift-f on the Mac) and let it go.

  If you want to change how often TabCarousel flips through your tabs, right click on the toolbar icon and choose "Options".
  """

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
