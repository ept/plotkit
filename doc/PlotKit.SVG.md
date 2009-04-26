{% extends "basex.html" %}
{% load markup %}
{% block pageid %}code{% endblock %}
{% block headers %}
<link href="doc.css" media="screen" rel="stylesheet" type="text/css" />
{% endblock %}
{% block title %}PlotKit.SVG{% endblock %}

{% block content %}
<div class="page doc api">
{% filter markdown %}
[PlotKit Home](PlotKit.html) | [<<](PlotKit.Canvas.html) | [>>](PlotKit.SweetCanvas.html)

PlotKit SVG
===========

PlotKit SVG includes the SVGRenderer which allows chart plotting on SVG capable browsers such as Firefox 1.5 and Opera 9.0. It should support Adobe SVG plugin, but is current untested.

Important Implementation Requirements
-------------------------------------

In order to use the SVG Renderer, the file and webserver must support inline SVG files. This means the following conditions must exist:

###The HTML file must be XHTML compliant. 

So it should start off with this:

	<?xml version="1.0" encoding="UTF-8"?>
	<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
	"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html
	xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en"
	xmlns:svg="http://www.w3.org/2000/svg"
	xmlns:xlink="http://www.w3.org/1999/xlink">
	<head>        
	  <object id="AdobeSVG" classid="clsid:78156a80-c6a1-4bbf-8e6a-3cd390eeb4e2" width="1" height="1"></object>
	  <?import namespace="svg" implementation="#AdobeSVG"?>
	...

###Correct XHTML Mime-Type

Firefox and MSIE are fussy about the mimetype to do in-line
SVG. Firefox requires that either the URL ends in .html or that the
file is returned as mime type ``application/xhtml+xml`` in the HTTP
headers.

However, MSIE does not recognise ``application/xhtml+xml`` and will
work fine with regular ``text/html`` mimetype for XHTML.

###Non XHTML Compliant javascript includes

You cannot use the autoloading MochiKit.js, but instead include all the JS files individually or use the packed MochiKit. This is because MochiKit's way of autoloading is not XHTML compliant.

An example of this is in the tests.


PlotKit SVG Options
-------------------

There are no additional options for the SVG Renderer apart from the default Renderer options.

{% endfilter %}
</div>
{% endblock %}