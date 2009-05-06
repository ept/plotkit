---
title: PlotKit.Layout
layout: doc
---
[PlotKit Home](PlotKit.html) | [<<](PlotKit.Base.html) | [>>](PlotKit.Renderer.html)

PlotKit Layout
==============

PlotKit Layout is the core of the plotting engine. It deals exclusively with laying objects out on a virtual canvas that has the dimension of 1.0 x 1.0.

The layout engine abstracts away all the complex layout problems with plotting charts and presents a list of objects that need to rendered rather than mixing this with the rendering logic.

PlotKit Layout also is responsible for simple chart state querying so renderers can implement basic event support for objects on the canvas.

Constructor
===========
 
  `new Layout(style, options);`

Layout takes the following arguments:

__style__ which can be `bar`, `line` or `pie` which represents the style of the graph that is desired.

__options__ is a dictionary/associative array of layout options. Unrecognised keys are ignored. The following options are supported:

Layout Options
==============

Bar and Line Chart layout options
---------------------------------

<table cellpadding="0" cellspacing="0">
  <thead>
	<tr><td>Option name</td><td>Description</td><td>Type</td><td>Default</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>barWidthFillFraction</th>
		<td>Amount of space the total amount of bars should consume per X value.</td>
		<td>Real number</td>
		<td>0.75</td>
	</tr>
	<tr>
		<th>barOrientation</th>
		<td>Orientation of a bar chart. <b>(PlotKit 0.9+ only)</b></td>
		<td>String ("vertical", "horizontal")</td>
		<td>vertical</td>
	</tr>
	
	<tr>
		<th>xAxis</th>
		<td>Minimum and Maximum values on the X axis.</td>
		<td>Array of 2 Real numbers. (eg. [0.0, 10.0])</td>
		<td>null</td>
	</tr>
	<tr>
		<th>xNumberOfTicks</th>
		<td>Used when automatically calculating axis ticks. This denotes the number of ticks there should be in the graph.
		    Can be just a number, or an array defining a range [min, max].</td>
		<td>integer or array of integer</td>
		<td>[8, 12]</td>
	</tr>
	<tr>
		<th>xOriginIsZero</th>
		<td>Should graph have X axis origin at 0</td>
		<td>boolean</td>
		<td>true</td>
	</tr>
	<tr>
		<th>xTickPrecision</th>
		<td>The number of decimal places we should round to for tick values.</td>
		<td>integer</td>
		<td>1</td>
	</tr>
	<tr>
		<th>xTicks</th>
		<td>X values at which ticks should be drawn. Automatically calculated if not defined using the parameters `xNumberOfTicks` and ``xTickPrecision``.</td>
		<td>Array of {label: "somelabel", v:value}.</td>
		<td>null</td>
	</tr>
	
	<tr>
		<th>yAxis</th>
		<td>Minimum and Maximum values on the Y axis.</td>
		<td>Array of 2 Real numbers. (eg. [0.0, 10.0])</td>
		<td>null</td>
	</tr>
	<tr>
		<th>yNumberOfTicks</th>
		<td>Used when automatically calculating axis ticks. This denotes the number of ticks there should be in the graph.
		    Can be just a number, or an array defining a range [min, max].</td>
		<td>integer or array of integer</td>
		<td>[5, 8]</td>
	</tr>
	<tr>
		<th>yOriginIsZero</th>
		<td>Should graph have Y axis origin at 0</td>
		<td>true</td>
	</tr>
	<tr>
		<th>yTickPrecision</th>
		<td>The number of decimal places we should round to for tick values.</td>
		<td>integer</td>
		<td>1</td>
	</tr>
	<tr>
		<th>yTicks</th>
		<td>Y values at which ticks should be drawn. Automatically calculated if not defined using the parameters ``yNumberOfTicks`` and ``yTickPrecision``.</td>
		<td>Array of {label: "somelabel", v:value}.</td>
		<td>null</td>
	</tr>
 	</tbody>
</table>

Pie Chart Layout Options
------------------------

<table>
  <thead>
	<tr><td>Option name</td><td>Description</td><td>Type</td><td>Default</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>pieRadius</th>
		<td>Radius of the circle to be drawn.</td>
		<td>Real number</td>
		<td>0.4</td>
	</tr>
  </tbody>
</table>	

Layout Properties
=================

There are some properties you can access, either because you are using a layout inside a renderer or if you would like additional information. Under normal operations, you will not need to, or should modify these parameters.

<table cellpadding="0" cellspacing="0">
  <thead>
	<tr><td>Property</td><td>Type</td><td>Description</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>style</th>
		<td>String</td>
		<td>This denotes the type of chart this layout is using. Valid values are ``bar``, ``line`` or ``pie``. Renderers will use this to determine which parameter (``bars``, ``points`` or ``slices``) to access in order to get draw the chart.</td>
	</tr>
	<tr>
		<th>bars</th>
		<td>Array of Bar.</td>
		<td>This is a list of rectangles with values that the renderer should plot. This will only be valid after ``evaluate()`` has run. The properties of ``bar`` is described here. This is only valid if style is ``bar``. This array is sorted by dataset and then x-values.</td>
	</tr>
	<tr>
		<th>points</th>
		<td>Array of Point.</td>
		<td>This is a list of points with values that the renderer should plot. This will only be valid after ``evaluate()`` has run. The properties of ``bar`` is described here. This is only valid if style is ``line``. This array is sorted by dataset and then x-values.</td>
	</tr>
	<tr>
		<th>slices</th>
		<td>Array of Slice.</td>
		<td>This is a list of pie slices with values that the renderer should plot. This will only be valid after ``evaluate()`` has run. The properties of ``bar`` is described here. This is only valid if style is ``pie``.</td>
	</tr>
	<tr>
		<th>xticks</th>
		<td>Array of Tick.</td>
		<td>For style in ``bar`` or ``line``, these are the ticks on the X axis. A ``tick`` is represented as a two element array with the first element representing the x position of the tick and the second element representing the string value of the label at that position.</td>
	</tr>
	<tr>
		<th>yticks</th>
		<td>Array of Tick.</td>
		<td>For style in ``bar`` or ``line``, these are the ticks on the Y axis. A ``tick`` is represented as a two element array with the first element representing the y position of the tick and the second element representing the string value of the label at that position.</td>
	</tr>
	<tr>
		<th>datasets</th>
		<td>Associative Array of datasets</td>
		<td>This should normally only be used to find the number of datasets by performing ``keys(layout.datasets)``. If you are looking at this in a renderer, then the layout engine needs to be extended.</td>
	</tr>
  </tbody>
</table>

Layout Types
============

Here are the definition of the types that you will encounter if you access the properties of the Layout object, specifically ``bars``, ``points`` and ``slices``. If you are not writing a renderer, you do not need to know this.

Bar Type
--------

Represents a bar that the renderer will draw. It contains the following properties.

<table cellpadding="0" cellspacing="0">
  <thead>
	<tr><td>Property</td><td>Type</td><td>Description</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>x, y</th>
		<td>float</td>
		<td>top left position of the bar between 0.0 and 1.0.</td>
	</tr>
	<tr>
		<th>w, h</th>
		<td>float</td>
		<td>width and height of the bar from (``x``, ``y``) between 0.0 and 1.0.</td>
	</tr>
	<tr>
		<th>xval, yval</th>
		<td>float</td>
		<td>The actual x value and y value this bar represents.</td>
	</tr>
	<tr>
		<th>name</th>
		<td>string</td>
		<td>Name of the dataset which this bar belongs to.</td>
	</tr>
  </tbody>
</table>

Point Type
----------

This represents a point on a line chart.

<table cellpadding="0" cellspacing="0">
  <thead>
	<tr><td>Property</td><td>Type</td><td>Description</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>x, y</th>
		<td>float</td>
		<td>top left position of the point between 0.0 and 1.0.</td>
	</tr>
	<tr>
		<th>xval, yval</th>
		<td>float</td>
		<td>The actual x value and y value this bar represents.</td>
	</tr>
	<tr>
		<th>name</th>
		<td>string</td>
		<td>Name of the dataset which this bar belongs to.</td>
	</tr>
  </tbody>
</table>

Slice Type
----------

This represents a pie slice in a pie chart.

<table>
  <thead>
	<tr><td>Property</td><td>Type</td><td>Description</td></tr>
  </thead>
 <tbody>
	<tr>
		<th>fraction</th>
		<td>float</td>
		<td>The fractional value this slice represents. This number is between 0.0 and 1.0</td>
	</tr>
	<tr>
		<th>xval, yval</th>
		<td>float</td>
		<td>The x and y values of this slice.</td>
	</tr>
	<tr>
		<th>startAngle</th>
		<td>float</td>
		<td>This is the angle of the start of the slice, in radians.</td>
	</tr>
	<tr>
		<th>endAngle</th>
		<td>float</td>
		<td>This is the angle of the end of the slice, in radians.</td>
	</tr>
  </tbody>
</table>

Layout Methods
==============

* ``addDataset(name, values)``
  
  Adds a dataset to the layout engine and assigns it with ``name``. ``values`` is an array of ``\[x, y\]`` values.

* ``removeDataset(name)``
  
 Removes a dataset from the layout engine. In order for the new data to take effect, you must run ``evaluate()``.

* ``addDatasetFromTable(name, tableElement, xcol = 0, ycol = 1, labelCol = -1)``

  Handy function to read values off a table. ``name`` is the name to give to the dataset just like in ``addDataset()``, ``tableElement`` is the table which contains the values. Optionally, the user may specify to extract alternative columns using ``xcol`` and ``ycol``. 
  
  **New in 0.9.1:** If ``labelCol`` is specified to a value greater than -1, it will take the contents of that column as the xTick labels.

* ``evaluate()``
 
  Performs the evaluation of the layout. It is not done automatically, and you __must__ execute this before passing the layout to a renderer.

* hitTest(x, y)

  Used by renderers to see if a virtual canvas position corresponds to any data. The return value varies per style. For ``bar`` charts, it will return the Bar type if it is a hit, or null if not. For ``line``  charts, it will return a value if the point is underneath the highest curve, otherwise null __(TODO: expand this or change implementation)__. For ``pie`` charts, it will return the Slice object that is at the point, otherwise null.

  __Note that the specification of this function is subject to change__.
   
Layout Notes
============

Pie Chart Data and Ticks Restrictions
-------------------------------------

Note that you can only use one dataset for pie charts. Only the y value of the dataset will be used, but the x value must be unique and set as it will correspond to the xTicks that are given.

Labels for pie charts will only use xTicks.

Layout Examples
===============

