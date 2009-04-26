---
title: PlotKit
layout: default
---

PlotKit
=======

Introduction
------------
PlotKit is a Chart and Graph Plotting Library for
Javascript. It has support for HTML Canvas and also SVG via Adobe
SVG Viewer and native browser support.

PlotKit is [fully documented](doc/PlotKit.html)
and there is a [quick tutorial](doc/PlotKit.QuickStart.html)
to get you started.

PlotKit is a complete rewrite of CanvasGraph. It is better structured
and supported. 


Requirements
------------

* [MochiKit 1.3 or higher](http://www.mochikit.com/)
* HTML Canvas: Safari 2+, Opera 9+, Firefox 1.5+, IE 6 (in emulated mode)
* SVG: Opera 9+, Firefox 1.5+ (see note), IE6 with Adobe SVG.

Note: Firefox 1.5+ on Linux and Windows is supported. Firefox 1.5+ on
Mac does not draw labels in SVG, so you must set <code>axisLabelUseDiv</code>
to <code>true</code> if you want to have maximum compatibility.


Licenses
--------

* PlotKit is copyright (c) 2006 Alastair Tse. Licensed under the BSD License.
* [excanvas.js](http://sourceforge.net/projects/excanvas/) is copyright (c) 2006 Google Inc.
  Licensed under the Apache License.


Get/Download
------------

* [Download the latest version from GitHub](http://github.com/ept/plotkit/zipball/master)
* *Older Versions:*
  * [0.9.1 (29 August 2006)](http://media.liquidx.net/static/plotkit/plotkit-0.9.1.zip)
  * [0.9 (14 June 2006)](http://media.liquidx.net/static/plotkit/plotkit-0.9.zip)
  * [0.8 (21 March 2006)](http://media.liquidx.net/static/plotkit/plotkit-0.8.zip)
  * For changes in older versions, look in the [PlotKit Documentation](doc/PlotKit.html).


Documentation
-------------

* [PlotKit Documentation](doc/PlotKit.html) - Complete documentation
* [PlotKit Quick Start](doc/PlotKit.QuickStart.html)


Development
-----------

* [PlotKit Mailing List](http://groups.google.com/group/plotkit/) - *Ask questions here.*
* [PlotKit Source Code](http://github.com/ept/plotkit) - GitHub repository
* [PlotKit Source Code](http://code.google.com/p/plotkit/source) - Old SVN repository
* [PlotKit Wiki](http://code.google.com/p/plotkit/) - If you have notes to contribute, here is the place.

* [SVG/Canvas Browser Status](doc/SVGCanvasCompat.html) - A summary on
  SVG and HTML Canvas support in various browsers.


Examples
--------

* [PlotKit Dynamic Charting Test](tests/dynamic.html) - Redrawing values from a dynamic table.
* [PlotKit Simple Canvas Demo](tests/quickstart.html) -
  A self contained demo in a single file. *Use this to get started!*
* [PlotKit Simple SVG Demo](tests/quickstart-svg.html) -
  A self contained demo in a single file. *Use this to get started!*
* [Sweet Canvas Test](tests/sweet.html)
* [Sweet SVG Test](tests/svg-sweet.html)
* [Simple Canvas Test](tests/basic.html)
* [Simple SVG Test](tests/svg.html)


About
-----

PlotKit was created by [Alastair Tse](http://al.tse.id.au) -
<a href="&#109;&#97;&#105;&#108;&#116;&#111;&#58;&#97;&#108;&#97;&#115;&#116;&#97;&#105;&#114;&#64;&#108;&#105;&#113;&#117;&#105;&#100;&#120;&#46;&#110;&#101;&#116;">&#97;&#108;&#97;&#115;&#116;&#97;&#105;&#114;&#64;&#108;&#105;&#113;&#117;&#105;&#100;&#120;&#46;&#110;&#101;&#116;</a>
and extended by [Martin Kleppmann](http://www.yes-no-cancel.co.uk)
