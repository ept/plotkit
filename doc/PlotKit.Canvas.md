{% extends "basex.html" %}
{% load markup %}
{% block pageid %}code{% endblock %}
{% block headers %}
<link href="doc.css" media="screen" rel="stylesheet" type="text/css" />
{% endblock %}
{% block title %}PlotKit.Canvas{% endblock %}

{% block content %}
<div class="page doc api">
{% filter markdown %}
[PlotKit Home](PlotKit.html) | [<<](PlotKit.Renderer.html) | [>>](PlotKit.SVG.html)

PlotKit Canvas
==============

This contains the CanvasRenderer, the default renderer and most well supported one used in PlotKit.

It supports Safari 2, Firefox 1.5, Opera 9 and IE 6. Note that for IE6
support, you will need iecanvas.htc which is included with PlotKit. 

Please see the [Canvas/SVG Browser Support Status][Browser] for bugs
with the Canvas implementation on different browsers.

PlotKit Canvas Extra Options
----------------------------

In addition to the options outlined in [PlotKit.Renderer][], here are additional options that the CanvasRenderer supports.

<table>
  <thead>
	<tr><td>Option name</td><td>Description</td><td>Type</td><td>Default</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>IECanvasHTC</th>
		<td>Path relative to the HTML document of the iecanvas.htc file.</td>
		<td>string</td>
		<td>iecanvas.htc</td>
	</tr>
	</tbody>
</table>

PlotKit Canvas Example
----------------------

	var options = {
		"drawsBackground": true,
		"drawYAxis": false,
		"IECanvasHTC": "contrib/iecanvas.htc"
	};

	var layout = new Layout("bar", {});
	layout.addDataset("squares", [[0, 0], [1, 1], [2, 4], [3, 9], [4, 16]]);
	layout.evaluate()
	var renderer = new CanvasRenderer($('canvas'), layout, options);
	layout.render();

PlotKit Canvas Events/Signals
-----------------------------

There is preliminary support for events in the CanvasRenderer. If ``enableEvents`` is set ``true`` in the options, you can hook into the ``onmousemove``, ``onclick``, ``onmouseover`` and ``onmouseout`` events via the MochiKit.Signal.connect. Note that you must have included MochiKit/Signal.js before instantiating the CanvasRenderer

PlotKit Canvas Notes
--------------------

### IE Support

IE Support is done thanks to webfx's great iecanvas.htc which emulates
part of the WHATWG canvas specification. Note that alpha values and
clear() does not work in IE.

Remember that iecanvas.htc __must__ reside on the same domain as the
HTML page itself.

[PlotKit.Renderer]: PlotKit.Renderer.html
[Browser]: SVGCanvasCompat.html

{% endfilter %}
</div>
{% endblock %}