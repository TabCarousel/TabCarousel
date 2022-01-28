###
TabCarousel
===========

A Chrome extension to automatically cycle through tabs.

Licensed under the GPL v2.  Source code is available at https://github.com/benjaminoakes/TabCarousel

@seealso http://code.google.com/chrome/extensions/background_pages.html
@author Benjamin Oakes <hello@benjaminoakes.com>, @benjaminoakes
###
'use strict'

if require?
  localStorage = require('localStorage')
else
  localStorage = window.localStorage

TabCarousel = {}
root = exports ? this
root.TabCarousel = TabCarousel
ns = TabCarousel
  
class Options
  # Accessor for first run timestamp.
  firstRun: (value) ->
    if value
      localStorage.firstRun = value
    else
      !localStorage.firstRun
  
  # Accessor for user set flip wait timing or the default.
  flipWait_ms: (ms) ->
    if ms
      localStorage.flipWait_ms = ms
    else
      localStorage.flipWait_ms || Options.defaults.flipWait_ms
  
  # Accessor for user set automatic start preference.
  automaticStart: (value) ->
    if 1 == arguments.length
      localStorage.automaticStart = !!value
    else
      if localStorage.automaticStart
        JSON.parse(localStorage.automaticStart)

    # Accessor for user set disable refresh preference.
  automaticStart: (value) ->
    if 1 == arguments.length
      localStorage.disableReload = !!value
    else
      if localStorage.disableReload
        JSON.parse(localStorage.disableReload)

# @constant
Options.defaults =
  # Interval between tabs, in ms.
  flipWait_ms: 15 * 1000,
  # Interval between reloading a tab, in ms.  Let's not kill other people's servers with automated requests.
  reloadWait_ms: 5 * 60 * 1000

root.Options = Options
options = new Options

class OptionsController
  constructor: (form) ->
    @form = form
    @form.flipWait_ms.value = options.flipWait_ms()
    @form.automaticStart.checked = options.automaticStart()
    @form.disableReload.checked = options.disableReload()
    @form.onsubmit = @onsubmit

  # Save callback for Options form.  Keep in mind "this" is the form, not the controller.
  onsubmit: ->
    status = document.getElementById('status')
    status.innerHTML = ''

    options.flipWait_ms(@flipWait_ms.value)
    options.automaticStart(@automaticStart.value)
    options.disableReload(@disableReload.value)

    # So the user sees a blink when saving values multiple times without leaving the page.
    setTimeout(->
      status.innerHTML = 'Saved'
      status.style.color = 'green'
    , 100)

    false

ns.OptionsController = OptionsController

class Carousel
  constructor: ->
    # Keep track of the last time a tab was refreshed so we can wait at least 5 minutes betweent refreshes.
    @lastReloads_ms = {}
  
  # Reload the given tab, if it has been more than reloadWait_ms ago since it's last been reloaded.
  reload: (tabId) ->
    now_ms = Date.now()
    lastReload_ms = @lastReloads_ms[tabId]
  
    if !lastReload_ms || (now_ms - lastReload_ms >= Options.defaults.reloadWait_ms)
      # If a tab fails reloading, the host shows up as chrome://chromewebdata/
      # Protocol chrome:// URLs can't be reloaded through script injection, but you can simulate a reload using tabs.update.
      chrome.tabs.get tabId, (t) =>
        chrome.tabs.update(tabId, url: t.url)
      @lastReloads_ms[tabId] = now_ms
  
  # Select the given tab count, mod the number of tabs currently open.
  #
  # @seealso http://code.google.com/chrome/extensions/tabs.html
  # @seealso http://code.google.com/chrome/extensions/content_scripts.html#pi
  select: (windowId, count) ->
    chrome.tabs.getAllInWindow windowId, (tabs) =>
      tab = tabs[count % tabs.length]
      nextTab = tabs[(count + 1) % tabs.length]
      chrome.tabs.update(tab.id, selected: true)
      if options.disableReload()
        @reload(nextTab.id)
  
  # Put the carousel into motion.
  start: (ms) ->
    count = 0
    windowId = undefined # window in which TabCarousel was started
  
    unless ms
      ms = options.flipWait_ms()
  
    chrome.windows.getCurrent (w) =>
      windowId = w.id
  
    chrome.browserAction.setIcon(path: 'images/icon_32_exp_1.75_stop_emblem.png')
    chrome.browserAction.setTitle(title: 'Stop Carousel')
  
    continuation = () =>
      @select(windowId, count)
      count += 1
      @lastTimeout = setTimeout(continuation, ms)
  
    continuation()
  
  # Is the carousel in motion?
  running: () ->
    !!@lastTimeout
  
  # Stop the carousel.
  stop: () ->
    clearTimeout(@lastTimeout)
    @lastTimeout = undefined
    chrome.browserAction.setIcon(path: 'images/icon_32.png')
    chrome.browserAction.setTitle(title: 'Start Carousel')

carousel = new Carousel

class BackgroundController
  # English-language tutorial text for first run.
  # @constant
  tutorialText:
    """
    First-Use Tutorial
  
    TabCarousel is simple:  open tabs you want to monitor throughout the day, then click the toolbar icon.  To stop, click the icon again.
  
    By default, TabCarousel will flip through your tabs every #{String(Options.defaults.flipWait_ms / 1000)} s, reloading them every #{String(Options.defaults.reloadWait_ms / 1000 / 60)} min.  It's great on a unused display or TV.  Put Chrome in full-screen mode (F11, or cmd-shift-f on the Mac) and let it go.
  
    If you want to change how often TabCarousel flips through your tabs, right click on the toolbar icon and choose "Options".
    """
  
  # Display the first-run tutorial.
  tutorial: () ->
    window.alert(@tutorialText)
    options.firstRun(Date.now())
  
  # Chrome browser action (toolbar button) click handler.
  click: () =>
    if options.firstRun()
      @tutorial()
  
    if !carousel.running()
      carousel.start()
    else
      carousel.stop()
  
  # Background page onLoad handler.
  load: () ->
    chrome.browserAction.onClicked.addListener(@click)
    chrome.browserAction.setTitle(title: 'Start Carousel')
  
    if options.automaticStart()
      carousel.start()

ns.BackgroundController = BackgroundController
