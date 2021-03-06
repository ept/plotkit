/*
    PlotKit Layout
    ==============

    Handles laying out data on to a virtual canvas square canvas between 0.0
    and 1.0. If you want to add new chart/plot types such as point plots,
    you need to add them here.

    Copyright
    ---------
    Copyright 2005,2006 (c) Alastair Tse <alastair^liquidx.net>
    For use under the BSD license. <http://www.liquidx.net/plotkit>

*/

try {
    if (typeof(PlotKit.Base) == 'undefined')
    {
        throw ""
    }
}
catch (e) {
    throw "PlotKit.Layout depends on MochiKit.{Base,Color,DOM,Format} and PlotKit.Base"
}

// --------------------------------------------------------------------
// Start of Layout definition
// --------------------------------------------------------------------

PlotKit.Layout = function(style, options) {

    this.options = {
        "barWidthFillFraction": 0.75,
        "barOrientation": "vertical",
        "xOriginIsZero": true,
        "yOriginIsZero": true,
        "xAxis": null, // [xmin, xmax]
        "yAxis": null, // [ymin, ymax]
        "xTicks": null, // [{label: "somelabel", v: value}, ..] (label opt.)
        "yTicks": null, // [{label: "somelabel", v: value}, ..] (label opt.)
        "xNumberOfTicks": [8, 12],
        "yNumberOfTicks": [5, 8],
        "xTickPrecision": 1,
        "yTickPrecision": 1,
        "pieRadius": 0.4,
        "piePercentages": true
    };

    // valid external options : TODO: input verification
    this.style = style;
    MochiKit.Base.update(this.options, options ? options : {});

    // externally visible states
    // overriden if xAxis and yAxis are set in options
    if (!MochiKit.Base.isUndefinedOrNull(this.options.xAxis)) {
        this.minxval = this.options.xAxis[0];
        this.maxxval = this.options.xAxis[1];
        this.xscale = this.maxxval - this.minxval;
    }
    else {
        this.minxval = 0;
        this.maxxval = null;
        this.xscale = null; // val -> pos factor (eg, xval * xscale = xpos)
    }

    if (!MochiKit.Base.isUndefinedOrNull(this.options.yAxis)) {
        this.minyval = this.options.yAxis[0];
        this.maxyval = this.options.yAxis[1];
        this.yscale = this.maxyval - this.minyval;
    }
    else {
        this.minyval = 0;
        this.maxyval = null;
        this.yscale = null;
    }

    this.bars = new Array();   // array of bars to plot for bar charts
    this.points = new Array(); // array of points to plot for line plots
    this.slices = new Array(); // array of slices to draw for pie charts

    this.xticks = new Array();
    this.yticks = new Array();

    // internal states
    this.datasets = new Array();
    this.datasetNames = new Array();
    this.minxdelta = 0;
    this.xrange = 1;
    this.yrange = 1;

    this.hitTestCache = {x2maxy: null};

};

PlotKit.Layout.NAME = "PlotKit.Layout";
PlotKit.Layout.VERSION = PlotKit.VERSION;

PlotKit.Layout.__repr__ = function() {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

PlotKit.Layout.toString = function() {
    return this.__repr__();
}

PlotKit.Layout.valid_styles = ["bar", "line", "pie", "point"];



// --------------------------------------------------------------------
// Dataset Manipulation
// --------------------------------------------------------------------


PlotKit.Layout.prototype.addDataset = function(setname, set_xy) {
    this.datasets[setname] = set_xy;
    if (MochiKit.Base.findValue(this.datasetNames, setname) < 0)
        this.datasetNames.push(setname);
};

PlotKit.Layout.prototype.removeDataset = function(setname, set_xy) {
    delete this.datasets[setname];
    this.datasetNames = MochiKit.Base.filter(function(name) { return name != setname; }, this.datasetNames);
};

PlotKit.Layout.prototype.addDatasetFromTable = function(name, tableElement, xcol, ycol,  lcol) {
	var isNil = MochiKit.Base.isUndefinedOrNull;
	var scrapeText = MochiKit.DOM.scrapeText;
	var strip = MochiKit.Format.strip;
	
	if (isNil(xcol))
		xcol = 0;
	if (isNil(ycol))
		ycol = 1;
	if (isNil(lcol))
	    lcol = -1;

    var rows = tableElement.tBodies[0].rows;
    var data = new Array();
    var labels = new Array();

    if (!isNil(rows)) {
        for (var i = 0; i < rows.length; i++) {
            data.push([parseFloat(strip(scrapeText(rows[i].cells[xcol]))),
                       parseFloat(strip(scrapeText(rows[i].cells[ycol])))]);
            if (lcol >= 0){
               labels.push({v: parseFloat(strip(scrapeText(rows[i].cells[xcol]))),
                            label:  strip(scrapeText(rows[i].cells[lcol]))});
            }
        }
        this.addDataset(name, data);
        if (lcol >= 0) {
            this.options.xTicks = labels;
        }
        return true;
    }
    return false;
};

// --------------------------------------------------------------------
// Evaluates the layout for the current data and style.
// --------------------------------------------------------------------

PlotKit.Layout.prototype.evaluate = function() {
    this._evaluateLimits();
    this._evaluateScales();
    if (this.style == "bar") {
        this._evaluateBarTicks();
        if (this.options.barOrientation == "horizontal") {
            this._evaluateHorizBarCharts();
        }
        else {
            this._evaluateBarCharts();
        }
    } else if (this.style == "pie") {
        this._evaluatePieCharts();
        this._evaluatePieTicks();
    } else {
        this._evaluateLineTicks();
        this._evaluateLineCharts();
    }
};



// Given the fractional x, y positions, report the corresponding
// x, y values.
PlotKit.Layout.prototype.hitTest = function(x, y) {
    // TODO: make this more efficient with better datastructures
    //       for this.bars, this.points and this.slices

    var f = MochiKit.Format.twoDigitFloat;

    if ((this.style == "bar") && this.bars && (this.bars.length > 0)) {
        for (var i = 0; i < this.bars.length; i++) {
            var bar = this.bars[i];
            if ((x >= bar.x) && (x <= bar.x + bar.w)
                && (y >= bar.y) && (y - bar.y <= bar.h))
                return bar;
        }
    }

    else if (this.style == "line") {
        if (this.hitTestCache.x2maxy == null) {
            this._regenerateHitTestCache();
        }

        // 1. find the xvalues that equal or closest to the give x
        var xval = x / this.xscale;
        var xvalues = this.hitTestCache.xvalues;
        var xbefore = null;
        var xafter = null;

        for (var i = 1; i < xvalues.length; i++) {
            if (xvalues[i] > xval) {
                xbefore = xvalues[i-1];
                xafter = xvalues[i];
                break;
            }
        }

        if ((xbefore != null)) {
            var ybefore = this.hitTestCache.x2maxy[xbefore];
            var yafter = this.hitTestCache.x2maxy[xafter];
            var yval = (1.0 - y)/this.yscale;

            // interpolate whether we will fall inside or outside
            var gradient = (yafter - ybefore) / (xafter - xbefore);
            var projmaxy = ybefore + gradient * (xval - xbefore);
            if (projmaxy >= yval) {
                // inside the highest curve (roughly)
                var obj = {xval: xval, yval: yval,
                           xafter: xafter, yafter: yafter,
                           xbefore: xbefore, ybefore: ybefore,
                           yprojected: projmaxy
                };
                return obj;
            }
        }
    }

    else if (this.style == "pie") {
        var dist = Math.sqrt((y-0.5)*(y-0.5) + (x-0.5)*(x-0.5));
        if (dist > this.options.pieRadius)
            return null;

        // TODO: actually doesn't work if we don't know how the Canvas
        //       lays it out, need to fix!
        var angle = 0.0;
        if (y < 0.5 && x < 0.5) {
            angle = Math.atan2(y - 0.5, x - 0.5) + 5 * Math.PI/2;
        }
        else {
            angle = Math.atan2(y - 0.5, x - 0.5) + Math.PI/2;
        }

        for (var i = 0; i < this.slices.length; i++) {
            var slice = this.slices[i];
            if (slice.startAngle < angle && slice.endAngle >= angle)
                return slice;
        }
    }

    return null;
};

// Reports valid position rectangle for X value (only valid for bar charts)
PlotKit.Layout.prototype.rectForX = function(x) {
    return null;
};

// Reports valid angles through which X value encloses (only valid for pie charts)
PlotKit.Layout.prototype.angleRangeForX = function(x) {
    return null;
};

// --------------------------------------------------------------------
// START Internal Functions
// --------------------------------------------------------------------

/**
 * Takes as arguments the name of a dataset and a single datapoint from that dataset, and transforms
 * it into a canonical format: an object with attributes 'x', 'y' and 'name'.
 */
PlotKit.Layout.prototype._parseDatapoint = function(datasetName, point) {
    return {x: parseFloat(point[0]), y: parseFloat(point[1]), name: datasetName};
};

/**
 * Determines the minimum and maximum values which need to fit into the chart in both the x
 * and the y axis, and writes these to the fields this.{min,max}{x,y}val. If axis ranges were
 * explicitly specified as an option, these are used; otherwise we observe the values in
 * our datasets.
 */
PlotKit.Layout.prototype._evaluateLimits = function() {
    // Convenient shortcuts
    var map = PlotKit.Base.map;
    var items = PlotKit.Base.items;
    var itemgetter = MochiKit.Base.itemgetter;
    var collapse = PlotKit.Base.collapse;
    var listMin = MochiKit.Base.listMin;
    var listMax = MochiKit.Base.listMax;
    var isNil = MochiKit.Base.isUndefinedOrNull;
    var bind = MochiKit.Base.bind;
    var partial = MochiKit.Base.partial;
    var compose = MochiKit.Base.compose;
    var operator = MochiKit.Base.operator;

    // Array of all datapoints (regardless of the series they belong to) sorted by x value,
    // represented as objects with fields 'x', 'y' and 'name'.
    var all = collapse(map(bind(function(dataset) {
        var parse = partial(this._parseDatapoint, dataset[0]);
        return map(parse, dataset[1]);
    }, this), items(this.datasets)));
    all.sort(function(a, b) {
        return MochiKit.Base.compare(a.x, b.x);
    });
    
    ///////// Determine x axis range
    if (!isNil(this.options.xAxis)) {
        // use the xAxis option value
        this.minxval = this.options.xAxis[0];
        this.maxxval = this.options.xAxis[1];
        
    } else {
        // no x range specified - calc minxval, maxxval from dataset
        if (this.options.xOriginIsZero || all.length == 0) this.minxval = 0;
        else this.minxval = all[0].x;

        if (all.length == 0) this.maxxval = 1; // arbitrary default if no data is present
        else this.maxxval = all[all.length - 1].x;
    }

    ///////// Determine y axis range
    if (!isNil(this.options.yAxis)) {
        // use the yAxis option value
        this.minyval = this.options.yAxis[0];
        this.maxyval = this.options.yAxis[1];
        
    } else if (!isNil(this.options.xAxis) && (all.length > 0) && (this.style == 'line')) {
        // if the x axis range is constrained but the y axis range is not, we examine only the
        // datapoints within that range of x values to find the minimum and maximum y values.
        // we also look at the boundaries and interpolate the line to the nearest data points
        // just outside the selected x range; this allows us to fit in the interpolated lines
        // up to the x axis range boundary.
        this.minyval = this.maxyval = null;
        var closestBelow = {}, closestAbove = {}, firstInside = {}, lastInside = {};
        
        for (var i = 0; i < all.length; i++) {
            var p = all[i];
            if (p.x < this.minxval) {
                closestBelow[p.name] = p;
            } else if (p.x <= this.maxxval) {
                if ((this.minyval == null) || (p.y < this.minyval)) this.minyval = p.y;
                if ((this.maxyval == null) || (p.y > this.maxyval)) this.maxyval = p.y;
                if (typeof(firstInside[p.name]) == 'undefined') firstInside[p.name] = p;
                lastInside[p.name] = p;
            } else if (typeof(closestAbove[p.name]) == 'undefined') {
                closestAbove[p.name] = p;
            }
        }
        
        // Interpolation on the left-hand boundary
        var intersect = filter(compose(operator.lognot, isNull), map(bind(function(itemBelow) {
            var below = itemBelow[1];
            var inside = firstInside[itemBelow[0]] || closestAbove[itemBelow[0]];
            if (typeof(inside) == 'undefined') return null;
            return (inside.y - below.y) * (this.minxval - below.x) / (inside.x - below.x) + below.y;
        }, this), items(closestBelow)));
        this.minyval = Math.min(this.minyval, listMin(intersect));
        this.maxyval = Math.max(this.maxyval, listMax(intersect));
        
        // Interpolation on the right-hand boundary
        intersect = filter(compose(operator.lognot, isNull), map(bind(function(itemAbove) {
            var above = itemAbove[1];
            var inside = lastInside[itemAbove[0]] || closestBelow[itemAbove[0]];
            if (typeof(inside) == 'undefined') return null;
            return (above.y - inside.y) * (this.maxxval - inside.x) / (above.x - inside.x) + inside.y;
        }, this), items(closestAbove)));
        this.minyval = Math.min(this.minyval, listMin(intersect));
        this.maxyval = Math.max(this.maxyval, listMax(intersect));
        
        // yOriginIsZero override
        if (this.options.yOriginIsZero) this.minyval = 0;
        
    } else {
        // if neither xAxis nor yAxis is specified, find the minimum and maximum over the entire
        // list of data points
        if (this.options.yOriginIsZero || all.length == 0) this.minyval = 0;
        else this.minyval = listMin(map(itemgetter('y'), all));

        if (all.length == 0) this.maxyval = 1; // arbitrary default if no data is present
        else this.maxyval = listMax(map(itemgetter('y'), all));
    }
};

PlotKit.Layout.prototype._evaluateScales = function() {
    var isNil = MochiKit.Base.isUndefinedOrNull;

    this.xrange = this.maxxval - this.minxval;
    if (this.xrange == 0)
        this.xscale = 1.0;
    else
        this.xscale = 1/this.xrange;

    this.yrange = this.maxyval - this.minyval;
    if (this.yrange == 0)
        this.yscale = 1.0;
    else
        this.yscale = 1/this.yrange;
};

PlotKit.Layout.prototype._uniqueXValues = function(includeArray) {
    var collapse = PlotKit.Base.collapse;
    var map = PlotKit.Base.map;
    var uniq = PlotKit.Base.uniq;
    var getter = MochiKit.Base.itemgetter;
    var items = PlotKit.Base.items;

    var xvalues = map(parseFloat, map(getter(0), collapse(map(getter(1), items(this.datasets)))));
    // concatenate any passed iterable object to the xvalues
    try {
       xvalues = MochiKit.Base.concat(xvalues, includeArray);
    } catch (e) {}
    xvalues.sort(MochiKit.Base.compare);
    return uniq(xvalues);
};

PlotKit.Layout.prototype._barChartXDelta = function() {
   /*
     Work out the maximum bin size where each bin has at most one data point per bin per data set.
     The maximum possible bin size for any set is the range for sets with more than one element or the value of the element for sets with one element. Start with that value and work down.
   */
   var xbin = (this.xrange == 0) ? this.maxxval : this.xrange;
   // get the sorted bag of x values, make sure to include the min and max values.
   var xvalues = this._uniqueXValues([this.minxval, this.maxxval]);
   // find the smallest difference between x values, this corresponds to the maximum bin size.
   for (var i = 1; i < xvalues.length; i++) {
       xbin = Math.min(Math.abs(xvalues[i] - xvalues[i-1]), xbin);
   }

   this.minxdelta = xbin;
   // Now that we have the maximum bin size we need to re-adjust the xscale to take this into account.
   this.xscale = 1 / (this.xrange + this.minxdelta);
};

// Create the bars
PlotKit.Layout.prototype._evaluateBarCharts = function() {
    var setCount = this.datasetNames.length;

    var barWidth = this.minxdelta * this.xscale * this.options.barWidthFillFraction;
    var barWidthForSet = barWidth / setCount;
    var barMargin = (this.minxdelta * this.xscale - barWidth) / 2;

    // add all the rects
    this.bars = new Array();
    for (var i = 0; i < this.datasetNames.length; i++) {
        var setName = this.datasetNames[i];
        var dataset = this.datasets[setName];
        if (PlotKit.Base.isFuncLike(dataset)) continue;
        
        for (var j = 0; j < dataset.length; j++) {
            var item = dataset[j];
            var xval = parseFloat(item[0]);
            var yval = parseFloat(item[1]);
            
            // Positive bars above x axis, negative bars below x axis
            var height = Math.abs(yval * this.yscale);
            var xaxispos = 1.0 + this.minyval * this.yscale;
            var y = (yval >= 0.0) ? xaxispos - height : xaxispos;
            
            // What happens if the values go beyond our defined axis range
            if (y < 0.0) { // limit at top end of axis range
                height += y; y = 0.0;
            }
            if (y + height > 1.0) { // limit at bottom end of axis range
                height = 1.0 - y;
            }
            if (height < 0.0) height = 0.0;
            if (y > 1.0) y = 1.0;
            
            // Create the bar
            var rect = {
                x: ((xval - this.minxval) * this.xscale) + (i * barWidthForSet) + barMargin,
                w: barWidthForSet, y: y, h: height, xval: xval, yval: yval, name: setName
            };
            if ((rect.x >= 0.0) && (rect.x <= 1.0)) this.bars.push(rect);
        }
    }
};

// Create the horizontal bars
PlotKit.Layout.prototype._evaluateHorizBarCharts = function() {
    this._evaluateBarCharts();
    
    // Swap the x and y axes
    for (var i = 0; i < this.bars.length; i++) {
        var oldrect = this.bars[i];
        var newrect = {
            x: 1.0 - oldrect.y - oldrect.h, w: oldrect.h,
            y: oldrect.x, h: oldrect.w,
            xval: oldrect.xval, yval: oldrect.yval, name: oldrect.name
        };
        this.bars[i] = newrect;
    }
};

// Create the line charts
PlotKit.Layout.prototype._evaluateLineCharts = function() {
    var setCount = this.datasetNames.length;

    // add all the points
    this.points = new Array();
    for (var i = 0; i < this.datasetNames.length; i++) {
        var setName = this.datasetNames[i];
        var dataset = this.datasets[setName];
        if (PlotKit.Base.isFuncLike(dataset)) continue;

        dataset.sort(function(a, b) {
            return MochiKit.Base.compare(parseFloat(a[0]), parseFloat(b[0]));
        });
        
        var pointBeforeRange = null, lastPoint = null;

        for (var j = 0; j < dataset.length; j++) {
            var item = dataset[j];
            var xval = parseFloat(item[0]);
            var yval = parseFloat(item[1]);
            var point = {
                x: ((xval - this.minxval) * this.xscale),
                y: 1.0 - ((yval - this.minyval) * this.yscale),
                xval: xval, yval: yval, name: setName
            };

            if (point.x < 0.0) {
                pointBeforeRange = point; // potentially used in next iteration
            } else {
                if (pointBeforeRange !== null) {
                    // This is the first point in the visible range, but there is another point further left
                    // which is out of view. In this case we can interpolate the line between those points
                    // and draw the line segment starting with minxval.
                    if (point.x - pointBeforeRange.x > 0.001) {
                        var factor = point.x / (point.x - pointBeforeRange.x);
                        lastPoint = {
                            x: 0, xval: this.minxval, name: setName,
                            y: point.y - factor * (point.y - pointBeforeRange.y),
                            yval: point.yval - factor * (point.yval - pointBeforeRange.yval)
                        };
                        this._clipLineSegment(null, lastPoint);
                    }
                    pointBeforeRange = null;
                }
                
                if (point.x <= 1.0) {
                    // The point is within our visible range on the x axis.
                    this._clipLineSegment(lastPoint, point);

                } else {
                    // This is the first point outside our visible range to the right. As before, we may
                    // want to interpolate so that we can draw the line segment up to maxxval.
                    if ((lastPoint !== null) && (point.x - lastPoint.x > 0.001)) {
                        var factor = (1.0 - lastPoint.x) / (point.x - lastPoint.x);
                        this._clipLineSegment(lastPoint, {
                           x: 1, xval: this.maxxval, name: setName,
                           y: lastPoint.y + factor * (point.y - lastPoint.y),
                           yval: lastPoint.yval + factor * (point.yval - lastPoint.yval)
                        });
                    }
                    break; // Don't consider any further points in this dataset
                }
            }
            lastPoint = point;
        }
    }
};

/**
 * Used in plotting a line chart. Adds one or more points to the list of rendered points,
 * constituting a line segment, clipped to the viewable y axis range if necessary.
 */
PlotKit.Layout.prototype._clipLineSegment = function(prevPoint, thisPoint) {
    if ((prevPoint != null) && (thisPoint.x - prevPoint.x < 1e-6)) return; // Ignore points that are very close together
    
    // Function to find the intersection point between the upper limit of the viewable
    // y range and the line joining prevPoint and thisPoint.
    var maxyvalCrossing = MochiKit.Base.bind(function() {
        var factor = (0.0 - prevPoint.y) / (thisPoint.y - prevPoint.y);
        this.points.push({
            x: prevPoint.x + factor * (thisPoint.x - prevPoint.x),
            xval: prevPoint.xval + factor * (thisPoint.xval - prevPoint.xval),
            y: 0.0, yval: this.maxyval, name: thisPoint.name
        });
    }, this);
    
    // Function to find the intersection point between the lower limit of the viewable
    // y range and the line joining prevPoint and thisPoint.
    var minyvalCrossing = MochiKit.Base.bind(function() {
        var factor = (1.0 - prevPoint.y) / (thisPoint.y - prevPoint.y);
        this.points.push({
            x: prevPoint.x + factor * (thisPoint.x - prevPoint.x),
            xval: prevPoint.xval + factor * (thisPoint.xval - prevPoint.xval),
            y: 1.0, yval: this.minyval, name: thisPoint.name
        });
    }, this);
    
    if ((prevPoint != null) && (Math.abs(prevPoint.y - thisPoint.y) > 1e-6)) {
        if ((prevPoint.y < 0) && (thisPoint.y >= 0)) {
            maxyvalCrossing(); // Line segment starts above the visible y range and enters the range
        }
        if ((prevPoint.y > 1) && (thisPoint.y <= 1)) {
            minyvalCrossing(); // Line segment starts below the visible y range and enters the range
        }
        if ((prevPoint.y >= 0) && (thisPoint.y < 0)) {
            maxyvalCrossing(); // Line segment ends above the visible y range, having left the range
        }
        if ((prevPoint.y <= 1) && (thisPoint.y > 1)) {
            minyvalCrossing(); // Line segment ends below the visible y range, having left the range
        }
    }
    
    // The end of the line segment can simply be bracketed to the visible y range.
    var point = MochiKit.Base.clone(thisPoint);
    point.y = Math.max(0.0, Math.min(1.0, point.y));
    this.points.push(point);
};

// Create the pie charts
PlotKit.Layout.prototype._evaluatePieCharts = function() {
    var map = MochiKit.Base.map;
    var sum = MochiKit.Iter.sum;
    var getter = MochiKit.Base.itemgetter;

    var setCount = this.datasetNames.length;

    // we plot the y values of the first dataset
    var dataset = this.datasets[this.datasetNames[0]];
    var total = sum(map(getter(1), dataset));

    this.slices = new Array();
    var currentAngle = 0.0;
    for (var i = 0; i < dataset.length; i++) {
        var fraction = dataset[i][1] / total;
		var startAngle = currentAngle * Math.PI * 2;
		var endAngle = (currentAngle + fraction) * Math.PI * 2;
			
        var slice = {fraction: fraction,
                     xval: dataset[i][0],
                     yval: dataset[i][1],
                     startAngle: startAngle,
                     endAngle: endAngle
        };
        if (dataset[i][1] != 0) {
            this.slices.push(slice);
        }
        currentAngle += fraction;
    }
};

/**
 * Chooses a visually appealing scale to use for a chart axis. The idea is to place ticks (subdivision
 * markers) in regularly spaced intervals, where the interval is a pretty round number. If minValue is
 * negative and maxValue is positive we ensure that there is a tick at zero.
 *
 * @param minValue {float} The smallest value which must fit in the chart.
 * @param maxValue {float} The greatest value which must fit in the chart.
 * @param numTicks {int or array of int} If the value is a number, the exact number of ticks
 *      required; if the value is an array [a, b] then we search for the best-matching scale
 *      with at least a and at most b ticks.
 * @param maxTicks {int} The maximum number of ticks allowed.
 * @returns {object} An object with the following fields:
 *      ticks: {int} The number of ticks on the axis (including the zero tick and the maximum tick)
 *      spacing: {float} The interval by which the value increases on each tick
 *      min: {float} The minimum value on the axis.
 *      max: {float} The maximum value on the axis. We have max-min=spacing*(ticks-1).
 */
PlotKit.Layout.prototype._getBestScale = function(minValue, maxValue, numTicks) {
    // The spacings which we want to allow. For example, a spacing of 3 could produce a list
    // of ticks like 0, 300, 600, 900, 1200, 1500.
    var spacings = [1, 2, 2.5, 3, 4, 5];
    
    var minTicks = 5; var maxTicks = 8; // defaults if nothing else is set
    if (MochiKit.Base.isArrayLike(numTicks)) {
        if (numTicks.length >= 2) {
            minTicks = numTicks[0]; maxTicks = numTicks[1];
        } else {
            numTicks = numTicks[0];
        }
    }
    if (typeof(numTicks) == 'number') {
        minTicks = maxTicks = numTicks;
    }

    // If there's no variation in the values, force a scale with a range of 1.
    if (maxValue < minValue) {
        var tmp = maxValue; maxValue = minValue; minValue = tmp;
    }
    var valueRange = maxValue - minValue;
    if (valueRange < 1e-10) {
        maxValue = minValue + 1; valueRange = 1;
    }
    
    // Iterate over all possible combinations of number of ticks and spacings, and choose the best
    var bestFit = null;
    for (var ticks = minTicks; ticks <= maxTicks; ticks++) {
        for (var spacingIndex = 0; spacingIndex < spacings.length; spacingIndex++) {
            
            // Find the right order of magnitude for our range
            var thisRange = spacings[spacingIndex] * (ticks - 1);
            while (thisRange < valueRange) {
                thisRange *= 10;
            }
            while (thisRange >= valueRange*10) {
                thisRange /= 10;
            }
            
            // Round maxValue upwards and minValue downwards to the nearest tick. This might cause
            // us to burst the range we just chose; if that is the case, just ignore this combination
            // of spacing and number of ticks (we'd have to go up by an order of magnitude, which
            // would make it a rubbish choice of scale).
            var spacing = thisRange / (ticks - 1);
            var maxRounded = spacing * Math.ceil(maxValue / spacing);
            var minRounded = spacing * Math.floor(minValue / spacing);
            var roundedRange = maxRounded - minRounded;
            if (roundedRange > thisRange) {
                continue;
            }

            // The best fit is the one where the distance of the extreme values from the rounded extreme
            // values is smallest.
            var error = thisRange - valueRange;
            if ((bestFit == null) || (error < bestFit.error)) {
                bestFit = {ticks: ticks, spacing: spacing, max: minRounded + thisRange, min: minRounded, error: error};
            }
        }
    }

    MochiKit.Logging.log("bestFit");
    return bestFit;
};

PlotKit.Layout.prototype._evaluateLineTicksForXAxis = function() {
    var isNil = MochiKit.Base.isUndefinedOrNull;

    if (this.options.xTicks) {
        // we use use specified ticks with optional labels

        this.xticks = new Array();
        var makeTicks = function(tick) {
            var label = tick.label;
            if (isNil(label))
                label = tick.v.toString();
            if (!isNil(tick.tooltip))
                label = MochiKit.DOM.SPAN({ title: tick.tooltip }, label);
            var pos = this.xscale * (tick.v - this.minxval);
            if ((pos >= 0.0) && (pos <= 1.0)) {
                this.xticks.push([pos, label]);
            }
        };
        MochiKit.Iter.forEach(this.options.xTicks,
                              MochiKit.Base.bind(makeTicks, this));
    }
    else if (this.options.xNumberOfTicks) {
        // Automatically determine ticks
        var prec = this.options.xTickPrecision;
        var xvalues = this._uniqueXValues();
        var maxTicks = this.options.xNumberOfTicks;
        if (MochiKit.Base.isArrayLike(this.options.xNumberOfTicks)) {
            maxTicks = this.options.xNumberOfTicks[1];
        }
        this.xticks = new Array();
        
        // TODO: how do we know whether we should use the exact x values as ticks
        // or create a scale based on their minimum and maximum? Current heuristic:
        // number of unique x values > maximum number of ticks => generate scale.
        // Might be better though to examine how 'round' the actual values are.
        if (true) { //(xvalues.length > maxTicks) { // FIXME this heuristic doesn't work
            // Create one tick for each unique x value
            for (var i = 0; i < xvalues.length; i++) {
                var pos = this.xscale * (xvalues[i] - this.minxval);
                // FIXME take xTickPrecision option into account?
                //this.xticks.push([pos, MochiKit.Format.roundToFixed(xvalues[i], prec)]);
                if ((pos >= 0) && (pos <= 1)) {
                    this.xticks.push([pos, xvalues[i]]);
                }
            }
            
        } else {
            // Generate a scale based on the minimum and maximum x values
            var scale = this._getBestScale(this.minxval, this.maxxval, this.options.xNumberOfTicks);

            this.minxval = scale.min;
            this.maxxval = scale.max;

            for (var i = 0; i < scale.ticks; i++) {
                var xval = scale.min + i * scale.spacing;
                var pos = i / (scale.ticks - 1); // 0 to 1
                this.xticks.push([pos, MochiKit.Format.roundToFixed(xval, prec)]);
            }
        }
    }
};

PlotKit.Layout.prototype._evaluateLineTicksForYAxis = function() {
    var isNil = MochiKit.Base.isUndefinedOrNull;

    if (this.options.yTicks) {
        this.yticks = new Array();
        var makeTicks = function(tick) {
            var label = tick.label;
            if (isNil(label))
                label = tick.v.toString();
            if (!isNil(tick.tooltip))
                label = MochiKit.DOM.SPAN({ title: tick.tooltip }, label);
            var pos = 1.0 - (this.yscale * (tick.v - this.minyval));
            if ((pos >= 0.0) && (pos <= 1.0)) {
                this.yticks.push([pos, label]);
            }
        };
        MochiKit.Iter.forEach(this.options.yTicks,
                              MochiKit.Base.bind(makeTicks, this));
    }
    else if (this.options.yNumberOfTicks) {
        // Automatically determine ticks
        var scale = this._getBestScale(this.minyval, this.maxyval, this.options.yNumberOfTicks);
        var prec = this.options.yTickPrecision;
        
        this.minyval = scale.min;
        this.maxyval = scale.max;
        this.yticks = new Array();
        
        for (var i = 0; i < scale.ticks; i++) {
            var yval = scale.min + i * scale.spacing;
            var pos = (scale.ticks - i - 1) / (scale.ticks - 1); // 0 to 1, with 0 being the highest-value tick
            this.yticks.push([pos, MochiKit.Format.roundToFixed(yval, prec)]);
        }
    }
};

PlotKit.Layout.prototype._evaluateLineTicks = function() {
    this._evaluateLineTicksForXAxis();
    this._evaluateLineTicksForYAxis();
    this._evaluateScales(); // minxval, maxxval, minyval and maxyval might have changed
};

PlotKit.Layout.prototype._evaluateBarTicks = function() {
    this._evaluateLineTicks();
    this._barChartXDelta();
    
    var deltaRange = this.maxxval - this.minxval + this.minxdelta;
    var offset = 0.5 * this.minxdelta / deltaRange;
    var rescale = (this.maxxval - this.minxval) / deltaRange;
    var centerInBar = function(tick) {
        return [offset + tick[0] * rescale, tick[1]];
    };
    this.xticks = MochiKit.Base.map(MochiKit.Base.bind(centerInBar, this), this.xticks);

    if (this.options.barOrientation == "horizontal") {
        // swap scales
        var tempticks = this.xticks;
        this.xticks = this.yticks;
        this.yticks = tempticks;

        // we need to invert the "yaxis" (which is now the xaxis when drawn)
        var invert = function(tick) {
            return [1.0 - tick[0], tick[1]];
        }
        this.xticks = MochiKit.Base.map(invert, this.xticks);
    }
};

PlotKit.Layout.prototype._evaluatePieTicks = function() {
    var isNil = MochiKit.Base.isUndefinedOrNull;
	var formatter = MochiKit.Format.numberFormatter("#%");

    this.xticks = new Array();
	if (this.options.xTicks) {
		// make a lookup dict for x->slice values
		var lookup = new Array();
		for (var i = 0; i < this.slices.length; i++) {
			lookup[this.slices[i].xval] = this.slices[i];
		}
		
		for (var i =0; i < this.options.xTicks.length; i++) {
			var tick = this.options.xTicks[i];
			var slice = lookup[tick.v];
            var label = tick.label;
			if (slice) {
                if (isNil(label))
                    label = tick.v.toString();
                if (this.options.pieValue == "value") {
                    label += " (" + slice.yval + ")";
                } else if (this.options.pieValue != "none") {
                    label += " (" + formatter(slice.fraction) + ")";
                }
                if (!isNil(tick.tooltip))
                    label = MochiKit.DOM.SPAN({ title: tick.tooltip }, label);
				this.xticks.push([tick.v, label]);
			}
		}
	}
	else {
		// we make our own labels from all the slices
		for (var i =0; i < this.slices.length; i++) {
			var slice = this.slices[i];
			var label = slice.xval + " (" + formatter(slice.fraction) + ")";
			this.xticks.push([slice.xval, label]);
		}
	}
};

PlotKit.Layout.prototype._regenerateHitTestCache = function() {
    this.hitTestCache.xvalues = this._uniqueXValues();
    this.hitTestCache.xlookup = new Array();
    this.hitTestCache.x2maxy = new Array();

    var listMax = MochiKit.Base.listMax;
    var itemgetter = MochiKit.Base.itemgetter;
    var map = MochiKit.Base.map;
    var keys = MochiKit.Base.keys;

    // generate a lookup table for x values to y values
    for (var i = 0; i < this.datasetNames.length; i++) {
        var dataset = this.datasets[this.datasetNames[i]];
        for (var j = 0; j < dataset.length; j++) {
            var xval = dataset[j][0];
            var yval = dataset[j][1];
            if (this.hitTestCache.xlookup[xval])
                this.hitTestCache.xlookup[xval].push([yval, this.datasetNames[i]]);
            else 
                this.hitTestCache.xlookup[xval] = [[yval, this.datasetNames[i]]];
        }
    }

    for (var x in this.hitTestCache.xlookup) {
        var yvals = this.hitTestCache.xlookup[x];
        this.hitTestCache.x2maxy[x] = listMax(map(itemgetter(0), yvals));
    }
};

// --------------------------------------------------------------------
// END Internal Functions
// --------------------------------------------------------------------


// Namespace Iniitialisation

PlotKit.LayoutModule = {};
PlotKit.LayoutModule.Layout = PlotKit.Layout;

PlotKit.LayoutModule.EXPORT = [
    "Layout"
];

PlotKit.LayoutModule.EXPORT_OK = [];

PlotKit.LayoutModule.__new__ = function() {
    var m = MochiKit.Base;

    m.nameFunctions(this);

    this.EXPORT_TAGS = {
        ":common": this.EXPORT,
        ":all": m.concat(this.EXPORT, this.EXPORT_OK)
    };
};

PlotKit.LayoutModule.__new__();
MochiKit.Base._exportSymbols(this, PlotKit.LayoutModule);


