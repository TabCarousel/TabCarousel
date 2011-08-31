Contributing
============

Wow, you want to contribute?  That's awesome!  Thanks!

To make things easier on you, I've compiled some notes and guidelines.

Notes
-----

* This is a Chrome extension.  This is a tutorial if you're unfamiliar:  http://code.google.com/chrome/extensions/getstarted.html

To install the code from GitHub, you'll have to install the unpacked extension:

* git clone this repo or your fork
* Open [chrome://extensions][ext] in your browser
* Hit the "+" button on Developer Mode (on the right side of the page)
* Choose "Load unpacked extension..." and browse for the extracted files.

If it installed correctly, you'll see a new toolbar button.

Autoupdating is controlled by updates.xml when uploaded to the location that manifest.json checks.  See also: http://code.google.com/chrome/extensions/autoupdate.html

This was originally written on Chrome 12.0.742.100 on Mac OS X 10.6.4.

  [ext]: chrome://extensions

Guidelines
----------

* Looking for something to do?  Anything in the TODO file is a good place to start.

Note on Patches/Pull Requests
-----------------------------
 
* Fork the project.
* Make your feature addition or bug fix.
* Please add tests for it using Jasmine. This is important so I don't break it in a future version unintentionally.
* Commit, do not mess with version, or history.  (if you want to have your own version, that is fine but bump version in a commit by itself I can ignore when I pull)
* Send me a pull request. Bonus points for topic branches.
