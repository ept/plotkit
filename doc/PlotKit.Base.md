{% extends "basex.html" %}
{% load markup %}
{% block pageid %}code{% endblock %}
{% block headers %}
<link href="doc.css" media="screen" rel="stylesheet" type="text/css" />
{% endblock %}
{% block title %}PlotKit.Base{% endblock %}

{% block content %}
<div class="page doc api">
{% filter markdown %}
[PlotKit Home](PlotKit.html) | [>>](PlotKit.Layout.html)

PlotKit Base
============

PlotKit Base contains a number of simple functions that are needed for the rest of the PlotKit libraries.

PlotKit.Base Functions
----------------------

* ``collapse()``
 
   Given an array, it will collapse all the values from the passed array into one big array.

 ``[[1,2], [3,4], [5,6]] --> [1, 2, 3, 4, 5, 6]``

* ``findPosX(element)``

  Returns the X value of the element relative to the document in a browser independent way.

* ``findPosY(element)``

  Returns the Y value of the element relative to the document in a browser independent way.

* ``palette(baseColor, fromLevel = -0.2, toLevel = 0.2, increment = 0.1)``

  Takes in a base colour and generates a palette of colours based on the intensive levels.

* ``roundInterval(value, precision)``
 
  Rounds a number to a specified precision. __TODO: make more robust__

* ``uniq(array)``

  Acts like the UNIX uniq, takes a sorted array and returns a new array that only contains uniq elements.
  
* ``isFuncLike(obj)`` (PlotKit 0.9+)

  Returns true if it is of type ``function``.

* ``usingPrototype()``  (PlotKit 0.9+)

  Checks whether the javascript runtime is polluted by prototype.js
  
* ``items(lst)``  (PlotKit 0.9+)

  A version of ``MochiKit.Base.items()`` that is aware of prototype.js

* ``keys(lst)``  (PlotKit 0.9+)

  A version of ``MochiKit.Base.keys()`` that is aware of prototype.js

* ``map(fn, lst)``  (PlotKit 0.9+)

  A version of ``MochiKit.Base.map()`` that is aware of prototype.js

Preset Styles
=============

Color Schemes
-------------

There are some colour schemes, which are an array of
MochiKit.Color.Colors.

* ``colorScheme()``

A default colour scheme that consists of red, orange, yellow, green, cyan, blue, purple and magenta.

* ``baseDarkPrimaryColors()``

A set of five dark colours.

* ``basePrimaryColors()``

A set of five bright primary colours.

* ``baseBlueColors()``

Three colour set that have a nice professional blue hue.

Office Style
------------

These are base styles that were inspired by charts in Office 12. The
color schemes are fairly similar to those found in screenshots of
charts available online.

* ``officeBaseStyle``

  Contains the basic style independent of colours.

* ``officeBlue()``

  Blue colors: ![bluecolors](blue.png)

* ``officeRed()``

  Red colors: ![redcolors](red.png)

* ``officeGreen()``

  Green colors: ![greencolors](green.png)

* ``officePurple()``

  Purple colors: ![purplecolors](purple.png)

* ``officeCyan()``

  Cyan colors: ![cyancolors](cyan.png)

* ``officeOrange()``

  Orange colors: ![orangecolors](orange.png)

* ``officeBlack()``

  Black colors: ![blackcolors](black.png)

Usage
-----

  ``var layout = PlotKit.Layout("bar", officeOrange());``

{% endfilter %}
</div>
{% endblock %}