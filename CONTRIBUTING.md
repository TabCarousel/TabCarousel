Contributing
============

Wow, you want to contribute?  That's awesome!  Thanks!

To make things easier on you, I've compiled some notes and guidelines.

Misc Notes
----------

* This was originally written on Chrome 12.0.742.100 on Mac OS X 10.6.4.
* This is a Chrome extension.  This is a tutorial if you're unfamiliar:  http://code.google.com/chrome/extensions/getstarted.html
* TabCarousel is currently a labor of love.  I originally made it because I thought it would be useful, but I also use it as a vehicle to try out new technologies.  For example:
    * Getting experience with making Chrome extensions
    * Getting experience with Jasmine (outside of the normal browser workflow)
    * Getting experience with CoffeeScript (largely abandoned -- I find it easier to use, but not significantly enough to justify it turning away contributors)
    * Getting experience with Bootstrap
    * Getting experience with Backbone
    * More in the future...

Installing
----------

To install the unreleased code from GitHub, you'll have to install the unpacked extension:

* git clone this repo or your fork
* Open chrome://extensions in your browser
* Hit the "+" button on Developer Mode (on the right side of the page)
* Choose "Load unpacked extension..." and browse for the extracted files.

If it installed correctly, you'll see a new toolbar button.  In most circumstances, you can edit unpacked extension and see your changes take effect, but some changes (such as changing the manifest.json file) aren't reloaded.

Guidelines
----------

* Looking for something to do?  Acknowledged [issues][iss] are a good place to start.
* Fixing bugs you've found or adding features is also greatly appreciated!

  [iss]: https://github.com/benjaminoakes/TabCarousel/issues

Patches/Pull Requests
---------------------
 
* Fork the project.
* Make your feature addition or bug fix.
* Please add tests for it using Jasmine. This is important so I don't break it in a future version unintentionally.
* Commit, do not mess with version, or history.  (if you want to have your own version, that is fine but bump version in a commit by itself I can ignore when I pull)
* Send me a pull request. Bonus points for topic branches.

Additional Documentation
------------------------

- [Maintainer Documentation](https://github.com/TabCarousel/TabCarousel/wiki/Maintainer-Documentation)
