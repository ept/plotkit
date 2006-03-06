// -------------------------------------------------------------------------
// Check required components
// -------------------------------------------------------------------------

try {    
    if (typeof(PlotKit.CanvasRenderer) == 'undefined')
    {
        throw "";    
    }
} 
catch (e) {    
    throw "SweetCanvas depends on MochiKit.{Base,Color,DOM,Format} and PlotKit.{Layout, Canvas}"
}


if (typeof(PlotKit.SweetRenderer) == 'undefined') {
    PlotKit.SweetRenderer = {};
}

PlotKit.SweetRenderer = function(element, layout, options) {
    if (arguments.length > 0) {
        this.__init__(element, layout, options);
    }
};

PlotKit.SweetRenderer.NAME = "PlotKit.SweetRenderer";
PlotKit.SweetRenderer.VERSION = PlotKit.VERSION;

PlotKit.SweetRenderer.__repr__ = function() {
    return "[" + this.NAME + " " + this.VERSION + "]";
};

PlotKit.SweetRenderer.toString = function() {
    return this.__repr__();
};

// ---------------------------------------------------------------------
// Subclassing Magic
// ---------------------------------------------------------------------

PlotKit.SweetRenderer.prototype = new PlotKit.CanvasRenderer();
PlotKit.SweetRenderer.prototype.constructor = PlotKit.SweetRenderer;
PlotKit.SweetRenderer.__super__ = PlotKit.CanvasRenderer.prototype;

// ---------------------------------------------------------------------
// Constructor
// ---------------------------------------------------------------------

PlotKit.SweetRenderer.prototype.__init__ = function(element, layout, options) { 
    PlotKit.SweetRenderer.__super__.__init__.call(this, element, layout, options);
};

// ---------------------------------------------------------------------
// Extended Plotting Functions
// ---------------------------------------------------------------------

PlotKit.SweetRenderer.prototype._renderBarChart = function() {
    var bind = MochiKit.Base.bind;
    var shadowGradient = [
       Color.blackColor().colorWithAlpha(0.1).toRGBString(),
       Color.blackColor().colorWithAlpha(0.2).toRGBString(),
       Color.blackColor().colorWithAlpha(0.3).toRGBString(),
       Color.blackColor().colorWithAlpha(0.4).toRGBString()
    ];

    var prepareFakeShadow = function(context, x, y, w, h) {
        context.fillStyle = shadowGradient[0];
        context.fillRect(x-2, y-2, w+4, h+2); 
        context.fillStyle = shadowGradient[0];
        context.fillRect(x-1, y-1, w+2, h+1); 
    };

    var colorCount = this.options.colorScheme.length;
    var colorScheme =  this.options.colorScheme;
    var setNames = MochiKit.Base.keys(this.layout.datasets);
    var setCount = setNames.length;

    var chooseColor = function(name) {
        for (var i = 0; i < setCount; i++) {
            if (name == setNames[i])
                return colorScheme[i%colorCount];
        }
        return colorScheme[0];
    };

    var drawRect = function(context, bar) {
        var x = this.area.w * bar.x + this.area.x;
        var y = this.area.h * bar.y + this.area.y;
        var w = this.area.w * bar.w;
        var h = this.area.h * bar.h;

        if ((w < 1) || (h < 1))
            return;        

        context.save();

        context.shadowBlur = 5.0;
        context.shadowColor = Color.fromHexString("#888888").toRGBString();
        
        prepareFakeShadow(context, x, y, w, h);
        context.fillStyle = chooseColor(bar.name).toRGBString();
        context.fillRect(x, y, w, h);

        context.shadowBlur = 0;
        context.strokeStyle = Color.whiteColor().toRGBString();
        context.lineWidth = 2.0;

        context.strokeRect(x, y, w, h);                

        context.restore();

    };
    this._renderBarChartWrap(this.layout.bars, bind(drawRect, this));
};

PlotKit.CanvasRenderer.prototype._renderLineChart = function() {
    var context = this.element.getContext("2d");
    var colorCount = this.options.colorScheme.length;
    var colorScheme = this.options.colorScheme;
    var setNames = MochiKit.Base.keys(this.layout.datasets);
    var setCount = setNames.length;
    var bind = MochiKit.Base.bind;


    for (var i = 0; i < setCount; i++) {
        var setName = setNames[i];
        var color = colorScheme[i%colorCount];
        var strokeX = this.options.strokeColorTransform;

        // setup graphics context
        context.save();
        
        // create paths
        var makePath = function() {
            context.beginPath();
            context.moveTo(this.area.x, this.area.y + this.area.h);
            var addPoint = function(context, point) {
            if (point.name == setName)
                context.lineTo(this.area.w * point.x + this.area.x,
                               this.area.h * point.y + this.area.y);
            };
            MochiKit.Iter.forEach(this.layout.points, partial(addPoint, context), this);
            context.lineTo(this.area.w + this.area.x,
                           this.area.h + this.area.y);
            context.lineTo(this.area.x, this.area.y + this.area.h);
            context.closePath();
        };

        // faux shadow for firefox
        context.save();
        context.fillStyle = Color.blackColor().colorWithAlpha(0.2).toRGBString();
        context.translate(0, -2);
        bind(makePath, this)();        
        context.fill();
        context.restore();

        context.shadowBlur = 5.0;
        context.shadowColor = Color.fromHexString("#888888").toRGBString();
        context.fillStyle = color.toRGBString();
        context.lineWidth = 2.0;
        context.strokeStyle = Color.whiteColor().toRGBString();

        bind(makePath, this)();
        context.fill();
        bind(makePath, this)();
        context.stroke();

        context.restore();
    }
};




PlotKit.SweetRenderer.prototype._renderBackground = function() {
    var context = this.element.getContext("2d");
    context.fillStyle = Color.whiteColor().toRGBString();
    context.fillRect(0, 0, this.width, this.height);

    context.fillStyle = Color.fromHexString("#e0e3ec").toRGBString();
    context.fillRect(this.area.x, this.area.y, this.area.w, this.area.h);

    if (this.layout.style == "bar" || this.layout.style == "line") {
        context.save();
        context.strokeStyle = Color.whiteColor().toRGBString();
        context.lineWidth = 0.5;
        for (var i = 0; i < this.layout.yticks.length; i++) {
            var y = this.layout.yticks[i][0] * this.area.h + this.area.y;
            var x = this.area.x;
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x + this.area.w, y);
            context.closePath();
            context.stroke();
        }
        context.restore();
    }
};
