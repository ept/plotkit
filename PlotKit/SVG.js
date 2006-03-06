// -------------------------------------------------------------------------
// NOTES: - Cannot use MochiKit.js, need to include everything individually.
//        - Need document header hack for Adobe SVG plugin
//
//
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// Check required components
// -------------------------------------------------------------------------

try {    
    if (typeof(PlotKit.Layout) == 'undefined')
    {
        throw "";    
    }
} 
catch (e) {    
    throw "PlotKit depends on MochiKit.{Base,Color,DOM,Format} and PlotKit.Layout"
}


// ---------------------------------------------------------------------------
//  SVG Renderer
//   * Draws the graph on a HTML Canvas with labels using DIVs
// ---------------------------------------------------------------------------

PlotKit.SVGRenderer = function(element, layout, options) {
    if (arguments.length > 0) 
        this.__init__(element, layout, options);
};

PlotKit.SVGRenderer.NAME = "PlotKit.SVGRenderer";
PlotKit.SVGRenderer.VERSION = PlotKit.VERSION;

PlotKit.SVGRenderer.__repr__ = function() {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

PlotKit.SVGRenderer.toString = function() {
    return this.__repr__();
}

PlotKit.SVGRenderer.isSupported = function() {
    // TODO
    return true;
};

PlotKit.SVGRenderer.prototype.__init__ = function(element, layout, options) {
    var isNil = MochiKit.Base.isUndefinedOrNull;

    // default options
    this.options = {
        "drawBackground": true,
        "backgroundColor": Color.whiteColor(),
        "padding": {left: 30, right: 20, top: 10, bottom: 10},
        "colorScheme": PlotKit.Base.palette(PlotKit.Base.baseColors()[1]),
        "strokeColor": Color.whiteColor(),
        "strokeColorTransform": "asStrokeColor",
        "strokeWidth": 0.5,
        "shouldFill": true,
        "shouldStroke": true,
        "drawXAxis": true,
        "drawYAxis": true,
        "axisLineColor": Color.blackColor(),
        "axisLineWidth": 0.5,
        "axisTickSize": 3,
        "axisLabelColor": Color.blackColor(),
        "axisLabelFontSize": 10,
        "axisLabelWidth": 50,
        "axisLabelUseDiv": true,
        "enableEvents": true
    };

    MochiKit.Base.update(this.options, options ? options : {});
    this.layout = layout;
    this.style = layout.style;
    this.element = MochiKit.DOM.getElement(element);
    this.container = this.element.parentNode;
    this.height = element.getAttribute('height');
    this.width = element.getAttribute('width');

    this.element.style.zIndex = 1;

    if (isNil(this.element))
        throw "SVGRenderer() - passed canvas is not found";

    // internal state
    this.xlabels = new Array();
    this.ylabels = new Array();

    this.area = {
        x: this.options.padding.left,
        y: this.options.padding.top,
        w: this.width - this.options.padding.left - this.options.padding.right,
        h: this.height - this.options.padding.top - this.options.padding.bottom
    };

  MochiKit.DOM.updateNodeAttributes(this.container, 
    {"style":{ "position": "relative", "width": this.width + "px"}});

    
};


PlotKit.SVGRenderer.prototype.render = function() {
    if (this.options.drawBackground)
        this._renderBackground();

    if (this.style == "bar") {
        this._renderBarChart();
        this._renderBarAxis();
    }
    else if (this.style == "pie") {
        this._renderPieChart();
        this._renderPieAxis();
    }
    else if (this.style == "line") {
        this._renderLineChart();
        this._renderLineAxis();
    }
};

PlotKit.SVGRenderer.prototype._renderBarOrLine = function(data, plotFunc, startFunc, endFunc) {
    
    var colorCount = this.options.colorScheme.length;
    var colorScheme = this.options.colorScheme;
    var setNames = MochiKit.Base.keys(this.layout.datasets);
    var setCount = setNames.length;

    for (var i = 0; i < setCount; i++) {
        var setName = setNames[i];
        var attrs = new Array();
        var color = colorScheme[i%colorCount];
        if (this.options.shouldFill)
            attrs["fill"] = color.toRGBString();
        else
            attrs["fill"] = "none";

        if (this.options.shouldStroke && 
            (this.options.strokeColor || this.options.strokeColorTransform)) {
            if (this.options.strokeColor)
                attrs["stroke"] = this.options.strokeColor.toRGBString();
            else if (this.options.strokeColorTransform)
                attrs["stroke"] = color[this.options.strokeColorTransform]().toRGBString();
            attrs["strokeWidth"] = this.options.strokeWidth;
        }

        if (startFunc)
            startFunc(attrs);

        var forEachFunc = function(obj) {
            if (obj.name == setName)
                plotFunc(attrs, obj);
        };                

        MochiKit.Iter.forEach(data, bind(forEachFunc, this));
        if (endFunc)
            endFunc(attrs);
    }
};

PlotKit.SVGRenderer.prototype._renderBarChart = function() {
    var bind = MochiKit.Base.bind;

    var drawRect = function(attrs, bar) {
        var x = this.area.w * bar.x + this.area.x;
        var y = this.area.h * bar.y + this.area.y;
        var w = this.area.w * bar.w;
        var h = this.area.h * bar.h;
        this._drawRect(x, y, w, h, attrs);
    };
    this._renderBarOrLine(this.layout.bars, bind(drawRect, this));
};

PlotKit.SVGRenderer.prototype._renderLineChart = function() {
    var bind = MochiKit.Base.bind;

    var addPoint = function(attrs, point) {
        this._tempPointsBuffer += (this.area.w * point.x + this.area.x) + "," +
                                 (this.area.h * point.y + this.area.y) + " ";
    };

    var startLine = function(attrs) {
        this._tempPointsBuffer = "";
        this._tempPointsBuffer += (this.area.x) + "," + (this.area.y+this.area.h) + " ";
    };

    var endLine = function(attrs) {
        this._tempPointsBuffer += (this.area.w + this.area.x) + ","  +(this.area.h + this.area.y);
        attrs["points"] = this._tempPointsBuffer;
        var poly = PlotKit.SVGRenderer.POLYGON(attrs);
        this.element.appendChild(poly);
    };

    this._renderBarOrLine(this.layout.points, 
                          bind(addPoint, this), 
                          bind(startLine, this), 
                          bind(endLine, this));
};


PlotKit.SVGRenderer.prototype._renderPieChart = function() {
    var colorCount = this.options.colorScheme.length;
    var slices = this.layout.slices;

    var centerx = this.area.x + this.area.w * 0.5;
    var centery = this.area.y + this.area.h * 0.5;
    var radius = Math.min(this.area.w / 2.0, this.area.h / 2.0);

    // NOTE NOTE!! Canvas Tag draws the circle clockwise from the y = 0, x = 1
    // so we have to subtract 90 degrees to make it start at y = 1, x = 0

	// workaround if we only have 1 slice of 100%
	if (slices.length == 1 && (Math.abs(slices[0].startAngle) - Math.abs(slices[0].endAngle) < 0.1)) {
        var attrs = {"cx": centerx , "cy": centery , "r": radius };
        var color = this.options.colorScheme[0];
        if (this.options.shouldFill)
            attrs["fill"] = color.toRGBString();
        else
            attrs["fill"] = "none";

        if (this.options.shouldStroke && 
            (this.options.strokeColor || this.options.strokeColorTransform)) {
            if (this.options.strokeColor)
                attrs["stroke"] = this.options.strokeColor.toRGBString();
            else if (this.options.strokeColorTransform)
                attrs["stroke"] = color[this.options.strokeColorTransform]().toRGBString();
            attrs["strokeWidth"] = this.options.strokeWidth;
        }
        this.element.appendChild(PlotKit.SVGRenderer.CIRCLE(attrs));
        return;
	}

    for (var i = 0; i < slices.length; i++) {
        var attrs = new Array();
        var color = this.options.colorScheme[i%colorCount];
        if (this.options.shouldFill)
            attrs["fill"] = color.toRGBString();
        else
            attrs["fill"] = "none";

        if (this.options.shouldStroke &&
            (this.options.strokeColor || this.options.strokeColorTransform)) {
            if (this.options.strokeColor)
                attrs["stroke"] = this.options.strokeColor.toRGBString();
            else if (this.options.strokeColorTransform)
                attrs["stroke"] = color[this.options.strokeColorTransform]().toRGBString();
            attrs["strokeWidth"] = this.options.strokeWidth;
        }

        var largearc = 0;
        if (Math.abs(slices[i].endAngle - slices[i].startAngle) > Math.PI)
            largearc = 1;
        var x1 = Math.cos(slices[i].startAngle - Math.PI/2) * radius;
        var y1 = Math.sin(slices[i].startAngle - Math.PI/2) * radius;
        var x2 = Math.cos(slices[i].endAngle - Math.PI/2) * radius;
        var y2 = Math.sin(slices[i].endAngle - Math.PI/2) * radius;
        var rx = x2 - x1;
        var ry = y2 - y1;

        var pathString = "M" + centerx + "," + centery + " ";       
        pathString += "l" + x1 + "," + y1 + " ";
        pathString += "a" + radius + "," + radius + " 0 " + largearc + ",1 " + rx + "," + ry + " z";

        attrs["d"] = pathString;

        var slice = PlotKit.SVGRenderer.PATH(attrs);
        this.element.appendChild(slice);
    }
};

PlotKit.SVGRenderer.prototype._renderBarAxis = function() {
    this._renderAxis();
}

PlotKit.SVGRenderer.prototype._renderLineAxis = function() {
    this._renderAxis();
};


PlotKit.SVGRenderer.prototype._renderAxis = function() {

    if (!this.options.drawXAxis && !this.options.drawYAxis)
        return;

    var labelStyle = {"style":
         {"position": "absolute",
          "textAlign": "center",
          "fontSize": this.options.axisLabelFontSize + "px",
          "zIndex": 10,
          "color": this.options.axisLabelColor.toRGBString(),
          "width": this.options.axisLabelWidth + "px",
          "overflow": "hidden"
         }
    };

    // axis lines
    var lineAttrs = {
        "stroke": this.options.axisLineColor.toRGBString(),
        "strokeWidth": this.options.axisLineWidth
    };
    

    if (this.options.drawYAxis) {
        if (this.layout.yticks) {
            var drawTick = function(tick) {
                var x = this.area.x;
                var y = this.area.y + tick[0] * this.area.h;
                this._drawLine(x, y, x - 3, y, lineAttrs);
                
                if (this.options.axisLabelUseDiv) {
                    var label = DIV(labelStyle, tick[1]);
                    label.style.top = (y - this.options.axisLabelFontSize) + "px";
                    label.style.left = (x - this.options.padding.left + 3) + "px";
                    label.style.textAlign = "left";
                    label.style.width = (this.options.padding.left - 3) + "px";
                    MochiKit.DOM.appendChildNodes(this.container, label);
                    this.ylabels.push(label);
                }
                else {
                    var attrs = {
                        y: (y - this.options.axisLabelFontSize),
                        x: (x - this.options.padding.left + 3),
                        fontFamily: "arial",
                        fontSize: this.options.axisLabelFontSize + "px",
                        fill: this.options.axisLabelColor.toRGBString()
                    };
                    var label = PlotKit.SVGRenderer.TEXT(attrs, tick[1]);
                    this.element.appendChild(label);
                }
            };
            
            MochiKit.Iter.forEach(this.layout.yticks, bind(drawTick, this));
        }

        this._drawLine(this.area.x, this.area.y, this.area.x, this.area.y + this.area.h, lineAttrs);
    }

    if (this.options.drawXAxis) {
        if (this.layout.xticks) {
            var drawTick = function(tick) {
                var x = this.area.x + tick[0] * this.area.w;
                var y = this.area.y + this.area.h;
                this._drawLine(x, y, x, y + 3, lineAttrs);

                if (this.options.axisLabelUseDiv) {
                    var label = DIV(labelStyle, tick[1]);
                    label.style.top = (y + 3) + "px";
                    label.style.left = (x - this.options.axisLabelWidth/2) + "px";
                    label.style.textAlign = "center";
                    label.style.width = this.options.axisLabelWidth + "px";
                    MochiKit.DOM.appendChildNodes(this.container, label);
                    this.xlabels.push(label);
                }
                else {
                     var attrs = {
                         y: (y - this.options.axisLabelFontSize),
                         x: (x - this.options.padding.left + 3),
                         fill: this.options.axisLabelColor.toRGBString()
                     };
                     var label = PlotKit.SVGRenderer.TEXT(attrs, tick[1]);
                     MochiKit.DOM.appendChildNodes(this.element, label);
                }
            };
            
            MochiKit.Iter.forEach(this.layout.xticks, bind(drawTick, this));
        }

        this._drawLine(this.area.x, this.area.y + this.area.h, this.area.x + this.area.w, this.area.y + this.area.h, lineAttrs)
    }
};

PlotKit.SVGRenderer.prototype._renderPieAxis = function() {

    if (this.layout.xticks) {
        // make a lookup dict for x->slice values
        var lookup = new Array();
        for (var i = 0; i < this.layout.slices.length; i++) {
            lookup[this.layout.slices[i].xval] = this.layout.slices[i];
        }
        
        var centerx = this.area.x + this.area.w * 0.5;
        var centery = this.area.y + this.area.h * 0.5;
        var radius = Math.min(this.area.w / 2.0, this.area.h / 2.0);
        var labelWidth = this.options.axisLabelWidth;
        
        for (var i = 0; i < this.layout.xticks.length; i++) {
            var slice = lookup[this.layout.xticks[i][0]];
            if (MochiKit.Base.isUndefinedOrNull(slice))
                continue;
                
                
            var angle = (slice.startAngle + slice.endAngle)/2;
            // normalize the angle
            var normalisedAngle = angle;
            if (normalisedAngle > Math.PI * 2)
                normalisedAngle = normalisedAngle - Math.PI * 2;
            else if (normalisedAngle < 0)
                normalisedAngle = normalisedAngle + Math.PI * 2;
                
            var labelx = centerx + Math.sin(normalisedAngle) * (radius + 10);
            var labely = centery - Math.cos(normalisedAngle) * (radius + 10);

            var attrib = {"position": "absolute",
                          "zIndex": 11,
                          "width": labelWidth + "px",
                          "fontSize": this.options.axisLabelFontSize + "px",
                          "overflow": "hidden",
                          "color": this.options.axisLabelColor.toHexString()
                        };

            if (normalisedAngle <= Math.PI * 0.5) {
                // text on top and align left
                attrib["textAlign"] = "left";
                attrib["verticalAlign"] = "top";
                attrib["left"] = labelx + "px";
                attrib["top"] = (labely - this.options.axisLabelFontSize) + "px";
            }
            else if ((normalisedAngle > Math.PI * 0.5) && (normalisedAngle <= Math.PI)) {
                // text on bottom and align left
                attrib["textAlign"] = "left";
                attrib["verticalAlign"] = "bottom";     
                attrib["left"] = labelx + "px";
                attrib["top"] = labely + "px";

            }
            else if ((normalisedAngle > Math.PI) && (normalisedAngle <= Math.PI*1.5)) {
                // text on bottom and align right
                attrib["textAlign"] = "right";
                attrib["verticalAlign"] = "bottom"; 
                attrib["left"] = (labelx  - labelWidth) + "px";
                attrib["top"] = labely + "px";
            }
            else {
                // text on top and align right
                attrib["textAlign"] = "left";
                attrib["verticalAlign"] = "bottom";  
                attrib["left"] = (labelx  - labelWidth) + "px";
                attrib["top"] = (labely - this.options.axisLabelFontSize) + "px";
            }
    
            var label = DIV({'style': attrib}, this.layout.xticks[i][1]);
            this.xlabels.push(label);
            MochiKit.DOM.appendChildNodes(this.container, label);
      }
        
    }
};

PlotKit.SVGRenderer.prototype._renderBackground = function() {
    var opts = {"stroke": "none",
                  "fill": this.options.backgroundColor.toRGBString()
    };
    this._drawRect(0, 0, this.width, this.height, opts);
};

PlotKit.SVGRenderer.prototype._drawRect = function(x, y, w, h, moreattrs) {
    var attrs = {x: x + "px", y: y + "px", width: w + "px", height: h + "px"};
    if (moreattrs)
        MochiKit.Base.update(attrs, moreattrs);

    var elem = PlotKit.SVGRenderer.RECT(attrs);
    this.element.appendChild(elem);
};

PlotKit.SVGRenderer.prototype._drawLine = function(x1, y1, x2, y2, moreattrs) {
    var attrs = {x1: x1 + "px", y1: y1 + "px", x2: x2 + "px", y2: y2 + "px"};
    if (moreattrs)
        MochiKit.Base.update(attrs, moreattrs);

    var elem = PlotKit.SVGRenderer.LINE(attrs);
    this.element.appendChild(elem);
}

PlotKit.SVGRenderer.prototype.clear = function() {
    while(this.element.firstChild) {
        this.element.removeChild(this.element.firstChild);
    }
    
    if (this.options.axisLabelUseDiv) {
        for (var i = 0; i < this.xlabels.length; i++) {
            MochiKit.DOM.removeElement(this.xlabels[i]);
        }        
        for (var i = 0; i < this.ylabels.length; i++) {
            MochiKit.DOM.removeElement(this.ylabels[i]);
        }            
    }
    this.xlabels = new Array();
    this.ylabels = new Array();
};

PlotKit.SVGRenderer.createSVGDOM = function(name, attrs/*, nodes.. */) {
    var elem = document.createElementNS("http://www.w3.org/2000/svg", name);
    if (attrs)
        MochiKit.DOM.updateNodeAttributes(elem, attrs);

    if (arguments.length <= 3) {
        return elem;
    }
    else {
        var args = MochiKit.Base.extend([elem], arguments, 2);
        return MochiKit.DOM.appendChildNodes.apply(this, args);
    }
};

PlotKit.SVGRenderer.createSVGDOMFunc = function(/* tag, attrs, nodes */) {
    return MochiKit.Base.partial.apply(this, MochiKit.Base.extend([PlotKit.SVGRenderer.createSVGDOM], arguments));
};

PlotKit.SVGRenderer.RECT = PlotKit.SVGRenderer.createSVGDOMFunc("rect");
PlotKit.SVGRenderer.POLYGON = PlotKit.SVGRenderer.createSVGDOMFunc("polygon");
PlotKit.SVGRenderer.PATH = PlotKit.SVGRenderer.createSVGDOMFunc("path");
PlotKit.SVGRenderer.SVG = PlotKit.SVGRenderer.createSVGDOMFunc("svg");
PlotKit.SVGRenderer.LINE = PlotKit.SVGRenderer.createSVGDOMFunc("line");
PlotKit.SVGRenderer.CIRCLE = PlotKit.SVGRenderer.createSVGDOMFunc("circle");
PlotKit.SVGRenderer.TEXT = PlotKit.SVGRenderer.createSVGDOMFunc("text");

/*

 Copyright (c) 2005, 2006 Alastair Tse <alastair@tse.id.au>

 All rights reserved.

 Redistribution and use in source and binary forms, with or without modification, are
 permitted provided that the following conditions are met:
 
  * Redistributions of source code must retain the above copyright notice, this list of
 conditions and the following disclaimer. * Redistributions in binary form must reproduce
 the above copyright notice, this list of conditions and the following disclaimer in the
 documentation and/or other materials provided with the distribution. * Neither the name
 of the <ORGANIZATION> nor the names of its contributors may be used to endorse or
 promote products derived from this software without specific prior written permission.
 
  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT
 OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT
 LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 
*/ 
