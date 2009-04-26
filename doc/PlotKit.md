---
title: PlotKit Documentation
layout: doc
---

PlotKit
=======

[PlotKit][] is a Javascript graph plotting library. It is aimed at web
applications that require plotting series of data in modern web
browsers. 

PlotKit requires [MochiKit][]. (1.3 or higher)

PlotKit supports both HTML Canvas and SVG, along with an 
[emulated canvas for Internet Explorer][IECanvas].

PlotKit is easily extensible to include other rendering engines,
styles and layouts. Please pursue the documentation for more
information.

PlotKit is licensed under the BSD License, so you can include it in
your free or commercial applications without worrying.

PlotKit Components
==================

Base Classes
------------

* [Base][] : Common functionality that is used in other classes,
  including default styles.
* [Layout][] : The default chart layout engine, supports bar, line and
               pie charts.
* [Renderer][]: Customising the look of the output

Renderer Specific Implementations
---------------------------------

* [CanvasRenderer][]: Basic renderer using an HTML Canvas.
* [SVGRenderer][]: Basic renderer using SVG.
* [SweetCanvasRenderer][]: Customised Renderer that builds on CanvasRenderer to provide nicer looking charts.
* [SweetSVGRenderer][]: Customised renderer that builds on SVGRenderer to provide nicer looking charts.
   
Utility Classes
---------------

* [EasyPlot][]: Simple Wrapper around classes to provide one-line plotting.

Getting Started
===============

* [PlotKit Quick Start][QuickStart] - A thorough quick start to getting charts working for Safari, Mozilla, Firefox, Opera and IE.
* [SVG/Canvas Browser Support Status][Browser] - Quirks about browser support that you should know about.
* [Simple Canvas Demo][QuickstartCanvasDemo] - Very basic Canvas demo all contained in an HTML file.
* [Simple SVG Demo][QuickstartSVGDemo] - Very basic SVG demo all contained in an HTML file.

More Demos
==========

* Unit Tests [Canvas][CanvasTest], [SVG][SVGTest], [SweetCanvas][SCanvasTest], [SweetSVG][SSVGTest].
* [Dynamic Charting][DynamicTest].
* [Labels Example][]. Thanks to Christopher Armstrong.
* [Labels with Images][].
* [Axis Restrictions][].

Version History
===============


###PlotKit 0.8

* Total rewrite from [CanvasGraph 0.7][CanvasGraph]

###PlotKit 0.9

* Fixed some redraw issues with clear()
* Replaced IECanvas.HTC with ExplorerCanvas
* Added auto import and packed versions just like MochiKit.
* Added horizontal bar chart rendering mode.
* Added awareness of prototype.js and workaround Array/Object mutilation issues with MochiKit.
* Added EasyPlot for single line plotting with Ajax support.
* More tests, [dynamic charting][DynamicTest] and quickstart demos.

###PlotKit 0.9.1

* Make Sweet{Canvas/SVG}Renderers respect shouldFill.
* Fixed ignoring of maximum x and y values when setting xAxis/yAxis.
* Fixed typo for calculating yrange in Layout.js (thanks to
    HubrisSonic).
* Changed SweetCanvasRenderer to use axisLineColor for drawing lines over 
    background (thanks to HubrisSonic).
* Fixed bug in y-axis tick drawing (thanks to Cliff).
* Fixed x-axis calculation bug when xAxisIsZero is false (thanks to 
    Loic Jeannin)
* Fixed xTicks drawing that exceed the bounds of the chart (thanks to
    Cliff)
* Fixed barchart drawing with only 2 values (thanks to HubrisSonic)
* Hide pie chart labels of 0% (thanks to Attiks)
* Added optional field to addDatasetFromTable to include x-axis labels.
* Updated excanvas.js version to fix possible printing issues.

###PlotKit SVN

* Allow DOM elements into pie chart labels just like bar and line
     charts. (Thanks to cho45).
* Fixed respecting shouldFill option for Canvas renderer. (Thanks to Dan Vanderkam).
* Fixed unbound map in pie chart drawing (Thanks to David Evans).
* Fixed drawing 100% pie chart slices in IE (Thanks to David Evans).

Road Map
========
###Version 0.9

* AutoSelectRenderer, automatically choose Canvas or SVG by auto detecting browser support.

###Version 0.10

* Point plots
* Defined Event System Support
* Animation support.

[QuickStart]: PlotKit.QuickStart.html
[CanvasGraph]: http://www.liquidx.net/canvasgraphjs/
[PlotKit]: http://www.liquidx.net/plotkit/
[MochiKit]: http://mochikit.com/
[IECanvas]: http://me.eae.net/archive/2005/12/29/canvas-in-ie/
[Base]: PlotKit.Base.html
[Styles]: PlotKit.Styles.html
[Layout]: PlotKit.Layout.html
[Renderer]: PlotKit.Renderer.html
[CanvasRenderer]: PlotKit.Canvas.html
[SVGRenderer]: PlotKit.SVG.html
[SweetCanvasRenderer]: PlotKit.SweetCanvas.html
[SweetSVGRenderer]: PlotKit.SweetSVG.html
[EasyPlot]: PlotKit.EasyPlot.html
[Browser]: SVGCanvasCompat.html
[CanvasTest]: http://media.liquidx.net/js/plotkit-tests/basic.html
[SVGTest]: http://media.liquidx.net/js/plotkit-tests/svg.html
[SCanvasTest]: http://media.liquidx.net/js/plotkit-tests/sweet.html
[SSVGTest]: http://media.liquidx.net/js/plotkit-tests/sweet-svg.html
[QuickstartCanvasDemo]: http://media.liquidx.net/js/plotkit-tests/quickstart.html
[QuickstartSVGDemo]: http://media.liquidx.net/js/plotkit-tests/quickstart-svg.html
[QuickstartEasyDemo]: http://media.liquidx.net/js/plotkit-tests/quickstart-easy.html
[DynamicTest]: http://media.liquidx.net/js/plotkit-tests/dynamic.html
[Labels Example]: http://media.liquidx.net/js/plotkit-tests/labels.html
[Labels with Images]: http://media.liquidx.net/js/plotkit-tests/labels-img.html
[Axis Restrictions]: http://media.liquidx.net/js/plotkit-tests/axis.html

