{% extends "basex.html" %}
{% load markup %}
{% block pageid %}code{% endblock %}
{% block title %}SVG and Canvas Support Status in Various Browsers.{% endblock %}
{% block headers %}
<link href="doc.css" media="screen" rel="stylesheet" type="text/css" />
{% endblock %}


{% block content %}
<div class="page doc">
{% filter markdown %}
State of SVG and Canvas in Modern Browsers
==========================================

__By: Alastair Tse - Last Updated: 27 April 2006__


My friends, just like HTML and CSS, different browsers support
different subsections of the SVG and Canvas specification. As part of
my work on PlotKit, the next generation javascript plotting library,
I've decided to summarise all the quirks in SVG and Canvas support.

Browsers Considered
===================

I am looking at browsers that are considered "modern" as of
March 2006. These include:

* [Safari 2.0.x][Safari] (W/ [Adobe SVG Plugin][ASV])
* [Firefox 1.5.x][Firefox]
* [Opera 9.0 Preview 2][OperaSnapshot]
* [Internet Explorer 6][IE6] (w/ [Adobe SVG Plugin][ASV])

I am also looking at some experiemental browsers as of March 2006. 

* [Internet Explorer 7 beta 2 preview + ASV][IE7]
* [Safari WebKit+SVG Nightly 2006-03-11][WebkitNightly]
* [Firefox Deerpark Nightly 2006-03-11][FirefoxNightly]

[Safari]: http://apple.com/safari/
[Firefox]: http://www.mozilla.com/firefox/
[OperaSnapshot]: http://snapshot.opera.com/
[IE6]: http://www.microsoft.com/windows/ie/
[ASV]: http://www.adobe.com/svg/
[IE7]: http://www.microsoft.com/windows/IE/ie7/default.mspx
[WebkitNightly]: http://nightly.webkit.org/
[FirefoxNightly]: http://ftp.mozilla.org/pub/mozilla.org/firefox/nightly/latest-trunk/


Canvas
======

* Canvas is defined by the WHATWG in what is known as the 
  [Web Applications 1.0 specification][WHATWG]

Supporting Browsers
-------------------

* Safari 2.0 and above.
* Opera 9.0 and above.
* Firefox 1.5 and above.

Quirks
------

* __Safari__ will forget a path after ``fill()`` or ``stroke()`` has
    been called. Therefore, if you need to fill and stroke the same
    path, you must draw the path out twice.

* __Opera__ will not obey ``stroke()`` for arc paths.

* __Firefox__ and __Opera__ will not draw shadows even with
  ``shadowStyle`` or ``shadowOffset`` is set on the context object.

SVG
===

* SVG support is either provided natively, or through the Adobe SVG
  Viewer (ASV).

Supporting Browsers (Inline)
----------------------------

* Safari 2.0 + ASV
* Internet Explorer 6 + ASV
* Safari Webkit+SVG Nightly
* Opera 9.0 and above
* Mozilla Firefox 1.5 and above

Quirks (Inline)
---------------

* __Safari Nightly__ will not render any ``text`` elements when
  inlined. (Will do so if using ``embed``)

* __Safari 2.0 + ASV__ will not respect inlined SVG.

* __Internet Explorer 6 + ASV__ will only parse inlined SVG if the
  following is added to the HTML and all SVG elements are in the
  correct namespace ``svg:``.

    <html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"
    xmlns:svg="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink">
    ...
    <body>
    <!-- START Required for IE to support  inlined SVG -->
    <object id="AdobeSVG"
    classid="clsid:78156a80-c6a1-4bbf-8e6a-3cd390eeb4e2" width="1"
    height="1"></object>
    <?import namespace="svg" implementation="#AdobeSVG"?>
    <!-- END   Required for IE to support inlined SVG -->
    <svg:svg width="300" height="300" baseProfile="full" version="1.1"></svg:svg>
    </body>
    </html>

* __Mozilla Firefox (1.5 and nightly) on Mac__ will not render
  ``text`` elements when inlined. Note that it does for Linux and Windows.

* __Opera 9__ will refuse to draw an element if attribute ``filter``
  is defined.

* __Internet Explorer 7b2p + ASV__ will not work with the Adobe SVG Viewer.


Disclaimer
==========

The above is presented as-is with my own findings. There may be
errors. Please do not use this to base your multi-million dollar
business decisions.

Contact
=======

If you have anything to add or modify, please contact me at
<alastair@liquidx.net>.

[WHATWG]: http://whatwg.org/specs/web-apps/current-work/

{% endfilter %}
</div>
{% endblock %}