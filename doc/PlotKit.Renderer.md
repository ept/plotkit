{% extends "basex.html" %}
{% load markup %}
{% block pageid %}code{% endblock %}
{% block headers %}
<link href="doc.css" media="screen" rel="stylesheet" type="text/css" />
{% endblock %}
{% block title %}PlotKit.Renderer{% endblock %}

{% block content %}
<div class="page doc api">
{% filter markdown %}
[PlotKit Home](PlotKit.html) | [<<](PlotKit.Layout.html) | [>>](PlotKit.Canvas.html)

PlotKit Renderer
================

A Renderer is responsible for translating the layout calculated by PlotKit.Layout and draw it on to a HTML Canvas, SVG object or any other way. One way to use the renderer is to allow theming of graphs by tweaking the layout. 

PlotKit includes some common basic renderers, so you do not need to customise anything if you just plan to change the spacing, colors, fonts, or layout.

PlotKit Renderers should follow an informal protocol to allow users to plug and play different renderers. Below is the informal protocol:

PlotKit Renderer Protocol
-------------------------
* Constructor: ``new Renderer(element, layout, options = {})``

  ``element`` is the element which this renderer will perform on, ``layout`` is the PlotKit.Layout object and ``options`` is an associative dictionary described below.

* class function: ``isSupported()``

  Optional check that returns ``true`` if the renderer is supported in the current browser.

* object method: ``render()``

  Renders to canvas, can be called multiple times, but ``clear()`` must be called between invokations.

* object method: ``clear()``

  Clear the canvas.

PlotKit Renderer Options
------------------------
To allow some basic flexibility of the output, a renderer should
accept and act on the following options passed in the constructor. 


<table cellpadding="0" cellspacing="0">
  <thead>
	<tr><td>Option name</td><td>Description</td><td>Type</td><td>Default</td></tr>
  </thead>
  <tbody>
	<tr>
		<th>backgroundColor</th>
		<td>color to use for background</td>
		<td>MochiKit.Color.Color</td>
		<td>Color.whiteColor()</td>
	</tr>
	<tr>
		<th>colorScheme</th>
		<td>Color scheme used</td>
		<td>Array of MochiKit.Color.Color</td>
		<td>output of PlotKit.Base.colorScheme()</td>
	</tr>
	<tr>
		<th>strokeColor</th>
		<td>Color used stroking. If set to null, the renderer will
  attempt to use strokeColorTransform</td>
		<td>MochiKit.Color.Color or null</td>
		<td>null</td>
	</tr>
	<tr>
		<th>strokeColorTransform</th>
		<td>Name of the method to call to transform Color into stroke color.</td>
		<td>string (name of a function that accepts no arguments)</td>
		<td>"asStrokeColor"</td>
	</tr>
	<tr>
		<th>drawBackground</th>
		<td>Whether the background should be drawn</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
	<tr>
		<th>shouldFill</th>
		<td>Should fill in area under chart</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
	<tr>
		<th>shouldStroke</th>
		<td>Should stroke the borders of shapes in chart</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
	<tr>
		<th>strokeWidth</th>
		<td>Width of stroke used (if shouldStroke is set)</td>
		<td>float</td>
		<td>0.1</td>
	</tr>
	<tr>
		<th>padding</th>
		<td>Padding of the graph drawn (excluding labels)</td>
		<td>Object with properties: top, bottom, left, right.</td>
		<td>{left: 30, right:20, top: 10, bottom: 10}</td>
	</tr>
	<tr>
		<th>drawYAxis</th>
		<td>draw Y Axis</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
	<tr>
		<th>drawXAxis</th>
		<td>draw X Axis</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
	<tr>
		<th>axisLineColor</th>
		<td>Color of axes line.</td>
		<td>MochiKit.Color.Color</td>
		<td>Color.blackColor()</td>
	</tr>
	<tr>
		<th>axisLineWidth</th>
		<td>axis line width</td>
		<td>float</td>
		<td>0.5</td>
	</tr>
	<tr>
		<th>axisTickSize</th>
		<td>length or height of a tick on the y and x axis respectively, in pixels</td>
		<td>float</td>
		<td>3.0</td>
	</tr>
	<tr>
		<th>axisLabelColor</th>
		<td>color of text label on axis.</td>
		<td>MochiKit.Color.Color</td>
		<td>Color.blackColor()</td>
	</tr>
	<tr>
		<th>axisLabelFontSize</th>
		<td>Font size of labels in pixels </td>
		<td>integer</td>
		<td>9</td>
	</tr>
	<tr>
		<th>axisLabelWidth</th>
		<td>Width of labels on ticks, in pixels</td>
		<td>integer</td>
		<td>50</td>
	</tr>
	<tr>
		<th>enableEvents</th>
		<td>Enable events (if supported)</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
</tbody>
</table>

Internal Renderer Methods and Style
===================================

The default renderers that are available follow a rough structure. If
you plan to write a new renderer, you should think about using a
similar structure.

Also, it is important that you follow an Object Orientated style and
split up the rendering methods as much as logically possible to allow
other developers to extend the work by using a "psuedo subclassing"
method described below.

Subclassing
-----------

PlotKit Renderers should adopt a Javascript subclassing structure to
allow developers/themers to customise certain aspects of the
rendering. Here is an example of what is expected:

    MyRenderer = function(element, layout, options) {
        if (arguments.length  > 0)
           this.__init__(element, layout, options);
    };
    
    MyRenderer.prototype.__init__ = function(element, layout, options) {
      ....
    };

In this case, the default javascript constructor acts only when passed
arguments. ``MyRenderer.prototype.__init__`` is the real
constructor. It is named in similar vein to Python's constructor.

For users who would like to subclass, they will need to use the
following snippet of code:

     MyAlternateRenderer = function(element, layout. options) {
       if (arguments.length > 0) 
          this.__init__(element, layout, options);
     };
     MyAlternateRenderer.prototype = new MyRenderer();
     MyAlternateRenderer.prototype.constructor = MyAlternateRenderer;
     MyAlternateRenderer.__super__ = MyRenderer.prototype;

     MyAlternateRenderer.prototype.__init__ = function(element, layout, options) {
         MyAlternateRenderer.__super__.__init__.call(this, element, layout, options);
     };


For subclasses, they will need the following magic in order to
initialise their subclass. But after that, you can either override
``MyAlternateRenderer.prototype.__init__`` with your own
implementation or just leave the superclass to deal with the
constructor. 

A more thorough example can be found in the PlotKit source for
``Canvas.js`` and ``SweetCanvas.js`` respectively.

Internal Renderer Properties
----------------------------

The bundled renderers are have the following common properties to
allow standard access by all subclasses:

* ``this.layout`` 

The PlotKit.Layout object passed by the user.

* ``this.element``

The HTML element to use, either a Canvas Element or SVG Element depending
on whether a Canvas Renderer or SVG Renderer is in use.

* ``this.options``

A dictionary of options that are applicable to the rendering style.

* ``this.xlabels``

A list of elements that represent the axis. Should be cleared whenever
``clear()`` is executed.

* ``this.ylabels``

A list of elements that represent the axis. Should be cleared whenever
``clear()`` is executed.

Internal Renderer Methods
-------------------------

* ``_renderBarChart()``

Renders only the bars of a  bar chart on the element by looking at
``this.layout.bars`` for the bars to render. Will only be called if
``this.layout.style == "bars"``

* ``_renderLineChart()``

Renders only the lines of a  line chart on the element by looking at
``this.layout.points`` for the points to render. Will only be called if
``this.layout.style == "line"``

* ``_renderPieChart()``

Renders only the slices of the pie in ``this.layout.slices``.
Will only be called if ``this.layout.style == "pie"``

* ``_renderBarAxis()``

Renders the axis for a bar chart by looking at the
``this.layout.xticks`` and ``this.layout.yticks``.

* ``_renderLineAxis()``

Renders the axis for a line chart by looking at the
``this.layout.xticks`` and ``this.layout.yticks``.

* ``_renderPieAxis()``

Renders the labels for a pie chart by looking at
``this.layout.xticks`` only.

* ``_renderBackground()``

Called to render the background of the chart. Should check whether
``this.options.drawsBackground`` is set before proceeding.


Events from the Chart
=====================

There is preliminary support for events from the chart for the Canvas
Renderer but the API is not stablised and subject to change. __(TODO)__.

{% endfilter %}
</div>
{% endblock %}
