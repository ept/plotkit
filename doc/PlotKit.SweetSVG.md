{% extends "basex.html" %}
{% load markup %}
{% block pageid %}code{% endblock %}
{% block headers %}
<link href="doc.css" media="screen" rel="stylesheet" type="text/css" />
{% endblock %}
{% block title %}PlotKit.SweetSVG{% endblock %}

{% block content %}
<div class="page doc">
{% filter markdown %}
[PlotKit Home](PlotKit.html) | [<<](PlotKit.SweetCanvas.html) | [>>](PlotKit.EasyPlot.html)

PlotKit Sweet SVG Renderer
=============================

This renderer is an extension of the basic SVG Renderer to show off
what you can do to make graphs pretty without learning any graph
layout code.

There are no extra methods or options to use. The interface is exactly
the same as ``PlotKit.SVG``'s SVGRenderer.

SweetSVGRenderer adds a fake shadow around bars, lines and circles
along with a 2.0 width white outline and a etched light coloured
background.

Example
=======

{% endfilter %}
</div>
{% endblock %}

